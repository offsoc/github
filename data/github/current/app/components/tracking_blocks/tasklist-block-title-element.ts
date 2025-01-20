import {controller, target} from '@github/catalyst'
import {transformMarkdownToHTML, type UpdateTasklistTitlePayload} from '@github-ui/tasklist-block-operations'

@controller
export default class TasklistBlockTitleElement extends HTMLElement {
  @target titleEditMode: HTMLElement | null
  @target titleViewMode: HTMLElement | null
  @target titleInput: HTMLInputElement | null
  @target titleText: HTMLElement | null

  #keysPressed: {
    Control: boolean
    Meta: boolean
  } = {
    Control: false,
    Meta: false,
  }

  handleSubmit(event: Event) {
    event.preventDefault()
    const allInputs = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('input, button'))
    const titleInputElement = this.titleInput
    const currentTitleValue = this.titleText?.textContent?.trim() ?? ''
    const inputFormData = new FormData(event.currentTarget as HTMLFormElement).get('tasklist_title')
    const inputValue = inputFormData?.toString().trim() ?? ''

    if (inputValue !== currentTitleValue) {
      // Disable inputs while saving title
      for (const input of allInputs) {
        input.toggleAttribute('disabled', true)
      }

      if (titleInputElement) {
        const payload = this.#composeUpdateTasklistTitlePayload(titleInputElement, inputValue)
        this.#dispatchSubmit(payload)
      }

      this.#handleTitleOptimisticUpdates(inputValue)
    }

    this.#hideTitleEditMode()

    // Re-enable inputs
    for (const input of allInputs) {
      input.toggleAttribute('disabled', false)
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    const {key} = event
    if (key === 'Escape') {
      event.stopPropagation()

      this.#hideTitleEditMode()
    }

    if (key === 'Meta' || key === 'Control') {
      this.#keysPressed[key] = true
    }

    if (key === 'Enter' && (this.#keysPressed.Control || this.#keysPressed.Meta)) {
      const form = this.titleEditMode?.querySelector('form')
      if (form) {
        form.dispatchEvent(new SubmitEvent('submit'))
      }
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    const {key} = event
    if (key === 'Meta' || key === 'Control') {
      this.#keysPressed[key] = false
    }
  }

  #hideTitleEditMode() {
    this.titleEditMode?.toggleAttribute('hidden', true)
    this.titleViewMode?.toggleAttribute('hidden', false)
    this.titleText?.focus()
  }

  #composeUpdateTasklistTitlePayload(input: HTMLInputElement, inputValue: string): UpdateTasklistTitlePayload {
    let comment = input.closest<HTMLDivElement>('.js-comment')!
    let form = null

    // The js-comment class is a dotcom convention that is used to determine whether the call
    // is occuring in issues#show or in a react view.
    const isReact = !comment
    if (isReact) {
      comment = input.closest<HTMLDivElement>('.markdown-body')!
    } else {
      form = comment.querySelector<HTMLFormElement>('.js-comment-update')!
    }

    const tasklistBlock = input.closest<HTMLDivElement>('tracking-block')!
    const tasklistBlocks = Array.from(comment.querySelectorAll('tracking-block'))
    const position = tasklistBlocks.findIndex(block => block === tasklistBlock)

    return {
      operation: 'update_tasklist_title',
      position,
      name: inputValue,
      formId: form?.id || '',
    }
  }

  #dispatchSubmit(payload: UpdateTasklistTitlePayload) {
    this.dispatchEvent(
      new CustomEvent('tasklist-block-title-update', {
        bubbles: true,
        detail: payload,
      }),
    )
  }

  async #handleTitleOptimisticUpdates(inputValue: string) {
    if (!this.titleText) return
    this.titleText.innerHTML = (await transformMarkdownToHTML(inputValue)) || 'Tasks'
  }
}
