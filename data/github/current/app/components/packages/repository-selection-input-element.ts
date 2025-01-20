import {TemplateInstance, propertyIdentityOrBooleanAttribute} from '@github/template-parts'
import type VirtualFilterInputElement from '../../assets/modules/github/virtual-filter-input-element'
import {controller, target} from '@github/catalyst'
import type VirtualListElement from '../../assets/modules/github/virtual-list-element'
import type {Json} from 'relay-runtime/lib/util/stableCopy'
import {hasDirtyFields} from '@github-ui/has-interactions'

type RepoSuggestion = {
  id: number
  name: string
}

@controller
class RepositorySelectionInputElement extends HTMLElement {
  @target virtualFilterInput: VirtualFilterInputElement<RepoSuggestion>
  @target itemTemplate: HTMLTemplateElement
  @target list: VirtualListElement<Json>
  @target blankslate: HTMLElement
  @target checkbox: HTMLInputElement

  loading = true

  selectedIds: string[] = []

  connectedCallback() {
    this.virtualFilterInput.filter = (item: RepoSuggestion, query: string) => {
      if (!query) return true
      if (this.selectedIds.includes(item.id.toString())) return true
      const trimmedTerm = query.toLowerCase().trim()
      return (item && item.name.toLowerCase().trim().includes(trimmedTerm.toLowerCase())) || null
    }
  }

  willLoad() {
    this.blankslate.hidden = true
    this.loading = true
  }

  didLoad() {
    this.loading = false
  }

  selectRepoItem(event: Event) {
    const targetCheckbox = event.target as HTMLInputElement
    // handle cases of unchecking and checking the box
    if (!targetCheckbox.checked) {
      const index = this.selectedIds.indexOf(targetCheckbox.value)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      }
    } else {
      if (!this.selectedIds.includes(targetCheckbox.value)) {
        this.selectedIds.push(targetCheckbox.value)
      }
    }

    const form = this.checkbox
      .closest<HTMLElement>('.js-packages-repo-container-1')!
      .querySelector('.js-packages-repo-form-1')!
    const nameScope = form.getAttribute('name-scope')
    const button = document.querySelector<HTMLButtonElement>(`#add-repo-button-${nameScope}`)
    const repositorySelectionComponentId = `#repository-selection-component-${nameScope}`
    const repositorySelectionComponent = document.querySelector<HTMLButtonElement>(repositorySelectionComponentId)
    if (button && repositorySelectionComponent) {
      button.disabled = !hasDirtyFields(repositorySelectionComponent)
    }
    const selectedRepoInput = this.createRepoInput(this.checkbox, this.selectedIds)
    const existing = form.querySelector(`[id='selected_ids']`)
    if (existing) {
      existing.replaceWith(selectedRepoInput)
    } else {
      form.append(selectedRepoInput)
    }
  }

  createRepoInput(item: HTMLInputElement, ids: string[]): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'selected_ids'
    input.value = ids.toString()
    return input
  }

  willRenderItems() {
    this.blankslate.hidden = this.list.size > 0 || this.loading
  }

  renderItem(event: CustomEvent) {
    const frag = new TemplateInstance(
      this.itemTemplate,
      {
        id: event.detail.item.id,
        name: event.detail.item.name,
        repo_icon_hidden: event.detail.item.repo_type_icon !== 'repo',
        lock_icon_hidden: event.detail.item.repo_type_icon !== 'lock',
        forked_icon_hidden: event.detail.item.repo_type_icon !== 'repo-forked',
      },
      propertyIdentityOrBooleanAttribute,
    )
    // append the element to virtual list fragment container
    // this is the way you define what to render
    event.detail.fragment.append(frag)
  }

  didRenderItems() {
    const items = document.querySelectorAll<HTMLInputElement>('.js-bulk-repo-selector')
    for (const item of items) {
      if (this.selectedIds.includes(item.value)) {
        item.setAttribute('checked', 'true')
      }
    }
  }
}
