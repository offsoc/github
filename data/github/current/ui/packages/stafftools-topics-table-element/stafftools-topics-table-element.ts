import {controller, target, targets} from '@github/catalyst'

@controller
export class StafftoolsTopicsTableElement extends HTMLElement {
  @target headerCheckbox: HTMLInputElement | undefined
  @targets rowCheckboxes: HTMLInputElement[] | undefined
  @target submit: HTMLButtonElement | undefined

  toggleHeader() {
    if (!this.headerCheckbox || !this.rowCheckboxes) {
      return
    }

    let shouldCheck = true
    if (this.headerCheckbox.checked === false) {
      shouldCheck = false
    }

    for (const check of this.rowCheckboxes) {
      check.checked = shouldCheck
    }
  }

  toggleRow() {
    if (!this.headerCheckbox || !this.rowCheckboxes) {
      return
    }

    // get the count of checked rows. if every row is checked, the header box should be checked.
    // break early if any are unchecked and at least one other was checked, because it'll be indeterminate
    // at that point.
    let checkedCount = 0
    for (const check of this.rowCheckboxes) {
      if (check.checked) {
        checkedCount++
      } else if (checkedCount > 0) {
        break
      }
    }

    switch (checkedCount) {
      case this.rowCheckboxes.length:
        this.headerCheckbox.checked = true
        this.headerCheckbox.indeterminate = false
        break

      case 0:
        this.headerCheckbox.checked = false
        this.headerCheckbox.indeterminate = false
        break

      default:
        this.headerCheckbox.checked = false
        this.headerCheckbox.indeterminate = true
        break
    }
  }
}
