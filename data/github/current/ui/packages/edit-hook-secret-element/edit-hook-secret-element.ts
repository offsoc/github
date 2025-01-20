import {controller, target} from '@github/catalyst'

@controller
export class EditHookSecretElement extends HTMLElement {
  @target view: HTMLElement
  // edit is initially a template to avoid a form submit with an empty value before this component is connected
  @target editTemplate: HTMLTemplateElement

  private editing = false
  private viewElement: HTMLElement
  private editElement: HTMLElement

  connectedCallback() {
    // store the target elements because they will be removed from the DOM
    this.viewElement = this.view
    /* eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback */
    this.editElement = this.editTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement
  }

  toggleView() {
    const {editElement, viewElement} = this
    this.editing = !this.editing

    if (this.editing) {
      this.appendChild(editElement)
      viewElement.remove()
      editElement.querySelector('input')?.focus()
    } else {
      this.appendChild(viewElement)
      if (this.contains(editElement)) {
        // It's important that this be _removed_ to avoid an empty value in the form submission if not editing the secret
        this.removeChild(editElement)
      }
    }
  }
}
