import {controller, target} from '@github/catalyst'
import {formatBytes} from '../../../assets/modules/github/format-bytes'
import type {ReactAppElement} from '@github-ui/react-core/ReactAppElement'

type PayloadBase = {
  size: number
  name: string
  hasSSRContent: boolean
  ssrError: boolean
}

type PartialPayload = {
  type: 'partial'
  embeddedData: unknown
} & PayloadBase

type AppPayload = {
  type: 'app'
  payload: unknown
  appPayload: unknown
} & PayloadBase

@controller
class ReactStaffbarElement extends HTMLElement {
  @target payloadSize: HTMLSpanElement
  @target logPayloadButton: HTMLButtonElement
  @target speedscopeLink: HTMLAnchorElement
  @target payloadText: HTMLSpanElement
  @target ssrLink: HTMLSpanElement
  @target ssrError: HTMLSpanElement
  @target viewPayloadButton: HTMLButtonElement

  payloads: Array<PartialPayload | AppPayload> = []

  connectedCallback() {
    document.addEventListener('soft-nav:payload', this.onSoftNavPayload)
    document.addEventListener('turbo:load', this.onTurboLoad)

    this.updateReactVersion()
  }

  disconnectedCallback() {
    document.removeEventListener('soft-nav:payload', this.onSoftNavPayload)
    document.removeEventListener('turbo:load', this.onTurboLoad)
  }

  updateReactVersion() {
    const reactStaffbar = document.querySelector('#staffbar-react-version')
    if (!reactStaffbar) return
    // Trim the date off the end of React's version string to make it fit in the staffbar a little better.
    const trimmedReactVersion = REACT_VERSION.replace(/^(.*)-\d+$/, '$1')
    reactStaffbar.textContent = `| React ${trimmedReactVersion}`
  }

  onSoftNavPayload = (event: Event) => {
    const customEvent = event as CustomEvent<{payload: unknown; appPayload: unknown}>
    const {payload, appPayload} = customEvent.detail
    this.checkReactApp(payload, appPayload)
    this.updatePayload()
  }

  onTurboLoad = () => {
    this.extractPartialPayloads()
    this.updatePayload()
  }

  checkReactApp(payload: unknown, appPayload: unknown) {
    const reactApp = (document.querySelector('react-app') as ReactAppElement) || document.querySelector('projects-v2')

    if (reactApp) {
      const appName = reactApp.getAttribute('app-name') || ''

      // filter out any previous entries for this app
      this.payloads = this.payloads.filter(reactPayload => reactPayload.type !== 'app')

      const tempPayload: AppPayload = {
        name: appName,
        payload,
        appPayload,
        type: 'app',
        size: this.getPayloadChars(payload, appPayload),
        ssrError: !!reactApp.ssrError,
        hasSSRContent: reactApp.hasSSRContent,
      }

      this.payloads.push(tempPayload)
    }
  }

  updatePayload() {
    let hasSSRErrorRollup = false
    let hasSSRContentRollup = false
    let amountOfChars = 0
    const onClickConsoleLogs: Array<() => void> = []

    for (const payload of this.payloads) {
      if (payload.ssrError) hasSSRErrorRollup = true
      if (payload.hasSSRContent) hasSSRContentRollup = true
      amountOfChars += payload.size

      if (payload.type === 'app') {
        onClickConsoleLogs.push(() => {
          // eslint-disable-next-line no-console
          console.group(`React App - ${payload.name}`)
          // eslint-disable-next-line no-console
          console.log({payload: payload.payload, appPayload: payload.appPayload})
          // eslint-disable-next-line no-console
          console.groupEnd()
        })
      } else if (payload.type === 'partial') {
        onClickConsoleLogs.push(() => {
          // eslint-disable-next-line no-console
          console.group(`React Partial - ${payload.name}`)
          // eslint-disable-next-line no-console
          console.log(payload.embeddedData)
          // eslint-disable-next-line no-console
          console.groupEnd()
        })
      }
    }

    // Update payload size
    const payloadSize = formatBytes(amountOfChars, 2)
    this.payloadSize.textContent = payloadSize
    this.viewPayloadButton.ariaLabel = `${payloadSize}, React payload size`
    // eslint-disable-next-line i18n-text/no-en
    this.payloadText.textContent = `The payload size is ${payloadSize}.`

    // Update SSR info
    const showSSRError = hasSSRErrorRollup
    const showSSRSuccess = hasSSRContentRollup && !showSSRError

    this.ssrLink.hidden = !showSSRSuccess
    this.ssrError.hidden = !showSSRError

    // Misc element updates
    this.updateSpeedscopeLink()
    this.updateVisibility()

    // Update click events
    if (this.payloads.length > 0) {
      const payloadButton = this.logPayloadButton
      if (payloadButton) {
        payloadButton.onclick = () => {
          // eslint-disable-next-line no-console
          console.group('React Payloads')
          for (const onClickConsoleLog of onClickConsoleLogs) {
            onClickConsoleLog()
          }
          // eslint-disable-next-line no-console
          console.groupEnd()
        }
      }
    }
  }

  extractPartialPayloads() {
    const reactPartials: NodeListOf<ReactAppElement> = document.querySelectorAll('react-partial')

    for (const reactPartial of reactPartials) {
      const partialName = reactPartial.getAttribute('partial-name')!
      const embeddedDataElement = reactPartial.querySelector(
        `react-partial[partial-name="${partialName}"] > script[type="application/json"][data-target="react-partial.embeddedData"]`,
      )

      const embeddedDataText = embeddedDataElement?.textContent || '{}'
      const embeddedData = JSON.parse(embeddedDataText)
      const tempPayload: PartialPayload = {
        name: partialName,
        embeddedData,
        size: embeddedDataText.length,
        type: 'partial',
        ssrError: !!reactPartial.ssrError,
        hasSSRContent: reactPartial.hasSSRContent,
      }

      this.payloads.push(tempPayload)
    }
  }

  getPayloadChars(payload: unknown, appPayload: unknown) {
    return (payload ? JSON.stringify(payload).length : 0) + (appPayload ? JSON.stringify(appPayload).length : 0)
  }

  updateVisibility() {
    this.hidden = this.payloads.length === 0
  }

  updateSpeedscopeLink() {
    const title = `${document.location.pathname.replaceAll('/', '_')}_${new Date().toISOString()}.stackprof.json`
    const speedscopeUrl = `${document.location.origin}${document.location.pathname}?flamegraph=1&flamegraph_interval=500&flamegraph_output=json&flamegraph_json`
    this.speedscopeLink.href = `/_speedscope/index.html#profileURL=${encodeURIComponent(
      speedscopeUrl,
    )}&title=${encodeURIComponent(title)}`
  }
}
