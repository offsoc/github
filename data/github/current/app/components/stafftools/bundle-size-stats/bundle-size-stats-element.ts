import {controller, target} from '@github/catalyst'
import {html, render} from 'lit-html'
import {formatBytes} from '../../../assets/modules/github/format-bytes'
import {loaded} from '@github-ui/document-ready'
import {sendEvent} from '@github-ui/hydro-analytics'
import {isStaff} from '@github-ui/stats'
import {BundleSizeLog, type LogEntry, type BundleSize} from './bundle-size-log'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import type {SoftNavSuccessEvent} from '@github-ui/soft-nav/events'

let pageLoadReported = false
@controller
class BundleSizeStatsElement extends HTMLElement {
  @target logList: HTMLUListElement

  #bundleSizeLog = new BundleSizeLog()

  clearLog() {
    this.#bundleSizeLog.reset()
    this.renderEntries()
  }

  connectedCallback() {
    // Make sure initial load event is reported only once. Detach it from component lifecycle.
    if (!pageLoadReported) {
      this.initialLoad()
      pageLoadReported = true
    }
    document.addEventListener(SOFT_NAV_STATE.SUCCESS, this.onSoftNav)
  }

  disconnectedCallback() {
    document.removeEventListener(SOFT_NAV_STATE.SUCCESS, this.onSoftNav)
  }

  private async initialLoad() {
    await loaded

    // eslint-disable-next-line compat/compat
    window.requestIdleCallback(async () => {
      const sizes = await getBundleSizes()
      this.#bundleSizeLog.addEntry({...sizes, url: window.location.href, navType: 'initial_load'})
      this.renderEntries()
      sendBundleSize('initial_load', sizes)
    })
  }

  private onSoftNav = async (event: SoftNavSuccessEvent) => {
    const sizes = await getBundleSizes()
    this.#bundleSizeLog.addEntry({...sizes, url: window.location.href, navType: event.mechanism})
    this.renderEntries()
    sendBundleSize(event.mechanism, sizes)
  }

  private renderEntries() {
    render(html`${this.#bundleSizeLog.entries().map(this.entryTemplate)}`, this.logList)
  }

  private entryTemplate = ({timestamp, url, js, css, navType}: LogEntry) => {
    return html`
      <li class="d-block my-2">
        <hr />
        <p class="color-fg-muted mb-0">Timestamp - ${timestamp}</p>
        <p class="color-fg-muted mb-0">Url - ${url}</p>
        <p class="color-fg-muted mb-0">Navigation type - ${navType}</p>
        <p class="color-fg-muted mb-0">
          JS bundle size (encoded/decoded) - ${formatBytes(js.encoded)} / ${formatBytes(js.decoded)}
        </p>
        <p class="color-fg-muted mb-0">
          CSS bundle size (encoded/decoded) - ${formatBytes(css.encoded)} / ${formatBytes(css.decoded)}
        </p>
      </li>
    `
  }
}

let lastSeenResourceIndex = 0
async function getBundleSizes(): Promise<{js: BundleSize; css: BundleSize}> {
  await loaded
  const resources = window.performance.getEntriesByType(
    'resource',
  ) as unknown as PlatformBrowserPerformanceResourceTiming[]

  const jsResourcesSize: BundleSize = {decoded: 0, encoded: 0}
  const cssResourcesSize: BundleSize = {decoded: 0, encoded: 0}

  for (const resource of resources.slice(lastSeenResourceIndex)) {
    if (resource.name.endsWith('.js') && resource.initiatorType === 'script') {
      jsResourcesSize.decoded += resource.decodedBodySize || 0
      jsResourcesSize.encoded += resource.encodedBodySize || 0
    } else if (resource.name.endsWith('.css') && resource.initiatorType === 'link') {
      cssResourcesSize.decoded += resource.decodedBodySize || 0
      cssResourcesSize.encoded += resource.encodedBodySize || 0
    }
  }

  lastSeenResourceIndex = resources.length
  return {js: jsResourcesSize, css: cssResourcesSize}
}

async function sendBundleSize(navType: string, metric: {js: BundleSize; css: BundleSize}) {
  if (!document.querySelector('[data-hydrostats="publish"]') || !isStaff()) {
    return
  }

  const {js, css} = metric

  const context = {
    react: Boolean(document.querySelector('react-app')),
    ['nav_type']: navType,
  }

  sendEvent('bundle-size', {
    name: 'js',
    decoded: js.decoded,
    encoded: js.encoded,
    ...context,
  })

  sendEvent('bundle-size', {
    name: 'css',
    decoded: css.decoded,
    encoded: css.encoded,
    ...context,
  })
}
