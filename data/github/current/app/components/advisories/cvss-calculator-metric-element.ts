import {controller, targets} from '@github/catalyst'

@controller
export default class CvssCalculatorMetricElement extends HTMLElement {
  @targets choiceElements: HTMLButtonElement[]

  public get metricCode() {
    return this.getAttribute('data-metric-code')
  }

  public selectFromClick(event: Event) {
    let element = event.target as HTMLButtonElement
    element = element.closest('.metric-selection-next-choice')!
    this.select(element, true)
  }

  public selectFromCode(value: string) {
    const elementToChoose = this.choiceElements.find(element => this.getChoiceValue(element) === value)
    this.select(elementToChoose, false)
  }

  public get selectedValue(): string | null {
    return this.getAttribute('data-selected-value')
  }

  private currentlySelectedChoice() {
    return this.querySelector('.SegmentedControl-item--selected')
  }

  private select(toSelect: HTMLButtonElement | undefined, userInitiated: boolean) {
    // We could pick whatever the calculator considers default instead, by storing the default element in search of the metric-selections
    const nextChoiceElement = toSelect || this.choiceElements[0]!

    if (this.currentlySelectedChoice() === nextChoiceElement) {
      return
    }

    for (const choice of this.choiceElements) {
      choice.parentElement?.classList.remove('SegmentedControl-item--selected')
      choice.querySelector('[aria-current]')?.setAttribute('aria-current', 'false')
    }

    nextChoiceElement.closest('li.SegmentedControl-item')?.classList.add('SegmentedControl-item--selected')
    nextChoiceElement.setAttribute('aria-current', 'true')

    const nextChoice = this.getChoiceValue(nextChoiceElement)

    this.selectedValue = nextChoice

    this.dispatchEvent(new CustomEvent<{userInitiated: boolean}>('metricSelectionChange', {detail: {userInitiated}}))
  }

  private set selectedValue(newValue: string | null) {
    if (newValue) {
      this.setAttribute('data-selected-value', newValue)
    }
  }

  private getChoiceValue(choiceElement: HTMLElement): string | null {
    return choiceElement.getAttribute('data-value')
  }
}
