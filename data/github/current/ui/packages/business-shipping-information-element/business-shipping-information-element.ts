import {controller, target} from '@github/catalyst'

@controller
export class BusinessShippingInformationElement extends HTMLElement {
  @target sameAsBillingCheckbox: HTMLInputElement | undefined
  @target sameAsBillingSubmitButton: HTMLButtonElement | undefined
  @target sameAsBillingCancelButton: HTMLButtonElement | undefined
  @target shippingInformationForm: HTMLFormElement | undefined
  @target editShippingInformationButton: HTMLButtonElement | undefined
  @target formContainer: HTMLDivElement | undefined
  @target detailsContainer: HTMLDivElement | undefined

  handleShippingInformationForm(event: Event) {
    const checkbox = event.currentTarget as HTMLInputElement

    if (this.sameAsBillingSubmitButton) this.sameAsBillingSubmitButton.hidden = !checkbox.checked
    if (this.sameAsBillingCancelButton) this.sameAsBillingCancelButton.hidden = !checkbox.checked
    if (this.shippingInformationForm) this.shippingInformationForm.hidden = checkbox.checked
  }

  showEditShippingInformationForm() {
    if (this.editShippingInformationButton) this.editShippingInformationButton.hidden = true
    if (this.formContainer) this.formContainer.hidden = false
    if (this.detailsContainer) this.detailsContainer.hidden = true
  }

  cancelShippingInformationEdit() {
    if (this.editShippingInformationButton) this.editShippingInformationButton.hidden = false
    if (this.sameAsBillingCheckbox) this.sameAsBillingCheckbox.checked = false
    if (this.shippingInformationForm) this.shippingInformationForm.hidden = false
    if (this.sameAsBillingSubmitButton) this.sameAsBillingSubmitButton.hidden = true
    if (this.sameAsBillingCancelButton) this.sameAsBillingCancelButton.hidden = true
    if (this.formContainer) this.formContainer.hidden = true
    if (this.detailsContainer) this.detailsContainer.hidden = false
  }
}
