import {controller, target, targets} from '@github/catalyst'
import {parseHTML} from '@github-ui/parse-html'

type OrgInfo = {
  id: number
  copilot_plan: 'business' | 'enterprise' | 'disabled'
}

type ModalRequestParams = {
  orgIds: string[]
  copilotPlan: string
  reenable?: boolean
}

type FetchOptions = {
  url: string
  options?: RequestInit
  handleSuccess?: (response: Response) => Promise<void>
  handleError?: (error: Error) => void
  handleCleanup?: () => void
}

type FetcherOptions = Partial<RequestInit>

function Fetcher(config?: FetcherOptions) {
  const baseHeaders = config?.headers ?? {}
  let abortController: AbortController | null = null

  return async (opts: FetchOptions) => {
    abortController?.abort()
    abortController = new AbortController()

    const signal = abortController.signal
    const options = {
      ...config,
      ...opts.options,
      headers: {
        ...baseHeaders,
        ...opts.options?.headers,
      },
    }

    try {
      const response = await fetch(opts.url, {
        ...options,
        signal,
      })

      if (opts.handleSuccess && response.ok) {
        await opts.handleSuccess?.(response)
      }
    } catch (error) {
      // ignore fetch errors
    }

    if (signal.aborted) {
      return
    }

    opts.handleCleanup?.()
  }
}

@controller
export class CopilotMixedLicenseOrgsListElement extends HTMLElement {
  @target declare planChangeDialog: HTMLDialogElement
  @target declare planChangeDialogContainer: HTMLElement
  @target declare detailsMenu: HTMLDetailsElement
  @target declare orgsList: HTMLElement

  @targets declare orgs: HTMLElement[]

  static observedAttributes = ['data-organizations']

  organizations: OrgInfo[] = []
  businessName: string = ''
  dialogEndpoint: string = ''
  fetcher: ReturnType<typeof Fetcher> = Fetcher({headers: {Accept: 'text/fragment+html'}})
  activeOrgEl: HTMLElement | undefined

  connectedCallback() {
    const json = JSON.parse(this.getAttribute('data-payload') || '{}')

    this.businessName = json.businessName
    this.dialogEndpoint = `/enterprises/${this.businessName}/settings/copilot_plan_change`
  }

  handleBulkAction = ({action, selectedOrgs}: {action: string; selectedOrgs: string[]}) => {
    if (selectedOrgs.length === 1) {
      // If a bulk action is only targeting one org, we need to grab the row associated with that org.
      // We have to do this because the modal forms decide which controller handler to call based on the
      // number of selected organizations. Multiple orgs go to the bulk handler, while single orgs go to
      // the single org handler.
      this.activeOrgEl = this.orgs.find(el => (el.getAttribute('data-org-id') as string) === selectedOrgs[0])
    }

    this.#fetchModal({orgIds: selectedOrgs, copilotPlan: action})
  }

  async #fetchModal(params: ModalRequestParams) {
    const queryParams = new URLSearchParams()

    for (const orgId of params.orgIds) {
      queryParams.append('organizations[]', orgId)
    }

    queryParams.append('copilot_plan', params.copilotPlan)
    queryParams.append('reenable', params.reenable ? 'true' : 'false')

    this.fetcher({
      url: `${this.dialogEndpoint}?${queryParams.toString()}`,
      handleSuccess: async (response: Response) => {
        const replaceTarget = this.planChangeDialogContainer
        const partial = parseHTML(document, await response.text())
        replaceTarget.replaceChildren(partial)
        this.planChangeDialog.show()
      },
    })
  }

  async handleShowModal(event: MouseEvent) {
    const targetOrgEl = event.currentTarget as HTMLButtonElement
    const targetOrgId = Number(targetOrgEl.getAttribute('data-org-id'))
    const nextCopilotPlan = targetOrgEl.getAttribute('data-value')
    const isReenableRequest = targetOrgEl.getAttribute('data-reenable') === 'true'

    this.activeOrgEl = this.orgs.find(el => parseInt(el.getAttribute('data-org-id') as string) === targetOrgId)
    const currentCopilotPlan = this.activeOrgEl?.getAttribute('data-copilot-plan')

    // This would break the modal if it happened
    if (!currentCopilotPlan || !nextCopilotPlan) {
      return
    }

    if (currentCopilotPlan === nextCopilotPlan) {
      return
    }

    const detailsMenu = this.activeOrgEl?.querySelector('details')

    if (detailsMenu) {
      detailsMenu.removeAttribute('open')
    }

    this.#fetchModal({orgIds: [targetOrgId.toString()], copilotPlan: nextCopilotPlan, reenable: isReenableRequest})
  }

  handleCloseModal() {
    this.planChangeDialog.close()
    this.activeOrgEl = undefined
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const body = new FormData(form)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('page')) {
      body.append('page', urlParams.get('page') ?? '')
    }
    if (urlParams.get('query')) {
      body.append('query', urlParams.get('query') ?? '')
    }

    this.fetcher({
      url: form.action,
      options: {
        method: 'POST',
        body,
      },
      handleSuccess: async () => {
        window.location.reload()
      },
    })
  }
}

@controller
export class BulkOrgActionElement extends HTMLElement {
  @targets declare selectedOrgs: HTMLInputElement[]
  @target declare modalController: CopilotMixedLicenseOrgsListElement
  @target declare selectAllCheckbox: HTMLInputElement

  handleRemoveAccess() {
    this.modalController.handleBulkAction({
      action: 'disable',
      selectedOrgs: this.selectedOrgs.reduce((memo: string[], el) => {
        if (!el.checked) {
          return memo
        }

        const orgId = el.getAttribute('data-org-id')

        if (!orgId) {
          return memo
        }

        return [...memo, orgId]
      }, []),
    })
  }
}
