import {controller, target} from '@github/catalyst'

@controller
class BillingTransactionComponentElement extends HTMLElement {
  @target toggleLineItemsButton: HTMLButtonElement
  @target lineItemsContainer: HTMLElement
  #showLineItems = false

  toggleLineItems() {
    this.#showLineItems = !this.#showLineItems
    this.#renderOutput()
  }

  #renderOutput = () => {
    this.toggleLineItemsButton.classList.toggle('open', this.#showLineItems)
    this.lineItemsContainer.hidden = !this.#showLineItems
  }
}
