import {controller} from '@github/catalyst'
@controller
class SelectAllElement extends HTMLElement {
  hiddenSelectAllCheckbox: HTMLInputElement
  selectAllOnPage: HTMLInputElement

  connectedCallback() {
    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    this.hiddenSelectAllCheckbox = document.getElementById('hidden-select-all-checkbox')! as HTMLInputElement
    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    this.selectAllOnPage = document.getElementById('select-all-on-page')! as HTMLInputElement

    this.selectAllOnPage.addEventListener('change', () => {
      // If the user deselects any item (or clicks the deselects checkbox), we want to deselect our checkbox as well
      if (!this.selectAllOnPage.checked) {
        this.hiddenSelectAllCheckbox.checked = false
      }
    })
  }

  selectAll() {
    if (this.selectAllOnPage.checked) {
      // If the user has already selected all visible items, we want bulk-actions.ts to listen to us checking hiddenSelectAllCheckbox
      this.hiddenSelectAllCheckbox.classList.add('data-check-all-item')
      this.hiddenSelectAllCheckbox.click()
      this.hiddenSelectAllCheckbox.classList.remove('data-check-all-item')
    } else {
      // If the user has not already selected all visible items, checking selectAllOnPage will trigger an update for us
      this.hiddenSelectAllCheckbox.click()
      this.selectAllOnPage.click()
    }
  }

  clearSelection() {
    this.hiddenSelectAllCheckbox.checked = false
    if (this.selectAllOnPage.checked) {
      this.selectAllOnPage.click()
    }
  }
}
