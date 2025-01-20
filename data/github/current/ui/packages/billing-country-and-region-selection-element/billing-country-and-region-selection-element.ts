import {controller, target} from '@github/catalyst'
import type {PrimerMultiInputElement} from '@primer/view-components/lib/primer/forms/primer_multi_input'

@controller
export class BillingCountryAndRegionSelectionElement extends HTMLElement {
  @target regionSelectionContainer: HTMLElement | undefined
  @target defaultRegionSelect: HTMLSelectElement | undefined

  get regionMultiInputElement(): PrimerMultiInputElement | undefined {
    return this.regionSelectionContainer?.querySelector('primer-multi-input') || undefined
  }

  handleCountrySelection(event: Event) {
    const selectElement = event.currentTarget as HTMLSelectElement
    const selectedOption = selectElement.selectedOptions[0]
    const regionSelectElementName = selectedOption?.getAttribute('data-region-select-element-name')

    const regionMultiInputElement = this.regionMultiInputElement
    const defaultRegionSelect = this.defaultRegionSelect

    if (regionMultiInputElement && defaultRegionSelect) {
      regionMultiInputElement.activateField(
        regionSelectElementName ? regionSelectElementName : defaultRegionSelect.name,
      )
    }
  }
}
