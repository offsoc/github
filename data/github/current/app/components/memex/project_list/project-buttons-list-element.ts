import {controller, target} from '@github/catalyst'
import {requestSubmit} from '@github-ui/form-utils'

export const enum ActionType {
  Create = 'create',
  Link = 'link',
}
@controller
class ProjectButtonsListElement extends HTMLElement {
  @target splitButtonContainer: HTMLDetailsElement
  @target actionType: HTMLInputElement
  @target newProjectButton: HTMLButtonElement
  @target newProject: HTMLDivElement
  @target linkProject: HTMLDivElement
  @target newProjectInput: HTMLInputElement
  @target linkProjectInput: HTMLInputElement
  @target linkingMenu: HTMLDetailsElement

  connectedCallback() {
    this.updateActionType(ActionType.Link)
    this.newProjectButton.addEventListener('click', () => this.handleNewProjectFromLinkingMenuClick())
  }

  handleSplitButtonClick() {
    if (this.actionType.getAttribute('value') === ActionType.Create) {
      this.submitForm()
    }
  }

  handleNewProjectFromLinkingMenuClick() {
    this.updateActionType(ActionType.Create)
    this.submitForm()
  }

  select(event: CustomEvent) {
    const domElement = (event.detail.relatedTarget as Element).querySelector<HTMLInputElement>(
      'input[name="button_state"]',
    )
    if (domElement === this.newProjectInput) {
      this.newProject.hidden = false
      this.linkProject.hidden = true
      this.linkingMenu.hidden = true
      this.updateActionType(ActionType.Create)
      this.splitButtonContainer.setAttribute('data-button-type', ActionType.Create)
    } else if (domElement === this.linkProjectInput) {
      this.newProject.hidden = true
      this.linkProject.hidden = false
      this.linkingMenu.hidden = false
      this.updateActionType(ActionType.Link)
      this.splitButtonContainer.setAttribute('data-button-type', ActionType.Link)
    }
  }

  private submitForm() {
    const form = document.getElementById('js-project-picker-form') as HTMLFormElement
    requestSubmit(form)
  }

  private updateActionType(actionType: ActionType) {
    this.actionType.setAttribute('value', actionType)
  }
}
