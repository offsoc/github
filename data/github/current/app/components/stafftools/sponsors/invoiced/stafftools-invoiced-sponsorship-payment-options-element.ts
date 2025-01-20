import {controller, target} from '@github/catalyst'

@controller
class StafftoolsInvoicedSponsorshipPaymentOptionsElement extends HTMLElement {
  @target paymentOptions: HTMLElement

  showPaymentOptions() {
    this.paymentOptions.hidden = false
  }

  hidePaymentOptions() {
    this.paymentOptions.hidden = true
  }
}
