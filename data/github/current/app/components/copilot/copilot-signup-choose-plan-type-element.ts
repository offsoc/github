import {controller, target} from '@github/catalyst'

@controller
class CopilotSignupChoosePlanTypeElement extends HTMLElement {
  @target planIndividual: HTMLElement | null
  @target planBusiness: HTMLElement
  @target planEnterprise: HTMLElement

  @target planIndividualSelector: HTMLInputElement | null
  @target planBusinessSelector: HTMLInputElement
  @target planEnterpriseSelector: HTMLInputElement

  showPlanIndividual() {
    if (!this.planIndividual || !this.planIndividualSelector) {
      return
    }

    this.hideAll()
    this.planIndividual.hidden = false
    this.planIndividualSelector.classList.add('copilot-signup-selected-plan-type')
  }

  showPlanBusiness() {
    this.hideAll()
    this.planBusiness.hidden = false
    this.planBusinessSelector.classList.add('copilot-signup-selected-plan-type')
  }

  showPlanEnterprise() {
    this.hideAll()
    this.planEnterprise.hidden = false
    this.planEnterpriseSelector.classList.add('copilot-signup-selected-plan-type')
  }

  hideAll() {
    this.planBusiness.hidden = true
    this.planEnterprise.hidden = true
    this.planBusinessSelector.classList.remove('copilot-signup-selected-plan-type')
    this.planEnterpriseSelector.classList.remove('copilot-signup-selected-plan-type')

    if (this.planIndividual && this.planIndividualSelector) {
      this.planIndividual.hidden = true
      this.planIndividualSelector.classList.remove('copilot-signup-selected-plan-type')
    }
  }
}
