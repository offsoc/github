import {controller, targets} from '@github/catalyst'

@controller
export default class MetricSelectionElement extends HTMLElement {
  @targets choiceElements: HTMLElement[]

  connectedCallback() {
    this.addEventListener('keydown', this.handleKeydown)
  }

  // Used to remember at what choice the user left off during navigation
  setTabIndex(choiceElement: HTMLElement) {
    for (const element of this.choiceElements) {
      if (element === choiceElement) {
        element.tabIndex = 0
      } else {
        element.tabIndex = -1
      }
    }
  }

  handleKeydown(event: KeyboardEvent) {
    // TODO: Refactor to use data-hotkey
    /* eslint eslint-comments/no-use: off */
    /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
    if (event.key.startsWith('Arrow')) {
      const target = event.target as HTMLElement
      let nextPossibleChoiceElement: HTMLElement | null = target

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextPossibleChoiceElement = target.nextElementSibling as HTMLElement | null
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          nextPossibleChoiceElement = target.previousElementSibling as HTMLElement | null
          break
      }

      if (nextPossibleChoiceElement) {
        this.selectedValue || this.setTabIndex(nextPossibleChoiceElement)
        nextPossibleChoiceElement.focus()
        event.preventDefault()
      }
    }
    /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
  }

  getChoiceValue(choiceElement: HTMLElement): string | null {
    return choiceElement.getAttribute('data-value')
  }

  get metricCode() {
    return this.getAttribute('data-metric-code')
  }

  get selectedValue(): string | null {
    return this.getAttribute('data-selected-value')
  }

  set selectedValue(newValue: string | null) {
    if (newValue) {
      this.setAttribute('data-selected-value', newValue)
    }
  }

  deleteSelectedValue() {
    this.removeAttribute('data-selected-value')
  }

  deselect() {
    const selectedElement = this.choiceElements.find(choiceElement => choiceElement.classList.contains('selected'))!
    if (selectedElement) {
      selectedElement.classList.remove('selected', 'btn-primary')
      selectedElement.setAttribute('aria-checked', 'false')
      selectedElement.tabIndex = -1
    }
    this.deleteSelectedValue()
  }

  select(nextChoiceElement: HTMLElement) {
    const nextChoice = this.getChoiceValue(nextChoiceElement)
    const previousChoice = this.selectedValue

    if (nextChoice === previousChoice) {
      return
    }

    if (previousChoice) {
      this.deselect()
    } else {
      // By default when there is initially no selection, the first choice is
      // the entry tab point. Or the user could have changed that by focusing
      // another choice and leaving without actually making a selection.
      // Remove that and later let it choose the new entry point.
      const lastFocusedElement = this.choiceElements.find(choiceElement => choiceElement.tabIndex >= 0)
      if (lastFocusedElement) {
        lastFocusedElement.tabIndex = -1
      }
    }

    nextChoiceElement.classList.add('selected', 'btn-primary')
    nextChoiceElement.setAttribute('aria-checked', 'true')
    nextChoiceElement.tabIndex = 0
    this.selectedValue = nextChoice
  }

  selectFromClick(event: Event) {
    this.select(event.target as HTMLElement)

    this.dispatchEvent(new CustomEvent('metricSelectionChange'))
  }

  selectFromCode(value: string) {
    if (this.selectedValue === value) {
      return
    }

    const choiceElement = this.choiceElements.find(element => this.getChoiceValue(element) === value)
    if (!choiceElement) {
      // an invalid choice that does not exist clears the selection
      this.deselect()
      this.choiceElements[0]!.tabIndex = 0
      return
    }

    this.select(choiceElement)
  }
}
