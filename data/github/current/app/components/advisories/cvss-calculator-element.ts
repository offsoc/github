import {controller, targets} from '@github/catalyst'
import type CvssV4SingleMetricSelectionElement from './cvss-calculator-metric-element'

@controller
export default class CvssCalculatorElement extends HTMLElement {
  // Each individual metric tracked in here
  @targets singleMetricSelections: CvssV4SingleMetricSelectionElement[]

  public get vectorString(): string {
    let vectorString = 'CVSS:4.0'

    for (const metricSelectionNextElement of this.singleMetricSelections) {
      const metricCode = metricSelectionNextElement.metricCode
      const selectedValue = metricSelectionNextElement.selectedValue || '_'

      vectorString += `/${metricCode}:${selectedValue}`
    }

    return vectorString
  }

  public set vectorString(vectorString: string) {
    const keyValuePairs: string[] = vectorString.split('/').slice(1)
    const metricSelections: {[index: string]: string} = keyValuePairs.reduce((selectionHash, keyValuePair) => {
      const [metricCode, value] = keyValuePair.split(':')

      return {
        ...selectionHash,
        [metricCode!]: value,
      }
    }, {})

    for (const metricSelectionNextElement of this.singleMetricSelections) {
      const metricCode: string = metricSelectionNextElement.metricCode!
      const selectionCode = metricSelections[metricCode]!

      metricSelectionNextElement.selectFromCode(selectionCode)
    }
  }

  async handleMetricSelectionChange(customEvent: CustomEvent<{userInitiated: boolean}>) {
    const userInitiated = customEvent.detail.userInitiated
    this.dispatchEvent(
      new CustomEvent<{userInitiated: boolean}>('vectorStringSelectionChange', {detail: {userInitiated}}),
    )
  }
}
