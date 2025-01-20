import {controller, target} from '@github/catalyst'

@controller
class ReopenReasonSelectorElement extends HTMLElement {
  @target reopenButton: HTMLButtonElement
  @target selectedIconContainer: HTMLElement
  @target reopenButtonText: HTMLElement

  get #commentField(): HTMLInputElement {
    return this.reopenButton.form!.querySelector<HTMLInputElement>('.js-comment-field')!
  }

  handleSelection(event: CustomEvent) {
    const selection = event.detail.relatedTarget as HTMLElement
    const commentText = selection.getAttribute('data-comment-text')!
    const defaultText = selection.getAttribute('data-default-action-text')!
    const icon = selection.querySelector('[data-reopen-reason-icon]') as HTMLElement
    const hasCommentContent = Boolean(this.#commentField.value.trim())

    this.selectedIconContainer.innerHTML = icon.innerHTML
    this.reopenButton.setAttribute('data-comment-text', commentText)
    this.reopenButtonText.setAttribute('data-default-action-text', defaultText)
    this.reopenButtonText.textContent = hasCommentContent ? commentText : defaultText
  }
}
