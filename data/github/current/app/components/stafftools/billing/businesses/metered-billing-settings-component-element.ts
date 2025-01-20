import {controller, target} from '@github/catalyst'

@controller
class MeteredBillingSettingsComponentElement extends HTMLElement {
  @target meteredPlanCheckbox: HTMLInputElement
  @target meteredViaAzureCheckbox: HTMLInputElement
  @target azureSubscriptionIDContainer: HTMLElement
  @target meteredViaAzureCheckboxContainer: HTMLElement
  showAzureSubscriptionId: boolean

  handleMeteredViaAzureClick() {
    if (this.meteredPlanCheckbox?.checked) {
      this.meteredViaAzureCheckbox.checked = true
    }
    this.toggleAzureSubscriptionId()
  }

  toggleAzureSubscriptionId() {
    this.showAzureSubscriptionId = this.meteredPlanCheckbox?.checked || this.meteredViaAzureCheckbox?.checked
    this.renderOutput()
  }

  renderOutput = () => {
    this.azureSubscriptionIDContainer.hidden = !this.showAzureSubscriptionId
  }
}
