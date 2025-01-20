import {target, controller} from '@github/catalyst'

@controller
export class CopilotBusinessSettingsElement extends HTMLElement {
  @target orgEnablementForm: HTMLFormElement
  @target submitButtonWithConfirmation: HTMLElement
  @target submitButtonWithoutConfirmation: HTMLElement
  @target bingGitHubChatForm: HTMLFormElement
  @target bingGitHubChatCheckbox: HTMLInputElement
  @target userFeedbackOptInForm: HTMLFormElement
  @target userFeedbackOptInCheckbox: HTMLInputElement
  @target betaFeaturesOptInForm: HTMLFormElement
  @target betaFeaturesOptInCheckbox: HTMLInputElement

  orgEnablementChanged() {
    const enablementValue = (
      this.orgEnablementForm.querySelector('input[name="copilot_enabled"]:checked') as HTMLInputElement
    )?.value

    if (enablementValue === 'disabled') {
      this.submitButtonWithConfirmation.hidden = false
      this.submitButtonWithoutConfirmation.hidden = true
    } else {
      this.submitButtonWithConfirmation.hidden = true
      this.submitButtonWithoutConfirmation.hidden = false
    }
  }

  toggleBingForGitHub() {
    this.bingGitHubChatForm.submit()
  }

  toggleUserFeedbackOptIn() {
    this.userFeedbackOptInForm.submit()
  }

  toggleBetaFeaturesOptIn() {
    this.betaFeaturesOptInForm.submit()
  }
}
