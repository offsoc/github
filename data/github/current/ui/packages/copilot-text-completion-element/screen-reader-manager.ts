import {announce} from '@github-ui/aria-live'
import {KeyboardShortcut} from './keyboard_shortcut'
import {normalizeHotkey} from '@github-ui/hotkey'

export class ScreenReaderManager {
  suggestionInspectorText: HTMLDivElement | undefined = undefined
  suggestionInspectorFullText: HTMLDivElement | undefined = undefined
  suggestionInspectorFullTextToggle: HTMLDetailsElement | undefined = undefined

  constructor(
    suggestionInspectorText: HTMLDivElement | undefined,
    suggestionInspectorFullText: HTMLDivElement | undefined,
    suggestionInspectorFullTextToggle: HTMLDetailsElement | undefined,
  ) {
    this.suggestionInspectorText = suggestionInspectorText
    this.suggestionInspectorFullText = suggestionInspectorFullText
    this.suggestionInspectorFullTextToggle = suggestionInspectorFullTextToggle
  }

  acceptSuggestion() {
    announce('Suggestion accepted.')
  }

  cancelSuggestion() {
    this.clearSuggestion()
    this.clearFullText()
  }

  clearSuggestion() {
    if (this.suggestionInspectorText) {
      this.suggestionInspectorText.textContent = ''
    }
  }

  clearFullText() {
    if (this.suggestionInspectorFullText) {
      this.suggestionInspectorFullText.textContent = ''
    }
  }

  hideFullText() {
    if (this.suggestionInspectorFullTextToggle) {
      this.suggestionInspectorFullTextToggle.removeAttribute('open')
    }
  }

  receivedCompletion(completion: string, fullText: string) {
    this.announceCompletion(completion)
    this.addCompletionToInspector(completion)
    this.addFullTextToInspector(fullText)
  }

  addCompletionToInspector(completion: string) {
    if (this.suggestionInspectorText) {
      this.suggestionInspectorText.textContent = completion
    }
  }

  addFullTextToInspector(fullText: string) {
    if (this.suggestionInspectorFullText) {
      this.suggestionInspectorFullText.textContent = fullText
    }
  }

  announceCompletion(completion: string) {
    const keyboardString = normalizeHotkey(KeyboardShortcut.accessibleInspect)
      .replace('+', ' ')
      .replace('Meta', 'Command') // Per feedback from accessibility review

    let shortenedCompletion = completion.slice(0, 250)

    let truncated = ''
    // if the completion is longer than 250 characters, truncate it at the last full word
    if (completion.length > shortenedCompletion.length) {
      const completionWords = shortenedCompletion.split(' ')
      completionWords.pop()
      shortenedCompletion = `${completionWords.join(' ')}...`

      truncated = ' truncated'
    }
    announce(`${shortenedCompletion},${truncated} suggestion. Tab to accept. ${keyboardString} to inspect.`)
  }
}
