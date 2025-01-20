import type {Scope} from '../../assets/modules/github/command-palette/command-palette-scope-element'
import {CommandPaletteScopeElement} from '../../assets/modules/github/command-palette/command-palette-scope-element'
import type {Octicon, Page} from '@github-ui/command-palette'
import {attr, controller, targets} from '@github/catalyst'
import {CommandPalettePageElement} from './command-palette-page-element'
import {Query} from '../../assets/modules/github/command-palette/query'

export type OcticonSvgs = {[name: string]: string}

@controller
export class CommandPalettePageStackElement extends HTMLElement {
  @attr currentMode = ''
  @attr currentQueryText = ''
  @attr defaultScopeId = ''
  @attr defaultScopeType = ''
  @attr hasVisibleTip = false

  @targets pages: CommandPalettePageElement[]
  @targets defaultPages: CommandPalettePageElement[]
  @targets localOcticons: HTMLElement[]

  eventListenersBound = false
  octiconCache: OcticonSvgs = {}

  get currentPage(): CommandPalettePageElement {
    return this.pages[this.pages.length - 1]!
  }

  get nonRootPages(): CommandPalettePageElement[] {
    return this.pages.filter(p => !p.isRoot)
  }

  get resetPages(): CommandPalettePageElement[] {
    const defaultPages = this.defaultPages
    const lastPageIndex = defaultPages.length - 1

    return defaultPages.map((page, index) => {
      const pageElement = page.cloneNode() as CommandPalettePageElement
      pageElement.hidden = index !== lastPageIndex
      pageElement.removeAttribute('data-targets')

      return pageElement
    })
  }

  get query(): Query {
    return new Query(this.currentQueryText, this.currentMode, {
      scope: this.scope,
      subjectId: this.defaultScopeId,
      subjectType: this.defaultScopeType,
    })
  }

  get scope(): Scope {
    if (this.currentPage.isRoot) {
      return CommandPaletteScopeElement.emptyScope
    }

    return {
      text: this.currentPage.pageTitle,
      type: this.currentPage.scopeType,
      id: this.currentPage.scopeId,
      tokens: this.nonRootPages.map(page => {
        return {
          text: page.pageTitle,
          type: page.scopeType,
          id: page.scopeId,
          value: page.pageTitle,
        }
      }),
    }
  }

  push(page: Page, hidden = false) {
    if (this.hasPage(page)) return

    const pageElement = new CommandPalettePageElement({
      page,
      hidden,
      defaultScopeId: this.defaultScopeId,
      defaultScopeType: this.defaultScopeType,
    })
    pageElement.hasVisibleTip = this.hasVisibleTip

    this.hideCurrentPages()
    this.append(pageElement)
    pageElement.octicons = this.octiconCache
    pageElement.fetch()
    this.pageStackUpdated()
  }

  pop() {
    if (!this.currentPage.isRoot) {
      this.removeChild(this.currentPage)
      this.activateCurrentPage()
    }
  }

  clear(activateAfterClear = true) {
    for (const page of this.nonRootPages) {
      this.removeChild(page)
    }

    if (activateAfterClear) this.activateCurrentPage()
  }

  reset() {
    this.clear(false)
    this.currentPage.clearItems()

    for (const pageElement of this.resetPages) {
      this.append(pageElement)
    }

    this.currentPage.octicons = this.octiconCache
    this.pageStackUpdated()
  }

  activateCurrentPage() {
    this.currentQueryText = ''
    this.currentPage.hasVisibleTip = this.hasVisibleTip
    this.currentPage.octicons = this.octiconCache
    this.currentPage.reactivate(this.query)
    this.pageStackUpdated()
  }

  // Checks if the stack contains a page matching these props.
  // Currently only checks scope ID, other attributes can be added as needed.
  hasPage(page: Page): boolean {
    return this.pages.some(existingPage => existingPage.scopeId === page.scopeId)
  }

  hideCurrentPages() {
    for (const page of this.pages) {
      page.hidden = true
    }
  }

  navigate(diff: number) {
    this.currentPage.navigate(diff)
  }

  cacheOcticons(event: Event) {
    if (!(event instanceof CustomEvent)) return
    this.addOcticonsToCache(event.detail.octicons)
  }

  cacheLocalOcticons() {
    this.addOcticonsToCache(
      this.localOcticons.map(octiconElement => {
        return {id: octiconElement.getAttribute('data-octicon-id'), svg: octiconElement.innerHTML.trim()} as Octicon
      }),
    )
  }

  addOcticonsToCache(octicons: Octicon[]) {
    for (const octicon of octicons) {
      this.octiconCache[octicon.id] = octicon.svg
    }
  }

  // Things that need to be done whenever the command palette is activated
  commandPaletteActivated() {
    this.hideCurrentPages()
    this.activateCurrentPage()
    this.bindListeners()
  }

  pageStackUpdated() {
    this.dispatchEvent(new CustomEvent('command-palette-page-stack-updated', {bubbles: true}))
  }

  connectedCallback() {
    this.setAttribute('data-target', 'command-palette.pageStack')

    this.cacheLocalOcticons()
  }

  static observedAttributes = ['data-current-mode', 'data-current-query-text', 'data-has-visible-tip']

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (!this.isConnected) return
    if (!this.currentPage) return

    if (oldValue !== newValue) {
      switch (name) {
        case 'data-current-query-text':
        case 'data-current-mode':
          this.currentPage.query = this.query
          this.currentPage.fetch()
          break
        case 'data-has-visible-tip':
          this.currentPage.hasVisibleTip = this.hasVisibleTip
          break
      }
    }
  }

  disconnectedCallback() {
    this.unbindListeners()
  }

  bindListeners() {
    // we can't use ResizeObserver because we're actively
    // resizing this element when we `setMaxHeight`.

    if (!this.eventListenersBound) {
      // eslint-disable-next-line github/prefer-observers
      window.addEventListener('resize', () => this.currentPage.setMaxHeight())
      this.eventListenersBound = true
    }
  }

  unbindListeners() {
    window.removeEventListener('resize', () => this.currentPage.setMaxHeight())
    this.eventListenersBound = false
  }
}
