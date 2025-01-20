import {controller, target, targets} from '@github/catalyst'
import type DetailsDialogElement from '@github/details-dialog-element'
import type DetailsMenuElement from '@github/details-menu-element'
import type RemoteInputElement from '@github/remote-input-element'
import safeStorage from '@github-ui/safe-storage'

const {getItem, setItem} = safeStorage('localStorage')

interface Repo {
  currentUser: string
  currentIssueOrPullRequestNumber: string
  repoNwo: string
  selectedRepoNwo: string
  selectedRepoId: string
  selectedRepoUrl: string
}

/**
 * This custom element sits in the issue sidebar and coordinates
 * interaction with the two-level, searchable development menu.
 */
@controller
class DevelopmentMenuElement extends HTMLElement {
  // Top level <details> element
  @target details: HTMLDetailsElement
  // First level <details-menu> repo selection menu
  @target repoMenu: DetailsMenuElement
  // Second level <details-dialog> branch or pull request selection dialog
  @target branchOrPullRequestDialog: DetailsDialogElement
  @target dialogTitle: HTMLHeadingElement
  // <remote-input> element
  @target branchAndPullRequestSearch: RemoteInputElement
  // <input> element search for repos
  @target repoSearchInput: HTMLInputElement
  // <input> element search for branches and pull requests
  @target branchAndPullRequestSearchInput: HTMLInputElement
  // <include-fragment> element containing spinner. Should only be visible on initial load of list.
  @target repositoryListSpinner: HTMLElement
  // <include-fragment> element containing spinner. Should only be visible on initial load of list.
  @target branchAndPullRequestListSpinner: HTMLElement
  // <div> parent element containing the list of repositories
  @target repositoryList: HTMLDivElement
  // <div> parent element containing the list of branches and pull requests
  @target branchAndPullRequestList: HTMLDivElement
  // <div> child element of branchAndPullRequestList containing the list of pull requests
  @target linkableItemList: HTMLDivElement
  // hidden input containing the selected repo's id
  @target selectedRepoIdInput: HTMLInputElement
  // <div> element showing a message when the user is at the maximum
  @target atLimitMessage: HTMLDivElement
  // <button> element used to submit selection
  @target applyButton: HTMLButtonElement
  // hidden <input> elements directly underneath pull request .SelectMenu-items
  @targets pullRequestInputsList: HTMLInputElement[]
  // hidden <input> elements directly underneath pull request .SelectMenu-items
  @targets branchInputsList: HTMLInputElement[]

  currentUser = ''
  currentIssueOrPullRequestNumber = ''
  repoNwo = ''
  selectedRepoNwo = ''
  selectedRepoId = ''
  selectedRepoUrl = ''

  // Used to check if form is dirty
  originalCheckedPullRequestIds: string[] = []
  originalCheckedBranchIds: string[] = []

  STORAGE_KEY = 'developmentMenu:selectedRepos'
  MAX_SELECTED_REPOS = 100

  /*******
   ***
   **
   *
   * LOADING INDICTATORS
   **
   ***
   *******/
  branchAndPullRequestListLoaded() {
    this.originalCheckedPullRequestIds = this.checkedPullRequestIds()
    this.originalCheckedBranchIds = this.checkedBranchIds()
    this.applyButton.disabled = true
    this.branchAndPullRequestListLoadEnd()
  }

  branchAndPullRequestListLoadStart() {
    if (this.branchAndPullRequestSearchInput.value) {
      this.branchAndPullRequestListSpinner.setAttribute('hidden', 'true')
      this.branchAndPullRequestSearchInput.removeAttribute('is-loading')
    } else {
      this.branchAndPullRequestList.textContent = ''
      this.branchAndPullRequestListSpinner.removeAttribute('hidden')
      this.branchAndPullRequestSearchInput.setAttribute('is-loading', 'true')
    }
  }

  branchAndPullRequestListLoadEnd() {
    this.branchAndPullRequestListSpinner.setAttribute('hidden', 'true')
    this.branchAndPullRequestSearchInput.removeAttribute('is-loading')
  }

  repositoryListLoaded() {
    this.repositoryListLoadEnd()
  }

  repositoryListLoadStart() {
    if (this.repoSearchInput.value) {
      this.repositoryListSpinner.setAttribute('hidden', 'true')
      this.repoSearchInput.removeAttribute('is-loading')
    } else {
      this.repositoryList.textContent = ''
      this.repositoryListSpinner.removeAttribute('hidden')
      this.repoSearchInput.setAttribute('is-loading', 'true')
    }
  }

  repositoryListLoadEnd() {
    this.repositoryListSpinner.setAttribute('hidden', 'true')
    this.repoSearchInput.removeAttribute('is-loading')
  }

  /*******
   ***
   **
   *
   * ITEM SELECTION
   **
   **
   * Open menu.
   *  N/A. Works out of the box.
   * Close menu by clicking X. Empty input fields and search results.
   *   #closeMenu
   * Close menu by clicking cancel. Empty input fields and search results.
   *   #resetForm
   * Close menu by losing focus. Empty input fields and search results.
   *   N/A. Works out of the box.
   * Open second level menu by selecting repo.
   *   #openBranchOrPullRequestDialog
   * Auto open second level menu by repo retrieval from storage.
   *   #openSelectedRepoFromStorage
   * Open first level meny by clicking back arrow.
   *   #closeBranchOrPullRequestDialog
   *
   ********/

  /**
   * The user selects a repo from the repo menu.
   */
  openBranchOrPullRequestDialog(e: Event) {
    e.preventDefault()
    e.stopPropagation()

    const button = e.currentTarget as HTMLButtonElement
    const currentUser = this.details.getAttribute('current-user') || ''
    const currentIssueOrPullRequestNumber = this.details.getAttribute('current-issue-or-pull-request-number') || ''
    const repoNwo = this.details.getAttribute('repo-nwo') || ''
    const selectedRepoNwo = button?.getAttribute('selected-repo-nwo') || ''
    const selectedRepoId = button?.getAttribute('selected-repo-id') || ''
    const selectedRepoUrl = button?.getAttribute('selected-repo-url') || ''

    this.setRepo({
      currentUser,
      currentIssueOrPullRequestNumber,
      repoNwo,
      selectedRepoNwo,
      selectedRepoId,
      selectedRepoUrl,
    })

    this.toggleMenus()
  }

  /**
   * Toggle between first and second level menu, ensuring the focus remains on the search input.
   */
  toggleMenus() {
    this.details.open = true
    this.repoMenu.toggleAttribute('hidden')
    this.branchOrPullRequestDialog.toggleAttribute('hidden')

    if (!this.repoMenu.hidden) {
      this.repoSearchInput.focus()
    } else {
      this.branchAndPullRequestSearchInput.focus()
    }
  }

  openSecondLevelMenu() {
    this.details.open = true
    this.repoMenu.hidden = true
    this.branchOrPullRequestDialog.hidden = false
  }

  /**
   * Skip the first level menu if the user has already selected a repository for the issue repository.
   */
  openSelectedRepoFromStorage(e: Event) {
    const selectedRepos = this.getSelectedReposLocalStorage()
    const currentUser = this.details.getAttribute('current-user') || ''
    const currentIssueOrPullRequestNumber = this.details.getAttribute('current-issue-or-pull-request-number') || ''
    const repoNwo = this.details.getAttribute('repo-nwo') || ''

    // is there a selected repo for the current user and repo nwo?
    const selectedRepo = selectedRepos?.find(
      (repo: Repo) =>
        repo.currentUser === currentUser &&
        repo.currentIssueOrPullRequestNumber === currentIssueOrPullRequestNumber &&
        repo.repoNwo === repoNwo,
    )

    if (selectedRepo && !this.isDetailsOpen()) {
      const {selectedRepoNwo, selectedRepoId, selectedRepoUrl} = selectedRepo
      this.openSecondLevelMenu()
      this.setRepo({
        currentUser,
        currentIssueOrPullRequestNumber,
        repoNwo,
        selectedRepoNwo,
        selectedRepoId,
        selectedRepoUrl,
      })
      e.preventDefault()
      e.stopPropagation()
    }
  }

  closeMenu() {
    this.details.open = false
  }

  /**
   * Triggered when the user clicks the "Close menu" button in the second level menu
   */
  closeBranchOrPullRequestDialog() {
    this.removeSelectedRepoLocalStorage({
      currentUser: this.currentUser,
      currentIssueOrPullRequestNumber: this.currentIssueOrPullRequestNumber,
      repoNwo: this.repoNwo,
      selectedRepoNwo: this.selectedRepoNwo,
      selectedRepoId: this.selectedRepoId,
      selectedRepoUrl: this.selectedRepoUrl,
    })

    this.selectedRepoNwo = ''
    this.branchAndPullRequestList.textContent = ''
    this.toggleMenus()
  }

  /*******
   ***
   **
   *
   * ITEM SELECTION
   **
   ***
   *******/

  /**
   * Triggered when branch is selected
   */
  toggleSelectBranch(e: Event) {
    this.toggleSelectBranchOrPullRequest(e, 'label.js-branch-list-item')
    this.setApplyButtonStatus()
  }

  /**
   * Triggered when pull request is selected
   */
  toggleSelectPullRequest(e: Event) {
    const atLimit = this.atLimit()
    this.atLimitMessage.hidden = !atLimit

    this.toggleSelectBranchOrPullRequest(e, 'label.js-pull-request-list-item')
    this.toggleUnselectedItemsDisabled(atLimit)

    this.setApplyButtonStatus()
  }

  /**
   * Matches aria-checked to the value of the hidden input
   */
  toggleSelectBranchOrPullRequest(event: Event, labelElement = 'label') {
    const input = event.target as HTMLInputElement
    const label = input.closest(labelElement)
    label?.setAttribute('aria-checked', String(input.checked))
  }

  /**
   * Matches aria-disabled to the value of the hidden input
   */
  toggleUnselectedItemsDisabled(atLimit: boolean) {
    for (const item of this.pullRequestInputsList) {
      const label = item.closest('label')
      label?.setAttribute('aria-disabled', String(atLimit && !item.checked))
    }
  }

  /*******
   ***
   **
   *
   * HELPERS
   **
   ***
   *******/

  /*
   * Prevent stray clicks to items within details-menu and details-dialog from propagating up to
   * <details> and triggering #openSelectedRepoFromStorage. We must use the click event on <details>
   * instead of toggle to avoid UI flash.
   *
   * <details click:development-menu#openSelectedRepoFromStorage>
   *    <details-menu click:development-menu#stopPropagation></details-menu>
   *    <details-dialog click:development-menu#stopPropagation></details-dialog>
   * </details>
   */
  stopPropagation(e: Event) {
    e.stopPropagation()
  }

  isDetailsOpen() {
    return this.details.open
  }

  atLimit() {
    const max = this.linkableItemList.getAttribute('menu-max-options') || ''
    const checkedNow = this.checkedPullRequestIds()
    const checkedThen = this.originalCheckedPullRequestIds

    return checkedNow.length - checkedThen.length >= Number(max)
  }

  areArraysEqual(a: string[], b: string[]) {
    return JSON.stringify(a.sort()) === JSON.stringify(b.sort())
  }

  setApplyButtonStatus() {
    if (
      this.areArraysEqual(this.originalCheckedPullRequestIds, this.checkedPullRequestIds()) &&
      this.areArraysEqual(this.originalCheckedBranchIds, this.checkedBranchIds())
    ) {
      this.applyButton.disabled = true
    } else {
      this.applyButton.disabled = false
    }
  }

  /**
   * Set the selected repo and update the UI so the second level menu
   * can display the correct branches and pull requests.
   */
  setRepo(repo: Repo) {
    const {currentUser, currentIssueOrPullRequestNumber, repoNwo, selectedRepoNwo, selectedRepoId, selectedRepoUrl} =
      repo

    this.setSelectedRepoLocalStorage(repo)

    this.dialogTitle.innerHTML = selectedRepoNwo
    this.currentUser = currentUser
    this.currentIssueOrPullRequestNumber = currentIssueOrPullRequestNumber
    this.repoNwo = repoNwo
    this.selectedRepoNwo = selectedRepoNwo
    this.selectedRepoId = selectedRepoId
    this.selectedRepoUrl = selectedRepoUrl
    this.selectedRepoIdInput.value = selectedRepoId
    this.branchAndPullRequestSearch.src = selectedRepoUrl
    this.branchAndPullRequestSearchInput.focus()
  }

  getSelectedReposLocalStorage() {
    const selectedRepos = getItem(this.STORAGE_KEY) || '[]'
    return JSON.parse(selectedRepos)
  }

  /**
   * Set the selected repo in local storage at the beginning of the array.
   * Replaces existing repo if it exists.
   */
  setSelectedRepoLocalStorage(repo: Repo) {
    const repos = this.softRemoveSelectedRepoLocalStorage(repo).slice(0, this.MAX_SELECTED_REPOS - 1)
    repos.unshift(repo)

    setItem(this.STORAGE_KEY, JSON.stringify(repos))
  }

  softRemoveSelectedRepoLocalStorage(repo: Repo) {
    const repos = this.getSelectedReposLocalStorage()
    return repos.filter((r: Repo) => {
      return (
        r.selectedRepoNwo !== repo.selectedRepoNwo && r.repoNwo !== repo.repoNwo && r.currentUser === repo.currentUser
      )
    })
  }

  removeSelectedRepoLocalStorage(repo: Repo) {
    const repos = this.softRemoveSelectedRepoLocalStorage(repo)
    setItem(this.STORAGE_KEY, JSON.stringify(repos))
  }

  resetForm() {
    this.closeMenu()
  }

  checkedPullRequestIds() {
    return this.pullRequestInputsList.filter(item => item.checked).map(item => item.value)
  }

  checkedBranchIds() {
    return this.branchInputsList.filter(item => item.checked).map(item => item.value)
  }
}
