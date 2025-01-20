import {controller, target} from '@github/catalyst'

interface HostSetup {
  repo?: string
  branch?: string
  path?: string
}

let hostSetup: HostSetup = {}
let radioMenuItems: NodeListOf<Element> = {} as NodeListOf<Element>

@controller
class HostSetupElement extends HTMLElement {
  @target repositoryFormGroup: HTMLDivElement
  @target branchSelectorBox: HTMLDivElement
  @target pathInputBox: HTMLDivElement
  @target hostSetupBox: HTMLDivElement
  @target configSaveButton: HTMLButtonElement
  @target selectedPath: HTMLInputElement
  @target saveErrorElement: HTMLElement

  connectedCallback(): void {
    this.repositoriesAddEventListner()
    this.updateSaveButtonVisibility()
    this.updateHostConfig()
    this.updateBranchList()
  }

  repositoriesAddEventListner() {
    radioMenuItems = document.querySelectorAll('#host-setup-repository-menu-list')

    for (const item of radioMenuItems) {
      item.addEventListener('click', event => {
        const repositoryName = (event.target as HTMLInputElement).textContent

        if (repositoryName && repositoryName.includes('/')) {
          hostSetup.repo = repositoryName.trim()
          this.saveRepository()
        }
      })
    }
  }

  saveHostSetupConstraintChange(): void {
    const constraintName = this.hostSetupBox.getAttribute('data-constraint-name')
    this.dispatchEvent(new CustomEvent('commit', {detail: {hostSetup, constraintName}}))
  }

  async saveRepository(): Promise<void> {
    if (!hostSetup.repo) {
      return
    }

    this.updateSelectedRepoText()

    await this.addBranchesList(hostSetup.repo, true)
    this.branchSelectorBox.hidden = false
    this.pathInputBox.hidden = false
    this.updateSaveButtonVisibility()
  }

  async updateBranchList() {
    if (hostSetup.repo && hostSetup.repo !== 'None') {
      await this.addBranchesList(hostSetup.repo)
    }
  }

  async getBranchList(repo: string): Promise<string[]> {
    try {
      const response = await fetch(`/${repo}/refs?type=branch`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!response.ok) return []

      const responseJSON = await response.json()
      return responseJSON.refs
    } catch (error) {
      return []
    }
  }

  async addBranchesList(repo: string, updateDefault: boolean = false): Promise<void> {
    const branches = await this.getBranchList(repo)

    if (updateDefault) {
      const defaultBranch = branches[0]
      hostSetup.branch = defaultBranch
    }

    this.updateSelectedBranchText()

    const element = document.getElementById('data-filterable-branch')
    if (element) {
      const menuHTML = branches
        .map(
          branch => `
            <label tabindex="0" class="select-menu-item" role="menuitemradio" aria-checked="false">
              <input type="radio" name="branch" value="${branch}"
                data-action="change:host-setup#saveBranch">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-check select-menu-item-icon">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                </svg>
                <span class="text-normal select-menu-item-text" data-menu-button-text>${branch}</span>
            </label>
          `,
        )
        .join('')
      element.innerHTML = menuHTML
    }
  }

  saveBranch(event: Event) {
    hostSetup.branch = (event.target as HTMLInputElement).value
    this.updateSelectedBranchText()
    this.updateSaveButtonVisibility()
  }

  updateSelectedBranchText() {
    const buttonElement = document.querySelector('[data-target="host-setup.selectedBranch"]') as HTMLElement
    if (buttonElement) {
      buttonElement.textContent = hostSetup.branch || 'None'
    }
  }

  updateSelectedRepoText() {
    const buttonElement = document.querySelector('[data-target="host-setup.selectedRepo"]') as HTMLElement
    if (buttonElement) {
      buttonElement.textContent = hostSetup.repo || 'None'
    }
  }

  savePath(event: Event) {
    hostSetup.path = (event.target as HTMLInputElement).value
    this.updateSaveButtonVisibility()
  }

  getSelectedRepoValue(): string {
    const element = document.querySelector('[data-target="host-setup.selectedRepo"]')
    return element?.textContent || 'None'
  }

  getSelectedBranchValue(): string {
    const element = document.querySelector('[data-target="host-setup.selectedBranch"]')
    return element?.textContent || 'None'
  }

  getSelectedPathValue(): string {
    return this.selectedPath.value.trim() || 'None'
  }

  updateHostConfig() {
    hostSetup = {
      repo: this.getSelectedRepoValue(),
      branch: this.getSelectedBranchValue(),
      path: this.getSelectedPathValue(),
    }
  }

  closeDetailsDropdown(event: Event): void {
    const button = event.target as HTMLElement

    const dropdown = button.closest('.dropdown')
    if (dropdown) {
      dropdown.removeAttribute('open')
    }
  }

  updateSaveButtonVisibility() {
    this.saveErrorElement.hidden = true
    const isInvalid =
      this.getSelectedRepoValue() === 'None' ||
      this.getSelectedBranchValue() === 'None' ||
      this.getSelectedPathValue() === 'None'

    this.configSaveButton.disabled = isInvalid
  }

  async saveHostSetup(event: Event) {
    const mainSaveErrorElement = document.querySelector(
      '[data-target="codespaces-policy-form.saveErrorElement"]',
    ) as HTMLElement

    if (mainSaveErrorElement && mainSaveErrorElement.textContent === 'Host setup must be specified') {
      mainSaveErrorElement.textContent = ''
    }

    const url = `/${hostSetup.repo}/blob/${hostSetup.branch}/${hostSetup.path}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (response.status === 200) {
        this.saveHostSetupConstraintChange()
        const githubUrl = this.repositoryFormGroup.getAttribute('github-url')
        this.updateDisplayText(`${githubUrl}${url}`)
        this.closeDetailsDropdown(event)
        return
      } else if (response.status === 404) {
        this.saveErrorElement.textContent = 'Error: Specified path does not exist in the repository.'
      }

      this.saveErrorElement.hidden = false
      this.configSaveButton.disabled = true
    } catch {
      this.saveErrorElement.hidden = false
      this.configSaveButton.disabled = true
    }
  }

  updateDisplayText(url: string) {
    const element = document.querySelector('[data-target="host-setup.selectedHostSetupValuesText"]') as HTMLElement
    if (element !== null) {
      element.textContent = ''
      const link = document.createElement('a')

      link.classList.add('Link', 'color-fg-muted')
      link.textContent = url
      link.href = encodeURI(url)
      element.appendChild(link)
    }
  }
}
