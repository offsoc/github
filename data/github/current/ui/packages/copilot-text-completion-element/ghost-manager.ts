import type {TextRuler} from './text-ruler'
import type {ScreenReaderManager} from './screen-reader-manager'
import {TEXT_COMPLETION_SUGGESTION_EVENT} from '@github-ui/copilot-summary-banner/constants'
import type {Ghost} from './ghost'

export class GhostManager {
  source: HTMLTextAreaElement
  ghost: Ghost
  ruler: TextRuler
  screenReaderManager: ScreenReaderManager

  copilotSummaryPlaceholder = /\[Copilot is generating a/

  suggestingCallback: () => void = () => {}
  clearingCallback: () => void = () => {}

  currentSuggestion: string | null = null
  currentRawContext: string | null = null
  originalSource: string | null = null
  alteredSource: string | null = null
  hasControl: boolean = false

  constructor(source: HTMLTextAreaElement, ghost: Ghost, ruler: TextRuler, screenReaderManager: ScreenReaderManager) {
    this.source = source
    this.ghost = ghost
    this.ruler = ruler
    this.screenReaderManager = screenReaderManager
  }

  hasSuggestion(): boolean {
    return !!this.currentSuggestion
  }

  shouldCompleteHere(): boolean {
    const {selectionStart, selectionEnd, value} = this.source
    const nextChar = value.charAt(selectionStart)

    const isHighlighted = selectionStart !== selectionEnd
    const isEmpty = value.length === 0
    const isAtNewline = nextChar === '\n'
    const isAtVeryEnd = selectionStart === value.length
    // The 'is-uploading' class is added while an upload is in progress
    // https://github.com/github/github/blob/60fdfdc9e9c686ffb89ce6acf64f1a349132d03c/app/assets/modules/github/upload/batch-upload.ts#L102
    const waitingOnFileUpload = this.source.closest('file-attachment')?.classList.contains('is-uploading')
    const waitingOnCopilotSummary = this.source.value.match(this.copilotSummaryPlaceholder)

    return (
      !isHighlighted && !isEmpty && !waitingOnFileUpload && !waitingOnCopilotSummary && (isAtNewline || isAtVeryEnd)
    )
  }

  // Sometimes we receive change events from external modification of the textarea.
  // Occasionally we get them from simple navigation while our own spacing is applied.
  // In the first case we should keep the text, in the second we shouldn't.
  // This decides which it is.
  changeWasOurs(): boolean {
    return this.source.value === this.alteredSource
  }

  noticeChange() {
    if (this.changeWasOurs()) {
      // Change came from us so we want a full cancel
      this.cancelSuggestion()
    } else {
      // Change was external to us, so just whack the ghost
      this.clearGhost()
      this.clearRememberedSources()
    }
  }

  showCompletion(completion: string, requestedSelection: number, rawContext: string | null): boolean {
    this.cancelSuggestion()
    this.hasControl = true

    // If we've moved since the completion request started, bail
    const selection = this.source.selectionStart
    if (selection !== requestedSelection) {
      return false
    }

    // Record current state
    this.currentSuggestion = completion
    this.currentRawContext = rawContext
    this.originalSource = this.source.value

    const prefix = this.originalSource.substring(0, this.source.selectionStart)
    const suffix = this.originalSource.substring(this.source.selectionStart)

    const fullText = [prefix, completion, suffix].join('')
    // Set the ghost
    this.ghost.setSuggestion(prefix, completion, suffix)
    this.source.dispatchEvent(new Event(TEXT_COMPLETION_SUGGESTION_EVENT, {bubbles: true}))
    this.screenReaderManager.receivedCompletion(completion, fullText)

    // We check both with the ghost's scrollbar setting since that's
    // the longer value (and what both textareas will match for lines)
    const hasScrollbar = this.ghost.hasScrollbar()

    // How much space do we add?
    const originalLines = this.ruler.getNumberOfLines(this.originalSource, hasScrollbar)
    const completionLines = this.ruler.getNumberOfLines(this.ghost.getValue(), hasScrollbar)
    const spacers = '\n'.repeat(completionLines - originalLines)

    // Set the main textarea contents, tracking the value so we can
    // see if a change was from us or not.
    this.alteredSource = [prefix, spacers, suffix].join('')
    this.source.value = this.alteredSource
    this.source.selectionStart = this.source.selectionEnd = selection

    this.handleWordWrap(prefix, completion, suffix, originalLines, completionLines, hasScrollbar)

    this.matchSize()
    this.suggestingCallback()
    setTimeout(() => {
      this.hasControl = false
    }, 200)
    return true
  }

  acceptSuggestion() {
    if (!this.currentSuggestion) {
      return
    }

    this.insertSuggestedText()
    this.clearGhost()
    this.clearRememberedSources()
    this.forceScroll()
    this.screenReaderManager.acceptSuggestion()
  }

  insertSuggestedText() {
    if (!this.currentSuggestion) {
      return
    }

    // Need to calculate this before we change anything
    // then use it after we've applied already
    const newSelection = this.source.selectionStart + this.currentSuggestion.length

    let pasted = true
    try {
      // execCommand is deprecated, however there isn't a replacement for it
      // and despite being deprecated, it's still widely supported.
      // https://developer.mozilla.org/en-US/docs/Web/API/document/execCommand
      if (!document.execCommand('insertText', false, this.currentSuggestion)) {
        pasted = false
      }
    } catch (e) {
      pasted = false
    }

    if (!pasted) {
      this.source.value = this.ghost.getValue()
    }

    this.source.selectionStart = this.source.selectionEnd = newSelection
  }

  clearGhost() {
    this.ghost.reset()
    this.currentSuggestion = null
    this.currentRawContext = null
    this.clearingCallback()
  }

  clearRememberedSources() {
    this.originalSource = null
    this.alteredSource = null
  }

  cancelSuggestion(): boolean {
    const hadSuggestion = this.hasSuggestion()

    // We only set the ghost when there's a suggestion.
    // So if we're cancelling, it should be empty regardless our state.
    //
    // Done prior to hasSuggestion check as a safe-guard if we get in
    // a funky state, since next keypress will then "fix" it here.
    this.clearGhost()
    this.screenReaderManager.cancelSuggestion()
    if (!hadSuggestion) {
      return false
    }

    // Grab existing positioning before setting value which overwrites
    const selectionStart = this.source.selectionStart
    const selectionEnd = this.source.selectionEnd

    this.source.value = this.originalSource || ''
    this.source.selectionStart = selectionStart
    this.source.selectionEnd = selectionEnd

    this.clearRememberedSources()
    this.forceScroll()

    return true
  }

  // Handle scenarios where the completion finishes a word and causes that finished word to wrap onto a new line.
  // Otherwise, the portion of the word from the prefix will appear repeated in the ghost text.
  handleWordWrap(
    prefix: string,
    completion: string,
    suffix: string,
    originalLines: number,
    completionLines: number,
    hasScrollbar: boolean,
  ) {
    const completionFinishesWord = !!(prefix.match(/\S$/) && completion.match(/^\S/))
    if (completionFinishesWord) {
      const prefixLines = this.ruler.getNumberOfLines(prefix, hasScrollbar)
      const linesWithFinishedWord = this.ruler.getNumberOfLines(prefix + completion.split(/\s/)[0], hasScrollbar)
      const hasWordWrap = prefixLines !== linesWithFinishedWord
      if (hasWordWrap) {
        const lastWhitespace = [...prefix.matchAll(/\s/g)].pop()
        const lastWhitespaceIndex = lastWhitespace ? lastWhitespace.index : 0
        // Insert a newline as we start the word the completion is finishing.
        const prefixWithNewline = `${prefix.substring(0, lastWhitespaceIndex)}\n${prefix.substring(
          lastWhitespaceIndex + 1,
        )}`
        const spacersMinusNewline = '\n'.repeat(Math.max(completionLines - originalLines - 1, 0))
        this.source.value = this.alteredSource = [prefixWithNewline, spacersMinusNewline, suffix].join('')
        this.source.selectionStart = this.source.selectionEnd = // Ensure the cursor is still at the end of the prefix
          lastWhitespaceIndex + 1 + prefix.substring(lastWhitespaceIndex + 1).length
      }
    }
  }

  matchSize() {
    this.ghost.matchStyles(this.source)
    this.forceScroll()
  }

  // Sometimes text changes seem to alter scroll positioning without events.
  // This forces them to line up again.
  private forceScroll() {
    this.ghost.forceScroll(this.source.scrollTop)
  }
}
