import {controller, target} from '@github/catalyst'

@controller
export class CohortWidgetElement extends HTMLElement {
  @target cohortSelect!: HTMLSelectElement
  @target totalCustomersOutput!: HTMLElement
  @target onboardedCustomersOutput!: HTMLElement
  @target remainingCustomersOutput!: HTMLElement
  @target customerIdsOutput!: HTMLElement

  connectedCallback() {
    if (this.cohortSelect) {
      this.cohortSelect.addEventListener('change', this.updateCohortInfo.bind(this))
    }
  }

  updateCohortInfo(event: Event) {
    const selectedOption = (<HTMLSelectElement>event.target).selectedOptions[0]

    if (selectedOption) {
      const totalCustomers = selectedOption.getAttribute('data-total-customers')
      const onboardedCount = selectedOption.getAttribute('data-onboarded-count')
      const remainingCount = selectedOption.getAttribute('data-remaining-count')
      const newCustomerIds = selectedOption.getAttribute('data-new-customer-ids')

      this.totalCustomersOutput.textContent = `Total Customers: ${totalCustomers}` ?? ''
      this.onboardedCustomersOutput.textContent = `Onboarded Customers: ${onboardedCount}` ?? ''
      this.remainingCustomersOutput.textContent = `Remaining Customers: ${remainingCount}` ?? ''

      const newCustomerIdsInput = document.getElementById('customer_ids') as HTMLInputElement
      if (newCustomerIdsInput) {
        newCustomerIdsInput.value = newCustomerIds ?? ''
      }

      const remainingCountInput = document.getElementById('remaining_count') as HTMLInputElement
      if (remainingCountInput) {
        remainingCountInput.value = remainingCount ?? ''
      }
    } else {
      this.totalCustomersOutput.textContent = 'No cohort selected.'
      this.onboardedCustomersOutput.textContent = ''
      this.remainingCustomersOutput.textContent = ''

      const newCustomerIdsInput = document.getElementById('customer_ids') as HTMLInputElement
      if (newCustomerIdsInput) {
        newCustomerIdsInput.value = ''
      }

      const remainingCountInput = document.getElementById('remaining_count') as HTMLInputElement
      if (remainingCountInput) {
        remainingCountInput.value = ''
      }
    }
  }
}
