import {controller, attr} from '@github/catalyst'

@controller
class SlashCommandToolbarButtonElement extends HTMLElement {
  @attr command = ''

  // Trigger the menu from the markdown toolbar button
  triggerMenu(event: PointerEvent | KeyboardEvent) {
    if (!(event.target instanceof Element)) return
    if (event.type === 'keyup' && (event as KeyboardEvent).key !== 'Enter') return

    const container = event.target.closest<HTMLElement>('.js-previewable-comment-form')
    if (!container) return

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea.js-comment-field')
    if (!textarea) return

    textarea.focus()

    // similar to the `insertText` utility behavior, but with different cursor positioning
    const point = textarea.selectionEnd || 0
    const value = textarea.value
    const beginning = value.substring(0, point)
    const remaining = value.substring(point)

    let text = `/${this.command}`
    let cursorPosition = point + text.length + 1 // place cursor after the slash

    if (beginning) {
      text = `\n/${this.command}`

      if (value[point - 1] === '\n') {
        text = `/${this.command}`
        cursorPosition -= 1 // we're on a newline so we don't need an extra position
      }
    }

    let execCommandSucceeded = false
    try {
      execCommandSucceeded = document.execCommand('insertText', false, text)
    } catch (e) {
      execCommandSucceeded = false
    }

    if (!execCommandSucceeded) {
      textarea.value = beginning + text + remaining
    }

    textarea.selectionStart = cursorPosition
    textarea.selectionEnd = cursorPosition

    textarea.dispatchEvent(
      new CustomEvent('input', {
        bubbles: true,
        cancelable: true,
      }),
    )
  }
}
