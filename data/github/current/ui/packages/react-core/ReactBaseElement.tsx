import {target} from '@github/catalyst'
import {createRoot, hydrateRoot} from 'react-dom/client'
import type {createRoot as createRootType, hydrateRoot as hydrateRootType, Root} from 'react-dom/client'
import React from 'react'
import ReactProfilingMode from '@github-ui/react-profiling-mode'
import {EXPECTED_ERRORS} from './expected-errors'
import {sendStats} from '@github-ui/stats'

type ReactDOM = {
  createRoot: typeof createRootType
  hydrateRoot: typeof hydrateRootType
}

const REACT_INVARIANT_ERROR_REGEX = /Minified React error #(?<invariant>\d+)/

export abstract class ReactBaseElement<T> extends HTMLElement {
  @target embeddedData: HTMLScriptElement | undefined
  @target ssrError: HTMLScriptElement | undefined
  @target reactRoot: HTMLElement | undefined
  private root: Root | undefined

  abstract nameAttribute: string
  abstract getReactNode(embeddedData: T): Promise<React.ReactNode>

  protected get name() {
    return this.getAttribute(this.nameAttribute) as string
  }

  private get embeddedDataText() {
    const text = this.embeddedData?.textContent

    if (!text) {
      throw new Error(`No embedded data provided for react element ${this.name}`)
    }

    return text
  }

  get hasSSRContent() {
    return this.getAttribute('data-ssr') === 'true'
  }

  connectedCallback() {
    this.renderReact()
  }

  disconnectedCallback() {
    this.root?.unmount()
    this.root = undefined
  }

  private async renderReact() {
    if (!this.reactRoot) throw new Error('No react root provided')
    let reactDom: ReactDOM = {
      createRoot,
      hydrateRoot,
    }

    // Override the react-dom import if we're in profiling mode
    if (ReactProfilingMode.isEnabled()) {
      reactDom = await this.getReactDomWithProfiling()
    }

    const embeddedData = JSON.parse(this.embeddedDataText) as T
    const ssrErrorText = this.ssrError?.textContent
    const node = await this.getReactNode(embeddedData)
    const baseNode = <React.StrictMode>{node}</React.StrictMode>

    if (ssrErrorText) {
      this.logSSRError(ssrErrorText)
    }

    if (this.hasSSRContent) {
      /**
       * Styled-components automatically looks for style tags to hydrate on first page load, but will not detect them
       * if they are added after the initial page load. This causes a hydration error because React isn't expecting
       * a style tag within the app. To work around this, we need to manually move the style tags to the head before
       * hydrating the app.
       *
       * During hydration, styled-components will create a new style tag which matches the one we moved to the head.
       * This means that after hydration, we can safely remove the style tag we manually moved to the head.
       */
      const styles = this.querySelector('style[data-styled="true"]')
      if (styles) document.head.appendChild(styles)

      // Hydrate the react app
      // onRecoverableError is disabled until we have a react version with this fix in:
      // https://github.com/facebook/react/pull/25692
      this.root = reactDom.hydrateRoot(this.reactRoot, baseNode, {
        onRecoverableError: error => {
          if (!(error instanceof Error)) return

          const match = REACT_INVARIANT_ERROR_REGEX.exec(error.message)
          const invariant = String(match?.groups?.invariant)

          sendStats({
            incrementKey: 'REACT_HYDRATION_ERROR',
            incrementTags: {
              appName: this.name,
              invariant,
            },
          })
        },
      })

      // Remove the manually moved style tag after hydration
      if (styles) {
        // Wait until things are idle to remove the style tag. If we do it immediately, we can cause a flash of unstyled content.
        requestIdleCallback(() => {
          // styles could have already been removed by Turbo if a navigation happens quickly. Only remove it from the DOM if it's still there.
          styles.parentElement?.removeChild(styles)
        })
      }
    } else {
      this.root = reactDom.createRoot(this.reactRoot)
      this.root.render(baseNode)
    }

    this.classList.add('loaded')
  }

  private getReactDomWithProfiling() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return import('react-dom/profiling') as any as Promise<ReactDOM>
  }

  private logSSRError(ssrErrorText: string) {
    if (EXPECTED_ERRORS[ssrErrorText]) {
      // eslint-disable-next-line no-console
      return console.error('SSR failed with an expected error:', EXPECTED_ERRORS[ssrErrorText])
    }

    try {
      const error = JSON.parse(ssrErrorText) as PlatformJavascriptError
      const stacktrace = parseFailbotStacktrace(error)
      // eslint-disable-next-line no-console
      console.error('Error During Alloy SSR:', `${error.type}: ${error.value}\n`, error, stacktrace)
    } catch {
      /**
       * In the event we couldn't log the error, we should not break the application
       */
      // eslint-disable-next-line no-console
      console.error('Error During Alloy SSR:', ssrErrorText, 'unable to parse as json')
    }
  }
}

function parseFailbotStacktrace(error: PlatformJavascriptError) {
  if (!error.stacktrace) return ''
  let prefix = '\n '
  const stack = error.stacktrace.map((frame: PlatformStackframe) => {
    const {function: func, filename, lineno, colno} = frame
    const line = `${prefix} at ${func} (${filename}:${lineno}:${colno})`
    prefix = ' '
    return line
  })
  return stack.join('\n')
}
