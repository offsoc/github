import ReactProfilingMode from '@github-ui/react-profiling-mode'
import type {DetailedHTMLProps, HTMLAttributes} from 'react'
import type {createRoot as createRootType, hydrateRoot as hydrateRootType, Root} from 'react-dom/client'
import {createRoot} from 'react-dom/client'

import Memex from './memex'
import {renderMemex} from './render-memex'
import {PROJECT_ROUTE} from './routes'

type ReactDOM = {
  createRoot: typeof createRootType
  hydrateRoot: typeof hydrateRootType
}

class ProjectsV2 extends HTMLElement {
  declare reactRoot: Root | undefined
  async connectedCallback() {
    const createRootFromClientOrProfiling = ReactProfilingMode.isEnabled()
      ? (await this.#getReactDomWithProfiling()).createRoot
      : createRoot
    const reactRoot = createRootFromClientOrProfiling(this)
    this.reactRoot = reactRoot
    const match = PROJECT_ROUTE.matchFullPathOrChildPaths(window.location.pathname)
    if (!match) return
    renderMemex(<Memex rootElement={this} />, this, reactRoot)
  }

  disconnectedCallback() {
    this.reactRoot?.unmount()
  }

  #getReactDomWithProfiling() {
    return import('react-dom/profiling') as unknown as Promise<ReactDOM>
  }
}

function register() {
  if (typeof window === 'undefined') return
  if (!window.customElements.get('projects-v2')) {
    // eslint-disable-next-line custom-elements/tag-name-matches-class
    window.customElements.define('projects-v2', ProjectsV2)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'projects-v2': DetailedHTMLProps<HTMLAttributes<ProjectsV2>, ProjectsV2>
    }
  }
}

register()
