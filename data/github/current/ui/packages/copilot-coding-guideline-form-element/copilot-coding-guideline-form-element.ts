import {controller, target, targets} from '@github/catalyst'

@controller
export class CopilotCodingGuidelineFormElement extends HTMLElement {
  @target rowTemplate!: HTMLTemplateElement
  @target blankslate!: HTMLElement
  @target list!: HTMLElement
  @target modalPathInput!: HTMLInputElement
  @target closeModalButton!: HTMLElement
  @target formErrorMessage!: HTMLElement
  @targets rows!: HTMLElement[]

  connectedCallback() {
    this.addEventListener('coding-guideline-path-marked-for-destroy', () => {
      // Check if there are visible rows. 1 row is always not "hidden" but it is
      // in a template tag so the user cannot see it. So if there is just 1
      // visible row that means only the template is there and no visible rows
      // are present so we can show the blankslate
      if (this.rows.filter(row => !row.hidden).length === 1) {
        this.blankslate.hidden = false
      }
    })
  }

  addRow(event: Event) {
    event.preventDefault()
    this.formErrorMessage.hidden = true

    if (this.isValid()) {
      this.blankslate.hidden = true
      this.closeModalButton.click()

      // TODO: Handle a deleted row event and show the blankslate if there are no rows left.

      const path = this.modalPathInput.value
      // New rows needs a unique index so that Rails can group form fields together correctly.
      // It is not necessary that the indexes are sequential, they just need to be unique. So we can use the current time
      // in milliseconds as a unique index.
      const currentTimeInMs = Date.now()

      // Replace the index placeholder. The index is used in the form input `name` attribute so that Rails can properly
      // group form inputs together for arrays. This way we can send an array of paths to the server for accepts_nested_attributes_for.
      const newRow = this.processTemplate(this.rowTemplate.innerHTML, {
        index: currentTimeInMs.toString(),
        path: path || '',
      })
      this.list.insertAdjacentHTML('beforeend', newRow)
      this.modalPathInput.value = ''
    } else {
      this.formErrorMessage && (this.formErrorMessage.hidden = false)
    }
  }

  isValid() {
    const hasNoSpacesRegex = /^[^\s]*$/
    return this.modalPathInput.value.length > 0 && hasNoSpacesRegex.test(this.modalPathInput.value)
  }

  // Replace {{key}} with value in the template string.
  processTemplate(template: string, variables: Record<string, string>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
      result = result.replaceAll(`{{${key}}}`, value)
    }
    return result
  }
}
