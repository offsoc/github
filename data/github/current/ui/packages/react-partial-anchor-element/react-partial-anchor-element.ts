import {controller, target} from '@github/catalyst'

@controller
export class ReactPartialAnchorElement extends HTMLElement {
  @target anchor: HTMLElement | undefined
  @target template: HTMLTemplateElement | undefined

  connectedCallback() {
    setTimeout(() => this.renderTemplate())
  }

  renderTemplate() {
    const template = this.template
    if (!template) return

    // Move template contents to be a direct child, which will cause the partial to render
    const content = template.content
    this.appendChild(content)

    // We no longer need the template wrapper, so remove it
    this.removeChild(template)
  }
}
