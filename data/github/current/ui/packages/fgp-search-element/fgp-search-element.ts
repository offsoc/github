import {controller, target, attr} from '@github/catalyst'
import Combobox from '@github/combobox-nav'

interface FGPMetadata {
  label: string
  description: string
  category: string
  base_role?: string
}

@controller
export class FgpSearchElement extends HTMLElement {
  @target searchInput: HTMLInputElement
  @target resultList: HTMLElement
  @target emptyState: HTMLElement
  @target fgpSummaryList: HTMLElement
  @target baseRoleSelect: HTMLSelectElement

  @attr src: string
  @attr fgpCounterId: string

  #combobox: Combobox
  #fgpSummaryItemTemplate: HTMLTemplateElement
  #fgpMetadataList: {[key: string]: FGPMetadata} = {}
  #keepOpen = false
  #selectedFgps = new Set<string>()

  async connectedCallback() {
    this.#combobox = new Combobox(this.searchInput, this.resultList)

    this.#fetchFGPData()
  }

  removeFgp(event: Event) {
    const removeButton = event.currentTarget as HTMLButtonElement
    const fgpToRemove = removeButton.getAttribute('data-fgp')

    if (fgpToRemove) {
      this.removeFromSummary(fgpToRemove)
      this.#uncheck(fgpToRemove)
    }

    this.#updateCounter()
  }

  handleRepoBaseRoleChange() {
    const baseRole = this.#selectedBaseRole() || this.getAttribute('data-initial-base-role')
    const baseRoleInput = document.getElementById('role_base_role') as HTMLInputElement

    if (baseRoleInput) {
      baseRoleInput.value = baseRole === 'none' || !baseRole ? '' : baseRole
    }
    if (!baseRole) return
    this.searchInput.disabled = baseRole === 'none'

    this.#updateBaseRoleCheckboxes(baseRole)
    this.#updateCounter()
  }

  keepOpen() {
    this.#keepOpen = true
  }

  openSearch() {
    this.resultList.hidden = false
    this.resultList.ariaExpanded = 'true'
    this.#combobox.start()
  }

  closeSearch() {
    if (this.#keepOpen) {
      this.#keepOpen = false
      return
    }
    this.resultList.hidden = true
    this.#combobox.stop()
  }

  addToSummary(fgp: string, inherited: boolean = false) {
    const metadata = this.#fgpMetadataList[fgp]
    if (!metadata) return

    this.#selectedFgps.add(fgp)

    if (this.#getFgpSummaryListItem(fgp)) return

    const clone = this.#getSummaryItemTemplate()
    const listItem = clone.querySelector('.js-fgp-list-item')
    const itemTitle = clone.querySelector('.js-fgp-item-title')
    const removeButton = clone.querySelector<HTMLButtonElement>('.js-fgp-remove-button')

    if (inherited) {
      if (removeButton) {
        removeButton.hidden = true
      }
      const repoInheritLabel = clone.querySelector('span.js-repository-inherit-label')
      if (repoInheritLabel) {
        repoInheritLabel.textContent = `Inherited from ${metadata.base_role || 'admin'}`
      }
    }

    if (!listItem || !itemTitle || !removeButton) return

    itemTitle.textContent = metadata.description
    listItem.setAttribute('data-fgp', fgp)
    listItem.setAttribute('id', `fgp-item-${fgp}`)
    removeButton.setAttribute('data-fgp', fgp)

    if (!inherited) {
      const firstInheritedFgp = this.fgpSummaryList
        .querySelector('span.js-repository-inherit-label:not([hidden])')
        ?.closest('li')

      if (firstInheritedFgp) {
        this.fgpSummaryList.insertBefore(clone, firstInheritedFgp)
      } else {
        this.fgpSummaryList.appendChild(clone)
      }
    } else {
      this.fgpSummaryList.appendChild(clone)
    }

    if (this.#selectedFgps.size >= 1) {
      this.emptyState.hidden = true
      this.fgpSummaryList.hidden = false
    }
  }

  removeFromSummary(fgp: string) {
    const listItem = this.#getFgpSummaryListItem(fgp)
    if (!listItem) return

    this.#selectedFgps.delete(fgp)

    if (this.#selectedFgps.size === 0) {
      this.emptyState.hidden = false
      this.fgpSummaryList.hidden = true
    }

    listItem.remove()
  }

  handleFgpChange(event: Event) {
    const fgpCheckbox = event.currentTarget as HTMLInputElement
    const fgp = fgpCheckbox.value

    fgpCheckbox.checked ? this.addToSummary(fgp) : this.removeFromSummary(fgp)
    fgpCheckbox.setAttribute('aria-checked', fgpCheckbox.checked.toString())

    this.searchInput.focus()
    this.#updateCounter()
  }

  #fetchFGPData = async () => {
    if (!this.src) throw new Error('src attribute is required')

    const response = await fetch(this.src, {
      headers: {'X-Requested-With': 'XMLHttpRequest'},
    })

    if (!response.ok) throw new Error(`Failed to fetch FGP metadata: ${response.statusText}`)

    this.#fgpMetadataList = await response.json()
    this.#fillFGPSummaryList()
  }

  #fillFGPSummaryList = () => {
    const initialBaseRole = this.getAttribute('data-initial-base-role')
    if (initialBaseRole) {
      this.handleRepoBaseRoleChange()
    }

    const initialEditRolePermissions = this.getAttribute('data-initial-edit-role-permissions')
    if (!initialEditRolePermissions) return

    const initialEditRolePermissionsList = JSON.parse(initialEditRolePermissions)

    for (const fgp of initialEditRolePermissionsList) {
      this.addToSummary(fgp)
      this.#check(fgp)
    }

    this.#addCachedCheckboxesToSummary(initialEditRolePermissionsList)

    this.#updateCounter()
  }

  #addCachedCheckboxesToSummary(savedList: string[]) {
    const fgpCheckboxes = this.resultList.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

    for (const checkbox of fgpCheckboxes) {
      if (checkbox.checked && !checkbox.disabled && !savedList.includes(checkbox.value)) {
        this.addToSummary(checkbox.value)
      }
    }
  }

  #check(fgp: string) {
    const fgpCheckbox = this.#getCheckboxFor(fgp)
    if (!fgpCheckbox) return
    fgpCheckbox.checked = true
  }

  #uncheck(fgp: string) {
    const fgpCheckbox = this.#getCheckboxFor(fgp)
    if (!fgpCheckbox) return
    fgpCheckbox.checked = false
  }

  #getCheckboxFor(fgp: string): HTMLInputElement | null {
    return this.resultList.querySelector<HTMLInputElement>(`input[type="checkbox"][value="${fgp}"]`)
  }

  #getFgpSummaryListItem(fgp: string): HTMLLIElement | null {
    return this.fgpSummaryList.querySelector<HTMLLIElement>(`#fgp-item-${fgp}`)
  }

  #updateBaseRoleCheckboxes(baseRole: string) {
    const roleHierarchy = ['read', 'triage', 'write', 'maintain', 'admin']
    const baseRoleIndex = roleHierarchy.indexOf(baseRole)
    const fgpCheckboxes = this.resultList.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

    for (const checkbox of fgpCheckboxes) {
      const fgp = checkbox.value

      if (baseRole === 'none') {
        this.removeFromSummary(fgp)
        checkbox.checked = false
        checkbox.disabled = false
      }

      const metadata = this.#fgpMetadataList[fgp]
      if (!metadata) continue

      const fgpBaseRole = metadata.base_role ? metadata.base_role : 'admin'
      const metadataRoleIndex = roleHierarchy.indexOf(fgpBaseRole)
      const inherited = baseRoleIndex !== -1 && metadataRoleIndex <= baseRoleIndex

      if (inherited) {
        checkbox.checked = true
        checkbox.disabled = true
        this.removeFromSummary(fgp)
        this.addToSummary(fgp, true)
      } else {
        checkbox.disabled = false
        checkbox.checked = false
        this.removeFromSummary(fgp)
      }
    }
  }

  #getSummaryItemTemplate() {
    if (!this.#fgpSummaryItemTemplate) {
      const listItemTemplate = document.querySelector<HTMLTemplateElement>('#fgp-summary-list-item-template')
      if (listItemTemplate) {
        this.#fgpSummaryItemTemplate = listItemTemplate
      } else {
        throw new Error('fgp-summary-list-item-template not found')
      }
    }

    return this.#fgpSummaryItemTemplate.content.cloneNode(true) as DocumentFragment
  }

  #selectedBaseRole() {
    if (!this.baseRoleSelect) {
      return null
    }
    return this.baseRoleSelect.querySelector('button[aria-checked="true"]')?.getAttribute('data-value')
  }

  #updateCounter() {
    const fgpCounter = document.querySelector(`#${this.fgpCounterId}`)
    if (fgpCounter) {
      fgpCounter.textContent = this.#selectedFgps.size.toString()
    }
  }
}
