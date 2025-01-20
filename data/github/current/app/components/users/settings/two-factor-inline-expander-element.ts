import {attr, controller, target} from '@github/catalyst'

@controller
class TwoFactorInlineExpanderElement extends HTMLElement {
  static attrPrefix = ''
  @attr inlineContentSelector: string
  @attr expandWithAnchor: string
  @target expander: HTMLButtonElement | HTMLInputElement
  #expanded = false

  connectedCallback() {
    // if window.location anchor matches expandWithAnchor call toggleInlineEdit
    if (this.expandWithAnchor && window.location.hash === `#${this.expandWithAnchor}` && !this.#expanded) {
      this.toggleInlineEdit()
    }
  }

  toggleInlineEdit() {
    if (this.inlineContentSelector === '' || !this.expander) return

    this.#expanded = !this.#expanded
    this.#setExpanderText()
    if (this.#expanded) {
      document.getElementsByClassName(this.inlineContentSelector)[0]!.removeAttribute('hidden')
    } else {
      document.getElementsByClassName(this.inlineContentSelector)[0]!.setAttribute('hidden', 'true')
    }
  }

  #setExpanderText() {
    if (this.expander instanceof HTMLButtonElement) {
      const action = this.#expanded ? 'Hide' : 'Edit'
      const label = this.expander.getAttribute('aria-label') || ''
      // trim the button label from the front of the aria-label (e.g. 'Edit' or 'Hide'), then add the new action
      const labelParts = label.split(' ').slice(1)
      labelParts.unshift(action)
      const newLabel = labelParts.join(' ')

      this.expander.getElementsByClassName('Button-label')[0]!.textContent = this.#expanded ? 'Hide' : 'Edit'
      this.expander.setAttribute('aria-expanded', this.#expanded.toString())
      this.expander.setAttribute('aria-label', newLabel)
    } else if (this.expander instanceof HTMLInputElement) {
      this.expander.value = this.#expanded ? 'Hide' : 'Edit'
    }
  }
}
