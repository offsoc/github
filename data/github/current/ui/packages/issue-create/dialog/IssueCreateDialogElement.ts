// eslint-disable-next-line filenames/match-regex
import {type Root, createRoot} from 'react-dom/client'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import type {CreateIssueModalProps} from './IssueCreateDialogWebComponent'
import {GetElement} from './IssueCreateDialogWebComponent'

export class IssueCreateDialogElement extends HTMLElement {
  root: Root | undefined
  connectedCallback() {
    const container = document.createElement('div')
    this.root = createRoot(container)
    this.append(container)
    this.render()
  }

  static get observedAttributes() {
    return ['isenabled', 'key', 'owner', 'repository', 'analytics-app-name', 'analytics-namespace']
  }

  attributeChangedCallback() {
    if (!this.isConnected) return
    this.render()
  }

  render() {
    const isEnabled = this.getAttribute('isenabled') === 'true'
    const key = this.getAttribute('key')
    const owner = this.getAttribute('owner')
    const repository = this.getAttribute('repository')
    const analyticsAppName = this.getAttribute('analytics-app-name')
    const analyticsNamespace = this.getAttribute('analytics-namespace')
    if (!this.root || !isEnabled || !key || key.length < 1) return

    this.root.render(
      GetElement({isEnabled, key, owner, repository, analyticsAppName, analyticsNamespace} as CreateIssueModalProps),
    )
  }
}

if (ssrSafeWindow && !ssrSafeWindow.customElements.get('issue-create-dialog')) {
  ssrSafeWindow.customElements.define('issue-create-dialog', IssueCreateDialogElement)
}
