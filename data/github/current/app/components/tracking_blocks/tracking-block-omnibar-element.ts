import type AutocompleteElement from '@github/auto-complete-element'
import {attr, controller, target, findTarget} from '@github/catalyst'
import type {AppendItemMDPayload} from '@github-ui/tasklist-block-operations'

type AutocompleteEventInit = CustomEventInit & {
  target: AutocompleteElement
  relatedTarget: HTMLInputElement
  previousInputValue: string
}

@controller
export default class TrackingBlockOmnibarElement extends HTMLElement {
  @attr disabled = false
  @target autocomplete: AutocompleteElement | null

  get input(): HTMLInputElement | null {
    return (findTarget(this, 'input') || this.autocomplete?.querySelector('input')) as HTMLInputElement
  }

  connectedCallback() {
    this.#updateDisabledStatus()
  }

  adoptedCallback() {
    this.#updateDisabledStatus()
  }

  attributeChangedCallback(name: string) {
    if (name === 'data-disabled') {
      this.#updateDisabledStatus()
    }
  }

  handleAutoCompleteSelect(event: AutocompleteEventInit) {
    const input = event.target
    if (!input) return
    const inputValue = input.value.trim()
    if (!inputValue.length) return

    const payload = this.#composeAppendItemMDPayload(input, inputValue)
    this.#dispatchSubmitMDAtRest(payload)

    // Restore the original input value
    event.target.value = ''
    event.relatedTarget.focus()
  }

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const input = event.currentTarget as HTMLFormElement
    const inputFormData = new FormData(event.currentTarget as HTMLFormElement).get('tasklist_omnibar')
    const inputValue = inputFormData?.toString().trim() ?? ''

    if (inputValue) {
      const payload = this.#composeAppendItemMDPayload(input, inputValue)
      this.#dispatchSubmitMDAtRest(payload)
    }

    if (this.input) {
      this.input.value = ''
      this.input.focus()
    }
  }

  override focus() {
    if (!this.input) return

    this.input.focus()
  }

  #composeAppendItemMDPayload(input: HTMLFormElement | AutocompleteElement, inputValue: string): AppendItemMDPayload {
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

    const trackingBlock = input.closest<HTMLDivElement>('tracking-block')!
    const trackingBlocks = Array.from(comment.querySelectorAll('tracking-block'))
    const position = trackingBlocks.findIndex(block => block === trackingBlock)

    return {
      operation: 'append_item',
      position,
      value: inputValue,
      formId: form?.id || '',
    }
  }

  #dispatchSubmitMDAtRest(payload: AppendItemMDPayload) {
    this.dispatchEvent(
      new CustomEvent('tracking-block-omnibar-append', {
        bubbles: true,
        detail: payload,
      }),
    )
  }

  #updateDisabledStatus() {
    if (!this.input) return

    this.input.disabled = this.disabled
  }
}
