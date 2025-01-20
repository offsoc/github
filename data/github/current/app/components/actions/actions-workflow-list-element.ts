import {controller, target} from '@github/catalyst'

@controller
class ActionsWorkflowListElement extends HTMLElement {
  @target pinIconTemplate: HTMLTemplateElement
  @target pinSlashIconTemplate: HTMLTemplateElement

  connectedCallback(): void {}

  pinButtonEnter(event: Event) {
    const pinButton = event.target as HTMLElement
    const pinButtonIcon = pinButton.getElementsByTagName('svg')[0]!
    const pinSlashIcon = this.pinSlashIconTemplate.content.firstElementChild!.cloneNode(true) as HTMLTemplateElement

    // Copy over all the classes from the original pin icon
    for (const className of pinButtonIcon.classList) {
      if (className !== 'octicon-pin') {
        pinSlashIcon.classList.add(className)
      }
    }
    pinButton.replaceChild(pinSlashIcon, pinButtonIcon)
  }

  pinButtonLeave(event: Event) {
    const pinSlashButton = event.target as HTMLElement
    const pinSlashButtonIcon = pinSlashButton.getElementsByTagName('svg')[0]!
    const pinIcon = this.pinIconTemplate.content.firstElementChild!.cloneNode(true) as HTMLTemplateElement

    // Copy over all the classes from the pin slash icon
    for (const className of pinSlashButtonIcon.classList) {
      if (className !== 'octicon-pin-slash') {
        pinIcon.classList.add(className)
      }
    }
    pinSlashButton.replaceChild(pinIcon, pinSlashButtonIcon)
  }
}
