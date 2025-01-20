import {TemplateInstance, propertyIdentityOrBooleanAttribute} from '@github/template-parts'
import {type TextScore, compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import {controller, target} from '@github/catalyst'

import type VirtualFilterInputElement from '../../assets/modules/github/virtual-filter-input-element'
import type VirtualListElement from '../../assets/modules/github/virtual-list-element'
import VirtualListboxFocusState from '../../assets/modules/github/virtual-listbox-focus-state'
import {requestSubmit} from '@github-ui/form-utils'
import type {MemexProjectPickerInterstitialElement} from './project_list/memex-project-picker-interstitial-element'

type ProjectSuggestion = {
  number: number
  name: string
  owner: string
  selected: boolean
}

type SelectionDiff = {
  [number: number]: ProjectSuggestion
}

/**
 * Project picker element used in the repository.
 * Controlls the virtual list and filter input.
 *
 * Key resposibilities:
 * - Rendering: rendering list items, showing loading and empty states
 * - Tracking selection: tracks diff of selected & deselected items, serializing the state for form submission
 * - Syncing list visibility with virtual rendering lifecycle
 */
@controller
export class MemexProjectPickerElement extends HTMLElement {
  @target filterElement: VirtualFilterInputElement<ProjectSuggestion>
  @target list: VirtualListElement<ProjectSuggestion>
  @target itemTemplate: HTMLTemplateElement
  @target selectionTemplate: HTMLTemplateElement
  @target submitContainer: HTMLElement
  @target blankslateAllProjects: HTMLElement
  @target blankslateRecentProjects: HTMLElement
  @target all: HTMLElement
  @target filterInput: HTMLInputElement
  @target loadingIndicator: SVGElement
  #focus: VirtualListboxFocusState<ProjectSuggestion>

  loading = true
  isAllProjectsMode = false

  recentSrc = ''
  allSrc = ''

  selectionDiff: SelectionDiff = {}

  hashedItemScore = new Map<ProjectSuggestion, TextScore>()

  multiselect = true

  renderedProjects = new Map<number, ProjectSuggestion>()

  open = false

  connectedCallback() {
    this.didLoad()
    this.multiselect = this.getAttribute('data-multiselect') === 'true'
    this.recentSrc = this.filterElement.src
    this.allSrc = this.all.getAttribute('data-src') || ''

    this.filterElement.filter = (item: ProjectSuggestion, query: string) => {
      if (!query) return true

      const itemText = item.name.trim().toLowerCase()
      const textScore = fuzzyScore(itemText, query)

      // Support querying by project number or link (ex: https://github.com/orgs/github/projects/6253)
      // by scoring the item number against the query and vice versa
      const itemNumber = item.number.toString()
      const numberInQueryScore = fuzzyScore(query, itemNumber)
      const queryInNumberScore = fuzzyScore(itemNumber, query)

      const score = Math.max(textScore, numberInQueryScore, queryInNumberScore)

      // Constructing the hash<item, TextScore> needed for the sorting function
      // during the filter process to avoid doing the score again when filtering is done
      const key = score > 0 ? {score, text: itemText} : null
      if (key) this.hashedItemScore.set(item, key)
      return score > 0
    }

    if (this.list) {
      this.#focus = new VirtualListboxFocusState(this.list)
    }

    const detailsMenu = this.closest('details.select-menu') as HTMLDetailsElement
    if (detailsMenu && this.list) {
      detailsMenu.addEventListener('toggle', this.toggleProjectMenu.bind(this))
    }

    this.filterElement.addEventListener('virtual-filter-input-filtered', () => this.filterDone())

    this.filterElement.input?.addEventListener('keydown', e => {
      if ((e as KeyboardEvent).key === 'Enter') e.preventDefault()
    })
  }

  filterDone() {
    this.list.sort((a, b) => {
      const itemB = this.hashedItemScore.get(b)
      const itemA = this.hashedItemScore.get(a)

      if (!itemA && !itemB) return 0
      if (!itemA) return 1
      if (!itemB) return -1

      return compare(itemA, itemB)
    })
  }

  switchMode() {
    const hasQuery = this.filterInput.value.length > 0
    if (hasQuery && this.filterElement.src !== this.allSrc) {
      this.switchToAllProjectsMode()
    } else if (!hasQuery && this.filterElement.src !== this.recentSrc) {
      this.switchToRecentProjectMode()
    }
  }

  switchToAllProjectsMode() {
    this.filterElement.src = this.allSrc
    this.filterElement.loading = 'eager'
    this.isAllProjectsMode = true
  }

  switchToRecentProjectMode() {
    this.filterElement.src = this.recentSrc
    this.filterElement.loading = 'eager'
    this.isAllProjectsMode = false
  }

  showAllProjectsBlankslate() {
    this.blankslateAllProjects.hidden = false
  }

  hideAllProjectsBlankslate() {
    this.blankslateAllProjects.hidden = true
  }

  showRecentProjectsBlankslate() {
    this.blankslateRecentProjects.hidden = false
  }

  hideRecentProjectsBlankslate() {
    this.blankslateRecentProjects.hidden = true
  }

  showBlankslate() {
    this.isAllProjectsMode ? this.showAllProjectsBlankslate() : this.showRecentProjectsBlankslate()
  }

  hideBlankslate() {
    this.isAllProjectsMode ? this.hideAllProjectsBlankslate() : this.hideRecentProjectsBlankslate()
  }

  showLoadingIndicator() {
    this.loadingIndicator.removeAttribute('hidden')
  }

  hideLoadingIndicator() {
    this.loadingIndicator.setAttribute('hidden', 'true')
  }

  willLoad() {
    this.loading = true
    this.showLoadingIndicator()
    this.hideAllProjectsBlankslate()
    this.hideRecentProjectsBlankslate()
    this.filterElement.reset()
  }

  didLoad() {
    this.loading = false
    this.hideLoadingIndicator()
  }

  willRenderItems() {
    if (this.loading) return
    if (this.list.size === 0) {
      this.showBlankslate()
    } else {
      this.hideBlankslate()
    }
  }

  renderItem(event: CustomEvent) {
    // append the element to virtual list fragment container
    // this is the way you define what to render
    const project = {
      number: event.detail.item.number as number,
      name: event.detail.item.name as string,
      owner: event.detail.item.owner as string,
      selected: this.isProjectSelected(event.detail.item),
      table_icon_hidden: event.detail.item.template,
      template_icon_hidden: !event.detail.item.template,
    }

    event.detail.fragment.append(this.createItem(project))
    if (!this.renderedProjects.has(project.number)) this.renderedProjects.set(project.number, project)
  }

  toggleItem(event: MouseEvent) {
    // handle clicks originated only from a checkbox inside a label
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'checkbox') return

    const projectElement = event.target.closest('[data-project-number]')
    if (!projectElement) return

    const projectNumber = parseInt(projectElement.getAttribute('data-project-number') || '', 10)
    const project = this.renderedProjects.get(projectNumber)
    if (!project) return
    if (!this.multiselect) this.resetSelectionDiff()

    const selected = projectElement.getAttribute('aria-checked') || ''
    if (selected === 'true') {
      // Deselecting
      project.selected = false
      this.selectionDiff[projectNumber] = project
      projectElement.setAttribute('aria-checked', 'false')
    } else {
      // Selecting
      project.selected = true
      this.selectionDiff[projectNumber] = project
      projectElement.setAttribute('aria-checked', 'true')
    }

    this.serializeSelection()
    if (!this.multiselect) {
      this.triggerUpdate(event)
    }
  }

  resetSelectionDiff() {
    this.selectionDiff = {}
  }

  // returns whether or not the item was successfully removed
  removeItem(name: string, number: number, owner: string): boolean {
    const project = this.renderedProjects.get(number) || {
      number,
      name,
      owner,
      selected: false,
      table_icon_hidden: false,
      template_icon_hidden: false,
    }

    this.selectionDiff[number] = project
    this.serializeSelection()

    return true
  }

  triggerUpdate(event: Event) {
    // Clear the input when the menu is closed
    if (this.multiselect) this.filterElement.clear()

    const form = document.getElementById('js-project-picker-form') as HTMLFormElement
    const interstitial = form.querySelector<MemexProjectPickerInterstitialElement>('memex-project-picker-interstitial')

    if (!this.multiselect && interstitial) {
      interstitial.show(event)
      return
    }

    // Check to see if there are changes before submitting
    for (const el of form.elements) {
      if ((el.getAttribute('name') || '').indexOf('projects_changes') > -1) {
        requestSubmit(form)
        return
      }
    }
  }

  serializeSelection() {
    this.submitContainer.replaceChildren()

    for (const [_, project] of Object.entries(this.selectionDiff))
      this.submitContainer.append(this.createSubmitSelection(project))
  }

  private isProjectSelected(suggestion: ProjectSuggestion) {
    return (this.selectionDiff[suggestion.number] ?? suggestion).selected
  }

  private toggleProjectMenu(event: Event) {
    const details = event.target as HTMLDetailsElement
    if (!details || details.getAttribute('data-button-type') === 'create') return
    const detailsMenu = event.target as HTMLDetailsElement
    if (detailsMenu.open) {
      this.open = true
      return this.onMenuOpen()
    }
    this.open = false
    if (this.multiselect) this.triggerUpdate(event)
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  private onMenuOpen() {
    // workaround the 0 size of the virtual list in case it's hidden behind the details menu
    this.list.update()

    // request the data again if the dataset was empty
    if (this.loading === false && this.list.size === 0) {
      this.filterElement.load()
    }
  }

  private createSubmitSelection(project: ProjectSuggestion) {
    return new TemplateInstance(
      this.selectionTemplate,
      {
        name: `projects_changes[${project.number.toString()}]`,
        checked: project.selected,
        projectNumber: project.number,
        projectName: project.name,
        projectOwner: project.owner,
        type: project.selected ? 'checkbox' : 'hidden',
      },
      propertyIdentityOrBooleanAttribute,
    )
  }

  private createItem(project: ProjectSuggestion) {
    return new TemplateInstance(this.itemTemplate, project, propertyIdentityOrBooleanAttribute)
  }
}
