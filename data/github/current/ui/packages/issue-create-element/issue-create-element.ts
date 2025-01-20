import {attr, controller} from '@github/catalyst'

@controller
export class IssueCreateElement extends HTMLElement {
  /**
   * The name of the app that is sending the event.
   *
   * We collect analytics events of where an issue is created from to understand how users interact with issues from
   * the multiple entry points we provide.
   */
  @attr 'analytics-app-name': string
  /**
   * The specific location in the app where this exists.
   * e.g. "Header", "Issues Index"
   *
   * We collect analytics events of where an issue is created from to understand how users interact with issues from
   * the multiple entry points we provide.
   */
  @attr 'analytics-namespace': string

  connectedCallback() {
    // TODO: is there a better way to do this to select the parent menu item?
    if (this.parentElement) {
      this.parentElement.addEventListener('click', this.openDialog.bind(this))
    }
  }

  async openDialog() {
    const dialog = document.querySelector('issue-create-dialog')
    if (dialog) {
      // lazily import the issue-create package to not impact the initial bundle size
      const {IssueCreateDialogElement} = await import('@github-ui/issue-create/IssueCreateDialogElement')

      dialog.setAttribute('analytics-app-name', this['analytics-app-name'])
      dialog.setAttribute('analytics-namespace', this['analytics-namespace'])

      dialog.setAttribute('isenabled', 'true')
      const random = Math.floor(Math.random() * 1000000)
      dialog.setAttribute('key', random.toString())
    }
  }
}
