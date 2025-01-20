import {TemplateInstance, propertyIdentityOrBooleanAttribute} from '@github/template-parts'
import {controller, target} from '@github/catalyst'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {softNavigate} from '@github-ui/soft-navigate'

import type VirtualFilterInputElement from '../../assets/modules/github/virtual-filter-input-element'
import type VirtualListElement from '../../assets/modules/github/virtual-list-element'
import VirtualListboxFocusState from '../../assets/modules/github/virtual-listbox-focus-state'
import {fetchPoll} from '@github-ui/fetch-utils'

type ProjectSuggestion = {
  id: number
  name: string
  owner: string
  type: string
  selected: boolean
}

type SelectionDiff = {
  [project_type: string]: {[id: string]: boolean}
}

/**
 * Project picker element used in the sidebar.
 * Controls the virtual list and filter input.
 *
 * Key responsibilities:
 * - Rendering: rendering list items, showing loading and empty states
 * - Tracking selection: tracks diff of selected & deselected items, serializing the state for form submission
 * - Syncing list visibility with virtual rendering lifecycle
 */
@controller
class ProjectPickerElement extends HTMLElement {
  @target input: VirtualFilterInputElement<ProjectSuggestion>
  @target list: VirtualListElement<ProjectSuggestion>
  @target itemTemplate: HTMLTemplateElement
  @target selectionTemplate: HTMLTemplateElement
  @target submitContainer: HTMLElement
  @target blankslate: HTMLElement
  @target loadingIndicator: SVGElement
  @target errorNotice: HTMLElement
  #focus: VirtualListboxFocusState<ProjectSuggestion>

  loading = true

  selectionDiff: SelectionDiff = {
    memex_project: {},
    project: {},
  }

  connectedCallback() {
    this.didLoad()
    this.loadChanges()
    this.input.filter = (item: ProjectSuggestion, query: string) => {
      return item && item.name.toLowerCase().trim().includes(query.toLowerCase())
    }

    if (this.list) {
      this.#focus = new VirtualListboxFocusState(this.list)
    }

    // workaround the 0 size of the virtual list in case it's hidden behind the details menu
    const detailsMenu = this.closest<HTMLDetailsElement>('details.select-menu')

    if (detailsMenu && this.list) {
      detailsMenu.addEventListener('toggle', event => {
        if (detailsMenu.open === false) {
          this.menuClose(event)
          this.input.clear()
          return
        }
        this.list.update()
      })
    }
  }

  willLoad() {
    this.loading = true
    this.loadingIndicator.removeAttribute('hidden')
    this.blankslate.hidden = true
    this.errorNotice.hidden = true

    // Resetting input here instead on changeTab because setting loading = true will prevent displaying the blankslate
    this.input.reset()
  }

  didLoad() {
    this.loading = false
    this.loadingIndicator.setAttribute('hidden', 'true')
  }

  didError() {
    this.errorNotice.hidden = false
  }

  /**
   * Given an event, if the key pressed is printable (has a length of 1)
   * then stopPropagation of the key and focus the input (which will append the key to the value)
   * of the input
   */
  focusInputAndAppendKeyValue(event: KeyboardEvent) {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.key.length === 1) {
      event.stopPropagation()
      if (this.input.input) {
        this.input.input.focus()
      }
    }
  }

  changeTab(event: CustomEvent) {
    const tabSource = event.detail.relatedTarget.getAttribute('data-src') || ''
    // changing the src for the virtual input will trigger a new request for data
    this.input.src = tabSource
    // changing loading to eager to make sure to new request is made
    this.input.loading = 'eager'
  }

  willRenderItems() {
    this.blankslate.hidden = this.list.size > 0 || this.loading
  }

  renderItem(event: CustomEvent) {
    const isProjectSelected = this.isProjectSelected(event.detail.item)
    const frag = new TemplateInstance(
      this.itemTemplate,
      {
        id: event.detail.item.id,
        project_icon_hidden: event.detail.item.type !== 'project',
        table_icon_hidden: event.detail.item.type !== 'memex_project' || event.detail.item.template,
        template_icon_hidden: !event.detail.item.template,
        name: event.detail.item.name,
        owner: event.detail.item.owner,
        type: event.detail.item.type,
        search_slug: event.detail.item.search_slug,
        selected: isProjectSelected,
      },
      propertyIdentityOrBooleanAttribute,
    )

    // append the element to virtual list fragment container
    // this is the way you define what to render
    event.detail.fragment.append(frag)
  }

  isProjectSelected(suggestion: ProjectSuggestion) {
    return this.selectionDiff[suggestion.type]![suggestion.id] ?? suggestion.selected
  }

  toggleItem(event: MouseEvent) {
    // handle clicks originated only from a checkbox inside a label
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'checkbox') return

    const projectElement = event.target.closest('[data-project-id]')
    if (!projectElement) {
      return
    }

    const projectId = parseInt(projectElement.getAttribute('data-project-id') || '', 10)
    const projectType = projectElement.getAttribute('data-project-type') || ''

    const selected = projectElement.getAttribute('aria-checked') || ''
    if (selected === 'true') {
      // Deselecting
      this.selectionDiff[projectType]![projectId] = false
      projectElement.setAttribute('aria-checked', 'false')
    } else {
      // Selecting
      this.selectionDiff[projectType]![projectId] = true
      projectElement.setAttribute('aria-checked', 'true')
    }

    this.serializeSelection()
  }

  filterByProject(event: MouseEvent) {
    if (!(event.target instanceof HTMLElement)) return

    const projectElement = event.target.closest('[data-project-id]')
    if (!projectElement) {
      return
    }

    const projectSearchSlug = projectElement.getAttribute('data-project-search-slug')?.toLocaleLowerCase() || ''

    const currentSearchQueryString = this.list.getAttribute('data-search-query') || ''
    let queryComponents = currentSearchQueryString.split(' ') || []

    const selected = projectElement.getAttribute('aria-checked') || ''
    if (selected === 'true') {
      // Deselecting
      // Remove the project search and exclusion from the query
      queryComponents = queryComponents.filter(comp => !comp.toLowerCase().endsWith(`project:${projectSearchSlug}`))
    } else {
      // Selecting
      // Remove exclusion if it exists
      queryComponents = queryComponents.filter(comp => comp.toLowerCase() !== `-project:${projectSearchSlug}`)

      const needsAdding = !queryComponents.some(comp => comp.toLowerCase() === `project:${projectSearchSlug}`)
      if (needsAdding) {
        queryComponents.push(`project:${projectSearchSlug}`)
      }
    }

    window.location.search = `?q=${encodeURIComponent(queryComponents.join(' '))}`
  }

  menuClose(event: Event) {
    const menuCloseAction = this.list.getAttribute('data-close-action')

    if (menuCloseAction === 'addIssuesToMemexProjects') {
      this.addIssuesToMemexProjects(event)
    }
  }

  createSubmitSelection(projectType: string, projectId: string, selected: boolean) {
    const name = `${
      projectType === 'memex_project' ? 'issue_memex_project_ids' : 'issue_project_ids'
    }[${projectId.toString()}]`

    const el = new TemplateInstance(
      this.selectionTemplate,
      {name, checked: selected, type: selected ? 'checkbox' : 'hidden'},
      propertyIdentityOrBooleanAttribute,
    )

    return el
  }

  serializeSelection() {
    this.submitContainer.replaceChildren()

    for (const [projectId, selected] of Object.entries(this.selectionDiff.project!)) {
      this.submitContainer.append(this.createSubmitSelection('project', projectId, selected))
    }

    for (const [projectId, selected] of Object.entries(this.selectionDiff.memex_project!)) {
      this.submitContainer.append(this.createSubmitSelection('memex_project', projectId, selected))
    }
  }

  loadChanges() {
    // When creating a new issue, we need to preopulate selectionDiff with the values from the form.
    // Those values are present if new issue is created (issues#new).
    const regex = /(\S+)\[([0-9]+)\]/
    for (const input of Array.from(this.submitContainer.children)) {
      const name = input.getAttribute('name')
      if (name === null) continue

      const matches = name.match(regex)
      if (!matches) continue

      const inputFieldName = matches[1]
      const projectId = parseInt(matches[2]!, 10)

      switch (inputFieldName) {
        case 'issue_project_ids':
          this.selectionDiff['project']![projectId] = true
          break
        case 'issue_memex_project_ids':
          this.selectionDiff['memex_project']![projectId] = true
          break
        default:
          throw new Error(`Unknown checkbox name: ${input.getAttribute('name')}`)
      }
    }
  }
  // adds selected issues to memex projects while triaging
  async addIssuesToMemexProjects(event: Event) {
    const currentTarget = event.currentTarget as Element

    const checkedIssues = Array.from(document.querySelectorAll<HTMLInputElement>('.js-issues-list-check:checked'))
    const memexProjects = this.selectionDiff.memex_project
    let selectedMemexProjects = 0

    const form: HTMLFormElement | null =
      currentTarget.closest('.js-project-picker-form') || currentTarget.querySelector('.js-project-picker-form')

    if (!form) {
      return
    }

    const formData = new FormData(form || undefined)
    // clear form data
    formData.delete('query')
    // add selected issues
    for (const issueEl of checkedIssues) {
      formData.append('issues[]', issueEl.value)
    }
    // add selected memex projects and remove entries created by serializeSelection
    for (const projectId in memexProjects) {
      formData.delete(`issue_memex_project_ids[${projectId}]`)
      if (memexProjects[projectId] === true) {
        formData.append(`projects[${projectId}]`, 'on')
        selectedMemexProjects++
      }
    }

    if (selectedMemexProjects === 0) {
      return
    }

    const toolbar = currentTarget.closest<HTMLElement>('.js-issues-toolbar-triage')!
    // toggles triage spinner and error
    toolbar.querySelector<HTMLElement>('.js-issue-triage-spinner')!.hidden = false
    toolbar.querySelector<HTMLElement>('.js-issue-triage-error')!.hidden = true

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const responseError = new Error()
        const statusText = response.statusText ? ` ${response.statusText}` : ''
        responseError.message = `HTTP ${response.status}${statusText}`
        throw responseError
      }

      const data = await response.json()
      const jobResponse = await fetchPoll(data.job.url, {headers: {accept: 'application/json'}})

      if (jobResponse.ok) {
        document.addEventListener(
          SOFT_NAV_STATE.SUCCESS,
          () => {
            this.showFlashMessage(
              new TemplateInstance(
                document.querySelector<HTMLTemplateElement>(`#js-triage-add-issues-to-memex-projects-form-success`)!,
                {
                  selectedIssueCountLabel: checkedIssues.length,
                  selectedIssuesLabel: `${checkedIssues.length > 1 ? 's have' : ' has'}`,
                  selectedMemexProjectsLabel: `${selectedMemexProjects} project${selectedMemexProjects > 1 ? 's' : ''}`,
                },
              ),
            )
          },
          {once: true},
        )
      } else {
        const responseError = new Error()
        const statusText = jobResponse.statusText ? ` ${jobResponse.statusText}` : ''
        responseError.message = `HTTP ${jobResponse.status}${statusText}`
        throw responseError
      }

      softNavigate(window.location.href)
    } catch (err) {
      // toggles triage spinner and error
      toolbar.querySelector<HTMLElement>('.js-issue-triage-spinner')!.hidden = true
      toolbar.querySelector<HTMLElement>('.js-issue-triage-error')!.hidden = false
    }
  }

  showFlashMessage(template: TemplateInstance) {
    const node = document.importNode(template, true)
    const flashContainer = document.querySelector<HTMLElement>('#js-flash-container')!
    for (const child of flashContainer.children) {
      flashContainer.removeChild(child)
    }
    flashContainer.appendChild(node)
  }
}
