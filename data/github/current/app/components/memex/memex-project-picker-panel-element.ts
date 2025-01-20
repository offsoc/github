import {controller, target} from '@github/catalyst'
import {TemplateInstance, propertyIdentityOrBooleanAttribute} from '@github/template-parts'
import type {SelectPanelExperimentalElement, ItemActivatedEvent} from '../primer/experimental/select-panel-element'
import {type TextScore, fuzzyScore} from '@github-ui/fuzzy-filter'
import {requestSubmit} from '@github-ui/form-utils'

@controller
export class MemexProjectPickerPanelElement extends HTMLElement {
  @target selectPanel: SelectPanelExperimentalElement
  @target selectionTemplate: HTMLTemplateElement
  @target submitContainer: HTMLElement

  @target linkInterstitial: HTMLDialogElement
  @target linkInterstitialSubmitButton: HTMLButtonElement
  @target linkInterstitialCancelButton: HTMLButtonElement

  @target unlinkInterstitial: HTMLDialogElement
  @target unlinkInterstitialSubmitButton: HTMLDialogElement
  @target unlinkInterstitialCancelButton: HTMLButtonElement

  private hashedItemScore = new Map<HTMLElement, TextScore>()

  #abortController: AbortController
  #addOrRemoveAbortController: AbortController | null = null

  connectedCallback() {
    this.selectPanel.filterFn = this.#filterFn.bind(this)
    const {signal} = (this.#abortController = new AbortController())
    this.addEventListener('beforeItemActivated', this, {signal})

    const closeObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const elem = entry.target
        if (!entry.isIntersecting && (elem === this.linkInterstitial || elem === this.unlinkInterstitial)) {
          // disconnect add/remove listeners when the interstitial closes
          this.#addOrRemoveAbortController?.abort()
          this.#addOrRemoveAbortController = null
        }
      }
    })

    if (this.linkInterstitial && this.unlinkInterstitial) {
      closeObserver.observe(this.linkInterstitial)
      closeObserver.observe(this.unlinkInterstitial)
    } else {
      const mutationObserver = new MutationObserver(() => {
        if (this.linkInterstitial) closeObserver.observe(this.linkInterstitial)
        if (this.unlinkInterstitial) closeObserver.observe(this.unlinkInterstitial)

        mutationObserver.disconnect()
      })

      mutationObserver.observe(this, {childList: true, subtree: true})
    }
  }

  get filterInput(): HTMLInputElement {
    return this.selectPanel.filterInputTextField
  }

  get open(): boolean {
    return this.selectPanel.open
  }

  get list(): HTMLElement | null {
    return this.selectPanel.list
  }

  disconnectedCallback() {
    this.#abortController.abort()
  }

  resetSelectionDiff() {
    this.submitContainer.replaceChildren()
  }

  #filterFn(element: HTMLElement, query: string) {
    if (!query) return true

    const itemText = (element.getAttribute('data-name') || '').trim().toLowerCase()
    const textScore = fuzzyScore(itemText, query)

    // Support querying by project number or link (ex: https://github.com/orgs/github/projects/6253)
    // by scoring the item number against the query and vice versa
    const itemNumber = element.getAttribute('data-number') || ''
    const numberInQueryScore = fuzzyScore(query, itemNumber)
    const queryInNumberScore = fuzzyScore(itemNumber, query)

    const score = Math.max(textScore, numberInQueryScore, queryInNumberScore)

    // Constructing the hash<item, TextScore> needed for the sorting function
    // during the filter process to avoid doing the score again when filtering is done
    const key = score > 0 ? {score, text: itemText} : null
    if (key) this.hashedItemScore.set(element, key)
    return score > 0
  }

  handleEvent(event: Event) {
    if (event.type === 'beforeItemActivated') {
      if (this.#submitOnActivation()) {
        // don't check or uncheck until we've gotten an answer from the interstitial
        event.preventDefault()
      }

      const itemActivatedEvent = event as CustomEvent<ItemActivatedEvent>
      const elem = itemActivatedEvent.detail.item
      const number = parseInt(elem.getAttribute('data-number') || '', 10)
      const name = elem.getAttribute('data-name') || ''
      const owner = elem.getAttribute('data-owner') || ''

      this.#addOrRemoveItem(name, number, owner, itemActivatedEvent.detail.checked)
    }
  }

  addItem(name: string, number: number, owner: string): boolean {
    return this.#addOrRemoveItem(name, number, owner, true)
  }

  removeItem(name: string, number: number, owner: string): boolean {
    return this.#addOrRemoveItem(name, number, owner, false)
  }

  // returns whether or not the item was successfully removed
  #addOrRemoveItem(name: string, number: number, owner: string, checked: boolean): boolean {
    const updateFormInputs = () => {
      const existingInput = this.submitContainer.querySelector(`[data-project-number="${number}"]`)

      if (existingInput) {
        existingInput.remove()
      } else {
        this.submitContainer.append(this.#createSubmitSelection(name, number, owner, checked))
      }
    }

    const interstitialSubmitListener = (e: Event) => {
      e.stopPropagation()
      e.preventDefault()

      updateFormInputs()

      if (this.#submitOnActivation()) {
        this.triggerUpdate()
      }
    }

    const {signal} = (this.#addOrRemoveAbortController = new AbortController())

    if (checked) {
      if (this.linkInterstitial) {
        this.linkInterstitialSubmitButton.addEventListener('click', interstitialSubmitListener, {once: true, signal})
        this.linkInterstitial.showModal()
      } else {
        updateFormInputs()

        if (this.#submitOnActivation()) {
          this.triggerUpdate()
        }
      }
    } else {
      if (this.unlinkInterstitial) {
        this.unlinkInterstitialSubmitButton.addEventListener('click', interstitialSubmitListener, {once: true, signal})
        this.unlinkInterstitial.showModal()
      } else {
        updateFormInputs()

        if (this.#submitOnActivation()) {
          this.triggerUpdate()
        }
      }
    }

    return false
  }

  #createSubmitSelection(name: string, number: number, owner: string, checked: boolean) {
    return new TemplateInstance(
      this.selectionTemplate,
      {
        name: `projects_changes[${number}]`,
        checked,
        projectNumber: number,
        projectName: name,
        projectOwner: owner,
        type: checked ? 'checkbox' : 'hidden',
      },
      propertyIdentityOrBooleanAttribute,
    )
  }

  triggerUpdate() {
    const form = document.getElementById('js-project-picker-form') as HTMLFormElement
    if (form) requestSubmit(form)
  }

  linkInterstitialClose() {
    this.linkInterstitial.close()
  }

  unlinkInterstitialClose() {
    this.unlinkInterstitial.close()
  }

  get #multiselect(): boolean {
    return this.selectPanel.selectVariant === 'multiple'
  }

  #submitOnActivation(): boolean {
    return !this.#multiselect
  }
}
