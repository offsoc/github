import {controller, target} from '@github/catalyst'
import {html, render} from '@github-ui/jtml-shimmed'

@controller
export class CopyProjectElement extends HTMLElement {
  @target ownerPicker: HTMLElement
  @target ownerPickerMenu: HTMLElement

  @target ownerPickerInclude: HTMLElement | null

  @target submitButton: HTMLButtonElement

  connectedCallback() {
    if (this.ownerPickerInclude) {
      // if we see an <include-fragment> element we should disable the form
      // submit until we have some items in the <detail-menu>
      this.submitButton.disabled = true

      // subscribing to this event in JS as this event doesn't seem to
      // propagate via catalyst when subscribing in the DOM
      // (probably because the DOM node is replaced with the response from the server)
      this.ownerPickerInclude.addEventListener('include-fragment-replaced', () => {
        this.setInitialSummary()
      })

      this.ownerPickerInclude.addEventListener('error', () => {
        const container = this.ownerPickerInclude
        if (!container) {
          return
        }

        container.textContent = ''

        render(
          html`<div class="color-fg-danger my-3 mx-auto" style="text-align: center;">Something went wrong</div>`,
          container,
        )
      })
    }
  }

  // emulate the DetailsElement behaviour for rendering the selected item in the <details>
  // element once we have items from the IncludeFragmentElement
  setInitialSummary() {
    const button = this.ownerPicker.querySelector('[data-menu-button]')
    if (!button) {
      return
    }

    const itemCount = this.ownerPickerMenu.querySelectorAll('[role="menuitem"], [role="menuitemradio"]')
    if (itemCount.length === 0) {
      button.textContent = 'No owners '
      // additional space here to add gap between text and toggle
      return
    }

    const checked = this.ownerPickerMenu.querySelector('input[checked]')
    if (!checked) {
      return
    }

    const menuItem = checked.closest('[role="menuitem"], [role="menuitemradio"]')
    if (!menuItem) {
      return
    }

    const text = labelText(menuItem)
    if (text) {
      button.textContent = text
    } else {
      const htmlValue = labelHTML(menuItem)
      if (htmlValue) button.innerHTML = htmlValue
    }

    this.submitButton.disabled = false
  }
}

function labelText(el: Element | null): string | null {
  if (!el) return null
  const textEl = el.hasAttribute('data-menu-button-text') ? el : el.querySelector('[data-menu-button-text]')

  if (!textEl) return null
  return textEl.getAttribute('data-menu-button-text') || textEl.textContent
}

function labelHTML(el: Element | null): string | null {
  if (!el) return null
  const contentsEl = el.hasAttribute('data-menu-button-contents') ? el : el.querySelector('[data-menu-button-contents]')

  return contentsEl ? contentsEl.innerHTML : null
}
