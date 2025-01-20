import {controller, target} from '@github/catalyst'
import {verifiedFetch} from '@github-ui/verified-fetch'

@controller
class CopilotBusinessSignupSeatManagementElement extends HTMLElement {
  @target seatManagement: HTMLElement
  @target seatsForSelectedSpinner: HTMLElement
  @target permissionsSubmitButton: HTMLInputElement
  @target enableForAllOption: HTMLInputElement
  @target enableForSelectedOption: HTMLInputElement

  connectedCallback() {
    this.enableForSelectedOption.disabled = false
    this.enableForAllOption.disabled = false
    this.permissionsSubmitButton.disabled = false
  }

  async showSeatManagement() {
    this.permissionsSubmitButton.disabled = true
    this.enableForAllOption.disabled = true
    this.#showSpinner()

    const params = new URLSearchParams(window.location.search)
    const organization = params.get('org')
    const enterprise = params.get('enterprise')

    if (organization) {
      const response = await this.setSeatManagementConfig(organization)
      if (response.ok) {
        this.seatManagement.hidden = false
        this.permissionsSubmitButton.hidden = true
      } else {
        this.permissionsSubmitButton.disabled = false
        // The seat management config will stay as unconfigured
        return new Error('Failed to update the seat management permission.')
      }
    } else if (enterprise) {
      const response = await this.setChatEnabledConfig(enterprise)
      if (response.ok) {
        this.seatManagement.hidden = false
        this.permissionsSubmitButton.hidden = true
      } else {
        this.permissionsSubmitButton.disabled = false
        return new Error('Failed to update the chat enabled permission.')
      }
    }

    this.#hideSpinner()
  }

  hideSeatManagement() {
    this.seatManagement.hidden = true
    this.permissionsSubmitButton.hidden = false
    this.permissionsSubmitButton.disabled = false
  }

  #showSpinner() {
    this.seatsForSelectedSpinner.style.cssText = 'display:inline !important'
  }

  #hideSpinner() {
    this.seatsForSelectedSpinner.style.cssText = 'none !important'
    this.enableForAllOption.disabled = false
  }

  private async setSeatManagementConfig(organization: string) {
    const formData = new FormData()
    formData.append('copilot_permissions', 'enabled_for_selected')
    return await verifiedFetch(`/organizations/${organization}/settings/copilot/seat_management_permissions`, {
      method: 'POST',
      body: formData,
    })
  }

  private async setChatEnabledConfig(enterprise: string) {
    const formData = new FormData()
    formData.append('copilot_enabled', 'selected_organizations')
    return await verifiedFetch(`/enterprises/${enterprise}/settings/update_copilot_enablement`, {
      method: 'PUT',
      body: formData,
    })
  }
}
