import {controller, attr, target} from '@github/catalyst'
import {getItem, removeItem, setItem} from '@github-ui/safe-storage/session-storage'
import type {SoftNavErrorEvent, SoftNavMechanism, SoftNavSuccessEvent} from '@github-ui/soft-nav/events'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {getCurrentReactAppName} from '@github-ui/soft-nav/utils'

const ERROR_MAP: {[key: string]: string} = {
  reload: 'Reload',
  tracked_element_mismatch: 'Some of the elements tracked by Turbo have changed:',
  request_failed: 'The request failed',
  turbo_disabled: 'Turbo is disabled',
  turbo_visit_control_is_reload: 'Turbo visit control forced a reload',
  404: '404',
  500: '500',
  repo_mismatch: "Can't Turbo navigate between different repos",
  missing_turbo_body: 'The new page does not have a data-turbo-body element',
}

const MECHANISM_MAP: {[key in SoftNavMechanism]: string} = {
  turbo: 'Turbo Drive',
  'turbo.frame': 'Turbo Frame',
  react: 'React',
}

const MECHANISM_COUNT_KEY = 'soft-nav:mechanism-count'
const SOFT_NAV_HISTORY = 'soft-nav:history'

interface SoftNavHistory {
  url: string
  mechanism: SoftNavMechanism | 'hard'
  app: string
}

@controller
class SoftNavStaffbarElement extends HTMLElement {
  @target off: SoftNavStaffbarStateElement
  @target success: SoftNavStaffbarStateElement
  @target error: SoftNavStaffbarStateElement

  @target initialTemplate: HTMLTemplateElement
  @target turboTemplate: HTMLTemplateElement
  @target turboFrameTemplate: HTMLTemplateElement
  @target reactTemplate: HTMLTemplateElement

  states: SoftNavStaffbarStateElement[] = []
  softNavCounter: {[key in SoftNavMechanism]: number}
  softNavHistory: SoftNavHistory[] = []

  connectedCallback() {
    this.initSoftNavTrackers()
    this.states = [this.off, this.success, this.error]
    document.addEventListener(SOFT_NAV_STATE.INITIAL, this.showOff)
    document.addEventListener(SOFT_NAV_STATE.SUCCESS, this.showSuccess)
    document.addEventListener(SOFT_NAV_STATE.ERROR, this.showError)
  }

  disconnectedCallback() {
    document.removeEventListener(SOFT_NAV_STATE.INITIAL, this.showOff)
    document.removeEventListener(SOFT_NAV_STATE.SUCCESS, this.showSuccess)
    document.removeEventListener(SOFT_NAV_STATE.ERROR, this.showError)
  }

  showOff = () => {
    this.resetTrackers()
    this.initSoftNavTrackers()
    this.hideAll()
    this.off.show()
  }

  showSuccess = (event: SoftNavSuccessEvent) => {
    const {visitCount = 0, mechanism = 'turbo'} = event

    this.incrementCounter(mechanism)
    this.pushToHistory(mechanism)
    this.hideAll()

    this.success.show(mechanism)
    this.success.content = String(visitCount)
    this.success.message = this.success.messageTemplate.replace('{count}', String(visitCount))

    this.success.messageTarget.textContent = ''
    this.success.messageTarget.append(...this.buildSuccessMessage())
  }

  showError = (event: SoftNavErrorEvent) => {
    this.resetTrackers()
    const detail = event.error || 'reload'
    const [errorKey, ...tags] = detail.split('-')

    let errorMessage = ERROR_MAP[errorKey!]!

    for (const tag of tags) {
      errorMessage += `\n- ${tag}`
    }

    this.hideAll()
    this.error.show()
    this.error.message = this.error.messageTemplate.replace('{reason}', errorMessage)
  }

  hideAll = () => {
    for (const state of this.states) {
      state.hide()
    }
  }

  buildSuccessMessage(): NodeList {
    const container = document.createElement('div')
    const spacer = document.createElement('br')

    const summary = document.createElement('h3')
    summary.textContent = 'Summary'
    container.appendChild(summary)
    container.appendChild(spacer.cloneNode())

    container.appendChild(this.buildCounters())
    container.appendChild(spacer.cloneNode())

    const history = document.createElement('h3')
    history.textContent = 'History'
    container.appendChild(history)
    container.appendChild(spacer.cloneNode())

    container.appendChild(this.buildTimeline())

    return container.childNodes
  }

  buildCounters() {
    const counters = document.createElement('div')

    for (const [mechanism, count] of Object.entries(this.softNavCounter)) {
      if (count > 0) {
        const counter = document.createElement('p')
        counter.textContent = `${count} ${MECHANISM_MAP[mechanism as SoftNavMechanism]} navigations`
        counters.appendChild(counter)
      }
    }

    return counters
  }

  buildTimeline() {
    const navigationsContainer = document.createElement('div')

    for (const {url, mechanism, app} of this.softNavHistory) {
      const navigation = this.buildTimelineItem(mechanism, url, app)
      if (navigation) navigationsContainer.appendChild(navigation)
    }

    return navigationsContainer
  }

  buildTimelineItem(mechanism: SoftNavMechanism | 'hard', url: string, app: string): HTMLElement | undefined {
    const navigation = this.getTemplate(mechanism)?.content?.cloneNode(true) as HTMLElement

    if (!navigation) return

    const navigationBody = navigation.querySelector('[data-template-body]')

    if (!navigationBody) return

    navigationBody.textContent = url

    if (app !== '') {
      const appNode = document.createElement('i')
      appNode.textContent = `(${app}) `
      navigationBody.prepend(appNode)
    }

    return navigation
  }

  getTemplate(mechanism: SoftNavMechanism | 'hard') {
    switch (mechanism) {
      case 'turbo':
        return this.turboTemplate
      case 'turbo.frame':
        return this.turboFrameTemplate
      case 'react':
        return this.reactTemplate
      default:
        return this.initialTemplate
    }
  }

  initSoftNavTrackers() {
    this.softNavCounter = {
      turbo: Number(getItem(`${MECHANISM_COUNT_KEY}-turbo`)),
      'turbo.frame': Number(getItem(`${MECHANISM_COUNT_KEY}-turbo.frame`)),
      react: Number(getItem(`${MECHANISM_COUNT_KEY}-react`)),
    }

    const history = getItem(SOFT_NAV_HISTORY)

    if (history) {
      try {
        this.softNavHistory = JSON.parse(history)
      } catch {
        this.initHistory()
      }
    } else {
      this.initHistory()
    }
  }

  initHistory() {
    this.softNavHistory = []
    this.pushToHistory('hard')
  }

  incrementCounter(mechanism: SoftNavMechanism) {
    this.softNavCounter[mechanism]++
    setItem(`${MECHANISM_COUNT_KEY}-${mechanism}`, String(this.softNavCounter[mechanism]))
  }

  pushToHistory(mechanism: SoftNavMechanism | 'hard') {
    this.softNavHistory.push({url: window.location.href, mechanism, app: getCurrentReactAppName() || ''})
    setItem(SOFT_NAV_HISTORY, JSON.stringify(this.softNavHistory))
  }

  resetTrackers() {
    removeItem(`${MECHANISM_COUNT_KEY}-turbo`)
    removeItem(`${MECHANISM_COUNT_KEY}-turbo.frame`)
    removeItem(`${MECHANISM_COUNT_KEY}-react`)
    removeItem(SOFT_NAV_HISTORY)
  }
}

@controller
class SoftNavStaffbarStateElement extends HTMLElement {
  @attr content: string
  @attr message: string
  @attr messageTemplate: string

  @target button: HTMLButtonElement
  @target messageTarget: HTMLElement
  @target contentTarget: HTMLElement

  @target turboIcon: SVGElement
  @target turboFrameIcon: SVGElement
  @target reactIcon: SVGElement

  static observedAttributes = ['data-content', 'data-dialog', 'data-message-template']

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    this.render()
  }

  show = (mechanism?: SoftNavMechanism) => {
    this.hidden = false
    this.toggleIcons(mechanism)
  }

  hide = () => {
    this.hidden = true
  }

  render = () => {
    if (this.button) {
      // eslint-disable-next-line i18n-text/no-en
      this.button.ariaLabel = `View soft navigation status (${this.message})`
    }
    if (this.contentTarget) {
      this.contentTarget.textContent = this.content
    }
    if (this.messageTarget) {
      this.messageTarget.textContent = ''
      if (this.message) {
        const lines = this.message.split('\n')
        this.messageTarget.textContent += lines.shift()
        for (const line of lines) {
          this.messageTarget.appendChild(document.createElement('br'))
          this.messageTarget.append(line)
        }
      }
    }
  }

  toggleIcons(mechanism?: SoftNavMechanism) {
    if (!mechanism) return

    this.hideIcon(this.turboIcon)
    this.hideIcon(this.turboFrameIcon)
    this.hideIcon(this.reactIcon)

    switch (mechanism) {
      case 'turbo':
        this.showIcon(this.turboIcon)
        break
      case 'turbo.frame':
        this.showIcon(this.turboFrameIcon)
        break
      case 'react':
        this.showIcon(this.reactIcon)
        break
    }
  }

  hideIcon(icon: SVGElement) {
    icon.setAttribute('aria-hidden', 'true')
    icon.setAttribute('hidden', 'true')
  }

  showIcon(icon: SVGElement) {
    icon.removeAttribute('aria-hidden')
    icon.removeAttribute('hidden')
  }
}
