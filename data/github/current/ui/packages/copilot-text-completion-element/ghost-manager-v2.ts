import {featureFlag} from '@github-ui/feature-flags'
import type {TextRuler} from './text-ruler'
import type {ScreenReaderManager} from './screen-reader-manager'
import {TEXT_COMPLETION_SUGGESTION_EVENT} from '@github-ui/copilot-summary-banner/constants'
import type {Ghost} from './ghost'

export class GhostManagerV2 {
  source: HTMLTextAreaElement
  ghost: Ghost
  ruler: TextRuler
  screenReaderManager: ScreenReaderManager

  copilotSummaryPlaceholder = /\[Copilot is generating a/

  suggestingCallback: () => void = () => {}
  clearingCallback: () => void = () => {}

  currentSuggestion: string | null = null
  currentRawContext: string | null = null
  private automatedChangesToUndo: number = 0
  hasControl: boolean = false
  suggestionIntroducedWordWrap: boolean = false

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

  showCompletion(completion: string, requestedSelection: number, rawContext: string | null): boolean {
    // If we've moved since the completion request started, bail
    const selection = this.source.selectionStart
    if (selection !== requestedSelection) {
      return false
    }

    this.cancelSuggestion(true)
    this.hasControl = true

    // Record current state
    this.currentSuggestion = completion
    this.currentRawContext = rawContext
    const originalSource = this.source.value

    const prefix = originalSource.substring(0, this.source.selectionStart)
    const suffix = originalSource.substring(this.source.selectionStart)

    const fullText = [prefix, completion, suffix].join('')
    this.ghost.setSuggestion(prefix, completion, suffix)
    this.source.dispatchEvent(new Event(TEXT_COMPLETION_SUGGESTION_EVENT, {bubbles: true}))
    this.screenReaderManager.receivedCompletion(completion, fullText)

    // We check both with the ghost's scrollbar setting since that's
    // the longer value (and what both textareas will match for lines)
    const hasScrollbar = this.ghost.hasScrollbar()

    // How much space do we add?
    const originalLines = this.ruler.getNumberOfLines(originalSource, hasScrollbar)
    const completionLines = this.ruler.getNumberOfLines(this.ghost.getValue(), hasScrollbar)
    const canSetNewlines = this.handleNewlineSpacing(prefix, completion, originalLines, completionLines, hasScrollbar)

    if (!canSetNewlines) {
      this.clearGhost()
      this.hasControl = false
      return false
    }

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

    this.hasControl = true
    this.insertSuggestedText()
    this.clearGhost()
    this.forceScroll()
    this.hasControl = false
    this.screenReaderManager.acceptSuggestion()
  }

  insertSuggestedText() {
    if (!this.currentSuggestion) {
      return
    }

    let pasted = true
    try {
      // execCommand is deprecated, however there isn't a replacement for it
      // and despite being deprecated, it's still widely supported.
      // https://developer.mozilla.org/en-US/docs/Web/API/document/execCommand
      const cursorLocation = this.source.selectionStart
      this.removeNewlines()
      // Ensure the cursor is back in the right spot before inserting the suggestion
      if (this.suggestionIntroducedWordWrap) {
        this.source.selectionStart = this.source.selectionEnd = cursorLocation - 1
      } else {
        this.source.selectionStart = this.source.selectionEnd = cursorLocation
      }

      if (!document.execCommand('insertText', false, this.currentSuggestion)) {
        pasted = false
      }
    } catch (e) {
      pasted = false
    }

    if (!pasted) {
      this.source.value = this.ghost.getValue()
    }
  }

  clearGhost() {
    this.ghost.reset()
    this.currentSuggestion = null
    this.currentRawContext = null
    this.clearingCallback()
  }

  cancelSuggestion(resetCursorPosition: boolean = true): boolean {
    const hadSuggestion = this.hasSuggestion()

    // We only set the ghost when there's a suggestion.
    // So if we're cancelling, it should be empty regardless our state.
    //
    // Done prior to hasSuggestion check as a safe-guard if we get in
    // a funky state, since next keypress will then "fix" it here.
    this.clearGhost()
    if (featureFlag.isFeatureEnabled('GHOST_PILOT_SCREEN_READER')) {
      this.screenReaderManager.cancelSuggestion()
    }
    if (!hadSuggestion) {
      return false
    }

    // Grab existing positioning before setting value which overwrites
    const selectionStart = this.source.selectionStart
    const selectionEnd = this.source.selectionEnd
    this.hasControl = true
    this.removeNewlines()
    if (resetCursorPosition) {
      this.source.selectionStart = selectionStart
      this.source.selectionEnd = selectionEnd
      if (this.suggestionIntroducedWordWrap) {
        this.source.selectionStart--
        this.source.selectionEnd--
      }
    }
    this.matchSize()
    this.hasControl = false
    return true
  }

  // Handle scenarios where the completion finishes a word and causes that finished word to wrap onto a new line.
  // Otherwise, the portion of the word from the prefix will appear repeated in the ghost text.
  handleNewlineSpacing(
    prefix: string,
    completion: string,
    originalLines: number,
    completionLines: number,
    hasScrollbar: boolean,
  ): boolean {
    this.suggestionIntroducedWordWrap = false
    // Grab existing positioning before setting value which overwrites
    const originalSelectionStart = this.source.selectionStart
    const originalSelectionEnd = this.source.selectionEnd
    const requiredLinesOfPadding = completionLines - originalLines

    // The way Safari handles undoing the inserted newlines is inconsistent and
    // often results in undoing the users own changes. Until we can find a
    // better way to show the suggestion, we're going to skip suggestions that
    // invole line breaks in Safari.
    // https://github.com/github/codespaces/issues/18594
    if (requiredLinesOfPadding > 0 && this.isSafari()) {
      return false
    }

    const completionFinishesWord = !!(prefix.match(/\S$/) && completion.match(/^\S/))
    if (completionFinishesWord) {
      const prefixLines = this.ruler.getNumberOfLines(prefix, hasScrollbar)
      const linesWithFinishedWord = this.ruler.getNumberOfLines(prefix + completion.split(/\s/)[0], hasScrollbar)
      const hasWordWrap = prefixLines !== linesWithFinishedWord

      if (hasWordWrap) {
        const lastWhitespace = [...prefix.matchAll(/\s/g)].pop()
        const lastWhitespaceIndex = lastWhitespace ? lastWhitespace.index : 0

        // Go ahead and insert all but 1 of the required newlines
        this.addNewlines(requiredLinesOfPadding - 1)
        // Move cursor to the end of the second to last word on the line
        // Insert a newline after the space and before the start of the word
        this.source.selectionStart = this.source.selectionEnd = lastWhitespaceIndex + 1
        this.addNewlines(1)
        // Ensure the cursor is still at the end of the prefix
        this.source.selectionStart = this.source.selectionEnd = originalSelectionStart + 1
        this.suggestionIntroducedWordWrap = true
        return true
      }
    }

    // Set the main textarea contents, tracking the value so we can
    // see if a change was from us or not.
    this.addNewlines(requiredLinesOfPadding)
    this.source.selectionStart = originalSelectionStart
    this.source.selectionEnd = originalSelectionEnd
    return true
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

  private addNewlines(n: number) {
    if (n === 0) {
      return
    }

    if (document.execCommand('insertText', false, '\n'.repeat(n))) {
      this.automatedChangesToUndo++
    }
  }

  private removeNewlines() {
    while (this.automatedChangesToUndo > 0) {
      if (document.execCommand('undo')) {
        this.automatedChangesToUndo--
      }
    }
  }

  private isSafari(): boolean {
    return navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
  }
}
