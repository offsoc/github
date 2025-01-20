import '../../assets/modules/github/ref-selector'
import {TemplateInstance} from '@github/template-parts'
import {attr, controller, target, targets} from '@github/catalyst'
// eslint-disable-next-line no-restricted-imports
import {fire, on} from 'delegated-events'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'

const LABEL_SELECTOR = 'label.js-create-branch'

// Handles selection of ref from ref-selector.ts, which wasn't quite intended for this use case...
// When the user picks a ref, we update the state of the ref-selector widget's checkboxes -- it won't do this on its own.
on('click', LABEL_SELECTOR, event => {
  const targetElement = event.currentTarget as HTMLInputElement
  if (!targetElement) return

  // mark the branch as set in the widget and close the <details>
  const summary = document.querySelector('.js-selected-branch')!
  const input = targetElement.querySelector('input')!
  const refSelector = document.querySelector('create-branch ref-selector')!
  const sourceBranch = document.querySelector('create-branch #source-branch-input') as HTMLInputElement

  // This changes the visible value of the "Branch source" field to whatever we've
  // just selected
  summary.textContent = input.value
  sourceBranch.value = input.value
  const details = targetElement.closest('details')!
  details.open = false
  // Send a fake input event to the ref-selector to clear the filter
  // otherwise the list will initially be filtered by the selected result
  // wrapped in setTimeout since otherwise the events race and may not clear
  // as intended
  setTimeout(() => {
    fire(refSelector, 'input-entered', '')
  })
})

/**
 * This custom element sits in the issue sidebar and coordinates the
 * development menu and the create branch details dialog.
 */
@controller
class CreateBranchElement extends HTMLElement {
  @target form: HTMLFormElement
  @target developmentForm: HTMLFormElement
  @target spinner: SVGElement
  @target errorContainer: HTMLDivElement
  @target details: HTMLDetailsElement
  @target resultContainer: HTMLDivElement
  @target baseRepoName: HTMLSpanElement | undefined
  @targets repos: HTMLInputElement[]
  @target desktopLink: HTMLAnchorElement | undefined
  @target changeSourceBranchButton: HTMLElement | undefined
  @target sourceBranch: HTMLDivElement | undefined // contains the spinner and details
  @target sourceBranchHeader: HTMLDivElement | undefined // header for source branch and repo selector
  @target sourceBranchSpinner: HTMLTemplateElement | undefined
  @target sourceBranchDetails: HTMLElement | undefined
  @target submitButton: HTMLButtonElement
  @target sidebarContainer: HTMLDivElement

  @attr defaultRepo = ''
  @attr defaultSourceBranch = ''

  @attr selectedNwo = ''

  @attr sidebarUrl = ''

  set error(value: string | null) {
    this.errorContainer.innerHTML = value || ''
  }

  set result(value: string | null) {
    this.resultContainer.innerHTML = value || ''
  }

  set submitting(value: boolean) {
    this.spinner.style.display = value ? 'inline' : 'none'
  }

  set baseRepoNwo(value: string) {
    // we try to set the baseRepoNwo whenever the dialog is opened.
    // the first time, the dialog will still be loading and there won't
    // be an element to modify.
    if (this.baseRepoName) {
      this.baseRepoName.textContent = value

      this.selectedNwo = value
      this.renderSelectItems()
    }
  }

  /**
   * Used in the branch for issue flow (on the issue sidebar), not the new branch flow from the
   * branch index. When a user selects a repo other than the issue's repo, the <ref-selector> doesn't
   * automatically populate the `source_branch` field on the form. That only happens once the user
   * has picked a ref.
   */
  get repoDefaultBranch(): string | null {
    return this.sourceBranch?.getAttribute('data-default-branch') || null
  }

  /**
   * Reconciles the "selected" state of the target repo list with the currently
   * selected repo's NWO (name with owner)
   */
  private renderSelectItems() {
    this.repos.map(repoRadioButton => {
      const label = repoRadioButton.closest('.js-repo-select-label')
      const checked = repoRadioButton.getAttribute('data-name') === this.selectedNwo
      label?.classList.toggle('selected', checked)
      repoRadioButton.checked = checked
    })
  }

  /**
   * Invoked as an action from `app/components/branch/create_branch_component.html.erb`
   * when the TargetRepositoriesController#index action returns a list of repos.
   * This is only used when creating a branch for an issue from the issue sidebar,
   * not when creating a branch in a repo.
   */
  reconcileSelection() {
    this.renderSelectItems()
  }

  /**
   * Action called when the user clicks "Create branch" from the sidebar
   */
  openDialog(event: MouseEvent) {
    event.preventDefault()
    const details = this.details
    details.open = true
    details.hidden = false
    details.removeAttribute('aria-hidden')
    this.baseRepoNwo = this.defaultRepo
  }

  /**
   * Action called when the user clicks the "Change branch source" button from the dialog.
   */
  selectSourceBranch() {
    if (!this.sourceBranchHeader || !this.changeSourceBranchButton) return
    this.changeSourceBranchButton.hidden = true
    this.sourceBranchHeader.hidden = false
  }

  /**
   * Action called when the user picks a target repository from
   * `target_repository_component.html.erb`
   */
  async setRepo(e: InputEvent) {
    // the change event bound to `setRepo` will fire when the details dialog is dismissed,
    // and in that case the details element won't be present.
    if (!this.sourceBranchDetails || !this.sourceBranch || !this.sourceBranchSpinner || !this.sourceBranchHeader) return

    const input = e.target as HTMLInputElement | null
    const url = input?.getAttribute('data-url')
    const nwo = input?.getAttribute('data-name')
    if (!url || !nwo) return

    this.baseRepoNwo = nwo

    const sourceBranchHidden = this.sourceBranchHeader.hidden
    const spinner = this.sourceBranchSpinner.content.cloneNode(true)
    this.sourceBranchDetails.replaceWith(spinner)
    this.submitButton.disabled = true
    const fragment = await fetchSafeDocumentFragment(document, url)
    this.sourceBranch.replaceWith(fragment)
    this.sourceBranchHeader.hidden = sourceBranchHidden
    this.submitButton.disabled = false
  }

  /**
   * Action called when the user closes the create branch dialog
   */
  closeDialog() {
    const form = this.form
    form.reset()
    form.hidden = false

    const details = this.details
    details.hidden = true
    details.setAttribute('aria-hidden', 'true')

    if (this.changeSourceBranchButton && this.sourceBranchHeader) {
      this.changeSourceBranchButton.hidden = false
      this.sourceBranchHeader.hidden = true
    }

    this.error = null
    this.result = null
  }

  /**
   * Create a new flash element populated by the API response and inject it into the dom,
   * since server-side flashes only populate after navigatiom
   */
  flashMessage(message: string, type = 'notice') {
    const template = new TemplateInstance(document.querySelector<HTMLTemplateElement>('.js-flash-template')!, {
      className: `flash-${type}`,
      message,
    })
    const node = document.importNode(template, true)
    const flashContainer = document.querySelector<HTMLElement>('#js-flash-container')!
    for (const child of flashContainer.children) {
      if (!child.classList.contains('js-flash-template')) {
        flashContainer.removeChild(child)
      }
    }
    flashContainer.appendChild(node)
  }

  /**
   * Capture the create branch form submission so we can update the existing dialog
   * with its result
   */
  async submit(event: SubmitEvent) {
    event.preventDefault()

    this.submitting = true
    const form = this.form
    const body = new FormData(form)
    body.append('repo', body.get('repo') || '')
    body.append('skip_error_flash', 'true')
    body.delete('source_branch')
    const response = await fetch(form.action, {
      method: form.method,
      body,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    const text = await response.text()
    if (response.ok) {
      this.error = null
      form.hidden = true
      this.dispatchEvent(new CustomEvent('created'))
      if (body.has('after_create')) {
        this.result = text
      } else {
        this.closeDialog()
        this.flashMessage(text)
      }
    } else {
      this.error = text
    }

    this.submitting = false
    // Refresh the list of linked branches by submitting the "Link a pull request" form as-is
    const developmentSection = this.developmentForm
    if (developmentSection) {
      const fragment = await fetchSafeDocumentFragment(document, this.sidebarUrl)
      this.sidebarContainer.replaceWith(fragment)
    }

    // if we have a desktop link, it's because the user submitted the form with the
    // open on GitHub Desktop radio button selected
    const desktopUrl = this.desktopLink?.href
    if (desktopUrl) {
      window.location.replace(desktopUrl)
    }
  }

  async checkTagMatchResult(event: CustomEvent) {
    const message = await event.detail.response.text()
    this.error = message || null
  }
}
