import {controller, target} from '@github/catalyst'
import {html, render} from '@github-ui/jtml-shimmed'
import type {CustomScope} from './suggestions/types'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'
import type {CustomScopeCache} from './providers/saved'

function PencilIcon() {
  const icon = document.getElementById('pencil-icon') as HTMLTemplateElement
  return html([icon?.innerHTML] as unknown as TemplateStringsArray)
}

function TrashIcon() {
  const icon = document.getElementById('trash-icon') as HTMLTemplateElement
  return html([icon?.innerHTML] as unknown as TemplateStringsArray)
}

@controller
export class CustomScopesElement extends HTMLElement {
  @target list: HTMLDivElement
  @target createCustomScopeForm: HTMLDivElement
  @target manageCustomScopesForm: HTMLDivElement

  @target customScopesModalDialog: ModalDialogElement | HTMLDialogElement
  @target customScopesModalDialogFlash: HTMLDivElement
  @target customScopesIdField: HTMLInputElement
  @target customScopesNameField: HTMLInputElement
  @target customScopesQueryField: HTMLInputElement
  @target customScopesSubmitButton: HTMLButtonElement

  #maxCustomScopes: number
  #cache?: CustomScopeCache
  #fetchScopes: () => Promise<CustomScope[]> = () => Promise.resolve([])
  #customScopesUrlPath: string
  #deleteCSRF: string

  hasScopes = false

  connectedCallback(): void {
    this.#maxCustomScopes = parseInt(this.getAttribute('data-max-custom-scopes') || '10', 10)
  }

  initialize(
    cache: CustomScopeCache,
    fetch: () => Promise<CustomScope[]>,
    customScopesUrlPath: string,
    deleteCSRF: string,
  ) {
    this.#cache = cache
    this.#fetchScopes = fetch
    this.#customScopesUrlPath = customScopesUrlPath
    this.#deleteCSRF = deleteCSRF
  }

  mode(): 'create' | 'manage' {
    if (this.createCustomScopeForm.hidden) {
      return 'manage'
    }
    return 'create'
  }

  customScopesSubmit(event: SubmitEvent) {
    if (this.mode() === 'manage') {
      this.create('')
    } else {
      this.saveCustomScope(event)
    }
  }

  customScopesCancel() {
    if (this.mode() === 'manage' || !this.hasScopes) {
      this.customScopesModalDialog.close()
    } else {
      this.setMode('manage')
    }
  }

  setMode(mode: 'create' | 'manage') {
    if (this.hasScopes && mode === 'manage') {
      this.createCustomScopeForm.hidden = true
      this.manageCustomScopesForm.hidden = false
      // eslint-disable-next-line i18n-text/no-en
      this.#updateCustomScopesModalDialogText('Saved searches', 'Create saved search')
    } else {
      this.createCustomScopeForm.hidden = false
      this.manageCustomScopesForm.hidden = true
    }
  }

  #updateCustomScopesModalDialogText(title: string, button: string) {
    this.customScopesSubmitButton.textContent = button

    // Get title by tag name as it's not exposed in the API for modal dialog
    this.customScopesModalDialog.getElementsByTagName('h1')[0]!.textContent = title
  }

  #checkCustomScopesLimit(isNewScope: boolean) {
    const atCustomScopesMax = isNewScope && (this.#cache?.len() || 0) >= this.#maxCustomScopes

    if (atCustomScopesMax) {
      this.customScopesModalDialogFlash.innerHTML = `
        <div class="flash flash-warn mb-3">
          Limit of 10 saved searches reached. Please delete an existing saved search before creating a new one.
        </div>
      `
    } else {
      this.customScopesModalDialogFlash.textContent = ''
    }
    this.customScopesSubmitButton.disabled = atCustomScopesMax
  }

  async saveCustomScope(event: SubmitEvent) {
    event.preventDefault()

    const form = (event.target as HTMLButtonElement).form!
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
    })
    if (response.ok) {
      this.#cache?.clear()
      const scopes = await this.#fetchScopes()
      this.setScopes(scopes)
      form.reset()
      this.setMode('manage')
    }
  }

  async show() {
    // Load the custom scopes and insert them...
    const scopes = await this.#fetchScopes()
    this.setScopes(scopes)
    if (this.customScopesModalDialog instanceof HTMLDialogElement) {
      this.customScopesModalDialog.showModal()
    } else {
      this.customScopesModalDialog.show()
    }
    this.setMode('manage')
  }

  openCustomScopesDialog(event: Event) {
    if (this.customScopesModalDialog instanceof HTMLDialogElement) {
      this.customScopesModalDialog.showModal()
    } else {
      this.customScopesModalDialog.show()
    }
    // Stop propagation so that the scope isn't also selected
    event.stopPropagation()
  }

  async editCustomScope(event: Event) {
    event.stopPropagation()
    event.preventDefault()

    let id: string | null = (event.target as HTMLElement).getAttribute('data-id')
    if (!id) {
      // Sometimes the octicon can intercept the click target for some reason, then try the parent
      id = (event.target as HTMLElement).closest('button')?.getAttribute('data-id') || null
    }

    const customScope = await this.#findCustomScopeById(id)
    if (!id || !customScope) return

    // eslint-disable-next-line i18n-text/no-en
    this.#updateCustomScopesModalDialogText('Update saved search', 'Update saved search')
    this.customScopesIdField.value = customScope.id
    this.customScopesNameField.value = customScope.name
    this.customScopesQueryField.value = customScope.query
    this.#checkCustomScopesLimit(false)

    this.setMode('create')
  }

  create(query: string) {
    // eslint-disable-next-line i18n-text/no-en
    this.#updateCustomScopesModalDialogText('Create saved search', 'Create saved search')
    this.customScopesIdField.value = ''
    this.customScopesNameField.value = ''
    this.customScopesQueryField.value = query
    if (this.customScopesModalDialog instanceof HTMLDialogElement) {
      this.customScopesModalDialog.showModal()
    } else {
      this.customScopesModalDialog.show()
    }
    this.#checkCustomScopesLimit(true)
    this.setMode('create')
  }

  async #findCustomScopeById(id: string | null): Promise<CustomScope | undefined> {
    let scopes = this.#cache?.get()
    if (scopes === undefined) {
      scopes = await this.#fetchScopes()
    }
    return scopes.find(scope => scope.id.toString() === id)
  }

  async deleteCustomScope(event: Event) {
    const url = this.#customScopesUrlPath

    let id: string | null = (event.target as HTMLElement).getAttribute('data-id')
    if (!id) {
      // Sometimes the octicon can intercept the click target for some reason, then try the parent
      id = (event.target as HTMLElement).closest('button')?.getAttribute('data-id') || null
    }
    if (!url || !id) return

    const formData = new FormData()
    formData.append('id', id)
    formData.append('_method', 'delete')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Scoped-CSRF-Token': this.#deleteCSRF,
      },
      body: formData,
    })
    if (response.ok) {
      const scopes = await this.#fetchScopes()
      this.setScopes(scopes)
    }

    this.#cache?.clear()
    this.setMode('manage')
  }

  setScopes(scopes: CustomScope[]) {
    this.hasScopes = scopes.length > 0
    const renderedSections = scopes.map(
      s => html`
        <div class="d-flex py-1">
          <div>
            <div class="text-bold">${s.name}</div>
            <div class="text-small color-fg-muted">${s.query}</div>
          </div>
          <div class="flex-1"></div>
          <button
            type="button"
            class="btn btn-octicon"
            data-action="click:qbsearch-input#editCustomScope"
            data-id="${s.id}"
            aria-label="Edit saved search"
          >
            ${PencilIcon()}
          </button>
          <button
            type="button"
            class="btn btn-octicon btn-danger"
            data-action="click:custom-scopes#deleteCustomScope"
            data-id="${s.id}"
            aria-label="Delete saved search"
          >
            ${TrashIcon()}
          </button>
        </div>
      `,
    )
    render(html`${renderedSections}`, this.list)
  }
}
