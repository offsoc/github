import '@github/details-menu-element'
import {attr, controller, target} from '@github/catalyst'
import {CaretPositionKind, shouldRedirectInsteadOfSearch} from './parsing/common'
// `import type` so that we don't bring the parser code in on every page load
import type {BaseNode, FinalNode, NothingNode} from '@github/blackbird-parser'
import type {SuggestionInputState, CustomScope} from './suggestions/types'
import {logPageView} from '../../assets/modules/github/jump-to/page-views'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'
import {sendEvent} from '@github-ui/hydro-analytics'
import {softNavigate} from '@github-ui/soft-navigate'
import {getBlackbirdExperiments} from './experiments'
import type {QueryBuilderElement, Provider} from '@github-ui/query-builder-element'
import {parseFileAnchor} from '../../assets/modules/github/blob-anchor'
import {
  type QueryElement,
  type QueryTextElement,
  type Parser,
  TextElementStyle,
} from '@github-ui/query-builder-element/query-builder-api'

import {HistoryProvider} from './providers/history'
import {LanguagesProvider} from './providers/languages'
import {ReposFilterProvider, ReposSearchProvider} from './providers/repos'
import {SavedScopeProvider} from './providers/saved'
import {OwnersProvider} from './providers/owners'
import {FixedValuesProvider} from './providers/fixed'
import {TeamsProvider} from './providers/teams'
import {ProjectsProvider} from './providers/projects'
import {BlackbirdProvider} from './providers/blackbird'
import {InputProvider} from './providers/input'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import type {CustomScopesElement} from './custom-scopes-element'
// eslint-disable-next-line import/no-namespace
import type * as Parsing from './parsing/parsing'
import {ExploreProvider} from './providers/explore'
import {CopilotProvider} from './providers/copilot'
/** minimum number of milliseconds between parsing input */
const parseDelay = 15
const nonBreakingSpace = String.fromCharCode(160)

const MAX_LOCAL_HISTORY = 50

// eslint-disable-next-line i18n-text/no-en
const PLACEHOLDER_SAFE_HTML = 'Type <kbd class="AppHeader-search-kbd">/</kbd> to search'

const marketing_pages_search_explore_provider_enabled = isFeatureEnabled('marketing_pages_search_explore_provider')

export interface ParsedIntermediateRepresentation {
  ast?: FinalNode
  query: string
  caretPositionKind?: CaretPositionKind
  caretSelectedNode?: BaseNode
  customScopes?: CustomScope[]
}

@controller
export class QbsearchInputElement extends HTMLElement {
  @target inputButton: HTMLButtonElement
  @target inputButtonText: HTMLSpanElement
  @target queryBuilder: QueryBuilderElement
  @target queryBuilderContainer: HTMLDivElement

  @target clearInputButton: HTMLButtonElement
  @target clearInputButtonSeparator: HTMLDivElement

  @target searchSuggestionsDialog: ModalDialogElement
  @target suggestionHeadingTemplate: HTMLTemplateElement
  @target suggestionTemplate: HTMLTemplateElement
  @target darkBackdrop: HTMLDivElement

  @target customScopesManager: CustomScopesElement

  @target feedbackDialog: ModalDialogElement

  @attr headerRedesignEnabled = false

  #isReactContext: boolean
  #eventAbortController: AbortController | undefined
  #cachesHaveBeenWarmed = false
  #globalNavAlwaysHidden = false
  private lastParsedQuery: string | null
  private ast: FinalNode | undefined
  #caretPositionKind: CaretPositionKind = CaretPositionKind.Text
  #caretSelectedNode: BaseNode | undefined
  // the parsing module is loaded asynchronously
  private parsing: typeof Parsing | undefined
  private parsingPromise: Promise<typeof Parsing> | undefined
  #customScopesSuggestionProvider: SavedScopeProvider
  #dialogFocusReturn: HTMLElement | undefined
  #returnFocusElement: HTMLElement | null = null
  #customScopesUrlPath: string
  #customScopeManagerInitialized = false

  parser: Parser<ParsedIntermediateRepresentation> = {
    parse: (query: string, caretPosition: number | undefined) => {
      if (!this.parsing) {
        // if there is no query, we don't need to load the parser and parse
        // but if we are expanded we should go ahead and get it ready
        if (query || this.classList.contains('expanded')) {
          ;(async () => {
            await this.loadParser()
            // Trigger re-parse when parser is available
            this.queryBuilder.parseQuery()
          })()
        }
        return {
          query,
        }
      }
      const [ast] = this.parsing.parseSearchInput(query)
      const customScopes = this.#findCustomScopesNeededForSearch(ast)

      // If a caret position is specified, calculate caret position metadata
      let caretPositionKind = undefined
      let caretSelectedNode = undefined
      if (caretPosition !== undefined) {
        const caretData = this.parsing.getCaretPositionKindFromIndex(ast, caretPosition)
        caretPositionKind = caretData.kind
        caretSelectedNode = caretData.node
      }

      return {
        ast,
        query,
        caretPositionKind,
        caretSelectedNode,
        customScopes,
      }
    },
    flatten: this.flattenASTForQueryBuilder.bind(this),
  }

  get placeholderText() {
    if (!this.copilotChatEnabled()) return PLACEHOLDER_SAFE_HTML

    return `${PLACEHOLDER_SAFE_HTML} or ask Copilot`
  }

  get query() {
    return this.queryBuilder.input?.value || ''
  }

  set query(v: string) {
    // input can be undefined if the query builder has not been upgraded.
    // it's ok to ignore this because we will update query in the whenDefined handler
    if (this.queryBuilder.input) {
      this.queryBuilder.input.value = v
      this.queryBuilder.parseQuery()
      this.setButtonText(v)
      ;(async () => {
        await this.parseSearchInputRaw()
        this.syncRichButtonText()
      })()
    }
  }

  flattenASTForQueryBuilder(ir: ParsedIntermediateRepresentation): QueryElement[] {
    const highlights = this.parsing?.getHighlights(ir.ast as BaseNode) || []
    highlights.sort((a, b) => a.location.start - b.location.start)
    let pos = 0
    const output: QueryTextElement[] = []
    for (const highlight of highlights) {
      if (highlight.location.start > pos) {
        output.push({
          type: 'text',
          value: ir.query.substring(pos, highlight.location.start),
        })
      }

      if (pos > highlight.location.start) {
        continue
      }

      let style = TextElementStyle.Normal
      if (highlight.className === 'pl-en') {
        style = TextElementStyle.Entity
      } else if (highlight.className === 'pl-c1') {
        style = TextElementStyle.Constant
      } else if (highlight.className === 'input-parsed-symbol') {
        style = TextElementStyle.FilterValue
      }

      output.push({
        type: 'text',
        value: ir.query.substring(highlight.location.start, highlight.location.end),
        style,
      })

      pos = highlight.location.end
    }

    if (pos < ir.query.length) {
      output.push({
        type: 'text',
        value: ir.query.substring(pos),
      })
    }

    return output
  }

  isRetainScrollPosition(): boolean {
    return this.getAttribute('data-retain-scroll-position') === 'true'
  }

  isLoggedIn(): boolean {
    return this.getAttribute('data-logged-in') === 'true'
  }

  copilotChatEnabled(): boolean {
    return this.getAttribute('data-copilot-chat-enabled') === 'true'
  }

  connectedCallback(): void {
    this.#isReactContext = false
    if (this.isLoggedIn()) {
      this.#customScopesUrlPath = this.getAttribute('data-custom-scopes-path') || ''
      this.#customScopesSuggestionProvider = new SavedScopeProvider(this.queryBuilder, this.#customScopesUrlPath)
      // Initialize custom scopes manager when it is loaded
      ;(async () => {
        await window.customElements.whenDefined('custom-scopes')
        this.customScopesManager.initialize(
          this.#customScopesSuggestionProvider.customScopesCache,
          () => {
            return this.#customScopesSuggestionProvider.fetchSuggestions()
          },
          this.#customScopesUrlPath,
          this.getAttribute('data-delete-custom-scopes-csrf') || '',
        )

        this.#customScopeManagerInitialized = true
      })()
    }
    // listen for react startup
    const {signal} = (this.#eventAbortController = new AbortController())
    window.addEventListener(
      'blackbird_monolith_react_connected',
      () => {
        this.#isReactContext = true
      },
      {signal},
    )

    // Listen for when react disconnects. This can happen e.g. during a Turbo page navigation,
    // where React is lost, but the search input isn't refreshed!
    window.addEventListener(
      'blackbird_monolith_react_disconnected',
      () => {
        this.#isReactContext = false
      },
      {signal},
    )

    window.addEventListener(
      'blackbird_provide_feedback',
      () => {
        if (this.feedbackDialog instanceof HTMLDialogElement) {
          this.feedbackDialog.showModal()
        } else {
          this.feedbackDialog.show()
        }
      },
      {signal},
    )

    window.addEventListener(
      'blackbird_monolith_set_global_nav_visibility',
      event => {
        const globalNavVisibility = (event as CustomEvent).detail
        this.setGlobalNavVisibility(globalNavVisibility)
        this.setGlobalBarAlwaysExpanded(!globalNavVisibility)

        this.#globalNavAlwaysHidden = !globalNavVisibility

        if (this.#globalNavAlwaysHidden) {
          this.classList.add('flex-1')
        } else {
          this.classList.remove('flex-1')
        }

        this.setButtonText(this.query)
      },
      {signal},
    )

    // In case react loaded before we did, emit request to re-transmit react startup
    window.dispatchEvent(new CustomEvent('blackbird_monolith_retransmit_react'))

    window.addEventListener(
      'blackbird_monolith_update_input',
      event => {
        this.query = (event as CustomEvent).detail
      },
      {signal},
    )

    window.addEventListener(
      'blackbird_monolith_append_and_focus_input',
      async event => {
        const {
          appendQuery,
          retainScrollPosition,
          returnTarget,
        }: {appendQuery?: string; retainScrollPosition?: boolean; returnTarget?: HTMLElement} = (event as CustomEvent)
          .detail

        if (returnTarget && retainScrollPosition) {
          this.expandAndRetainScrollPosition(returnTarget)
        } else {
          await this.expand(this.isRetainScrollPosition())
          if (returnTarget) {
            this.#returnFocusElement = returnTarget
          }
        }

        if (appendQuery && !this.query.trim().endsWith(appendQuery)) {
          this.query += ` ${appendQuery}`
        }
        if (!this.parsing) {
          await this.loadParser()
        }
        this.moveCaretToEndOfInput()
        await this.parseSearchInputRaw()
      },
      {signal},
    )

    window.addEventListener(
      'blackbird_monolith_save_query_as_custom_scope',
      event => {
        this.saveQueryAsCustomScope(event as CustomEvent<HTMLElement>)
      },
      {signal},
    )
    ;(async () => {
      await window.customElements.whenDefined('query-builder')

      const loggedInProviders: Provider[] = [
        new HistoryProvider(this.queryBuilder),
        new SavedScopeProvider(this.queryBuilder, this.#customScopesUrlPath),
        new BlackbirdProvider(this.queryBuilder, this),
        new CopilotProvider(this.queryBuilder, this),
      ]

      const loggedOutProviders: Provider[] = marketing_pages_search_explore_provider_enabled
        ? [new ExploreProvider(this.queryBuilder)]
        : []

      const providers: Provider[] = [
        new LanguagesProvider(this.queryBuilder),
        new ReposFilterProvider(this.queryBuilder, this),
        new ReposSearchProvider(this.queryBuilder, this),
        new OwnersProvider(this.queryBuilder, this),
        new FixedValuesProvider(this.queryBuilder),
        new TeamsProvider(this.queryBuilder, this),
        new ProjectsProvider(this.queryBuilder, this),
        new InputProvider(this.queryBuilder, this),
      ]

      if (this.isLoggedIn()) {
        providers.push(...loggedInProviders)
      } else {
        providers.push(...loggedOutProviders)
      }

      this.queryBuilder.initialize(this.parser, providers)
      // Sync the initial state with querybuilder
      this.query = this.getAttribute('data-initial-value') || ''
    })()

    this.queryBuilder.parentElement?.addEventListener('submit', (event: Event) => {
      this.search(this.queryBuilder.query)
      this.retract()
      this.queryBuilder.inputSubmit()
      event.preventDefault()
    })

    this.queryBuilder.addEventListener('blackbird-monolith.manageCustomScopes', e => {
      if (this.#customScopeManagerInitialized) {
        this.#openManageCustomScopesDialog(e)
      }
    })

    this.queryBuilder.addEventListener('query-builder:navigate', e => {
      // If the navigation is a hash navigation, emit the scrollLineIntoView event
      const href = (e as CustomEvent).detail?.url
      if (href) {
        const url = new URL(href, window.location.origin)
        if (url.origin === window.location.origin && url.pathname === window.location.pathname) {
          const anchInfo = parseFileAnchor(url.hash)
          if (anchInfo.blobRange?.start?.line) {
            window.dispatchEvent(
              new CustomEvent('react_blob_view_scroll_line_into_view', {
                detail: {line: anchInfo.blobRange.start.line},
              }),
            )
          }
        }
      }
      this.retract()
    })

    this.queryBuilder.addEventListener('blackbird-monolith.search', e => {
      this.search((e as CustomEvent).detail?.query ?? '')
    })

    this.queryBuilder.addEventListener('search-copilot-chat', e => {
      window.dispatchEvent(
        new SearchCopilotEvent((e as CustomEvent).detail?.content, (e as CustomEvent).detail?.repoNwo),
      )
      this.retract()
    })

    this.queryBuilder.addEventListener('convert-to-query-syntax', async e => {
      sendEvent('copilot_natural_language_github_search')

      this.search((e as CustomEvent).detail.content)
      this.retract()
    })

    // add current page to recently visited list for jump-to
    logPageView(window.location.pathname)
  }

  syncRichButtonText() {
    if (!this.#globalNavAlwaysHidden) {
      return
    }

    if (this.query === '') {
      const placeholder = this.inputButton.getAttribute('placeholder')
      placeholder
        ? (this.inputButtonText.textContent = this.inputButton.getAttribute('placeholder'))
        : (this.inputButtonText.innerHTML = this.placeholderText)
      this.inputButton.classList.add('placeholder')
    } else {
      // TODO: get styled content from query builder
      const flat = this.parser.flatten(this.parser.parse(this.query, undefined))

      const segments = []
      for (const el of flat) {
        const span = document.createElement('span')
        span.textContent = el.value
        if (el.style === TextElementStyle.FilterValue) {
          span.classList.add('input-parsed-symbol')
        } else if (el.style === TextElementStyle.Constant) {
          span.classList.add('pl-c1')
        } else if (el.style === TextElementStyle.Entity) {
          span.classList.add('pl-en')
        }

        segments.push(span)
      }

      this.inputButtonText.replaceChildren(...segments)
    }
  }

  setButtonText(newText: string) {
    // Only overwrite the button text if we're on a page with a wide search bar.
    if (!this.#globalNavAlwaysHidden || newText.trim() === '') {
      const placeholder = this.inputButton.getAttribute('placeholder')
      if (placeholder) {
        this.inputButtonText.textContent = this.inputButton.getAttribute('placeholder')
      } else if (this.inputButtonText.innerHTML.trim() !== this.placeholderText) {
        this.inputButtonText.innerHTML = this.placeholderText
      }
      this.inputButton.classList.add('placeholder')
    } else {
      this.inputButtonText.textContent = newText
      this.inputButton.classList.remove('placeholder')
    }
  }

  async moveCaretToEndOfInput() {
    await window.customElements.whenDefined('query-builder')
    this.queryBuilder.moveCaretToEndOfInput()
  }

  disconnectedCallback() {
    this.#eventAbortController?.abort()
  }

  // todo: remove?
  getSuggestionInputState(): SuggestionInputState {
    let customScopes: CustomScope[] = []
    if (this.ast) {
      customScopes = this.#findCustomScopesNeededForSearch(this.ast)
    }
    return {
      query: this.query.replaceAll(nonBreakingSpace, ' '),
      ast: this.ast,
      selectedNode: this.#caretSelectedNode,
      mode: this.#caretPositionKind,
      customScopes,
      type: this.ast ? this.chooseSearchType(this.ast) : ('' as Parsing.SearchType),
    }
  }

  setGlobalNavVisibility(visible: boolean) {
    const globalNav = document.querySelector('#global-nav') as HTMLElement
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    if (globalNav && mediaQuery.matches) {
      globalNav.hidden = !visible
    }
  }

  setGlobalBarAlwaysExpanded(alwaysExpanded: boolean) {
    if (!this.headerRedesignEnabled) return

    const globalBar = document.querySelector('.js-global-bar') as HTMLElement
    if (globalBar) {
      if (alwaysExpanded) {
        globalBar.classList.add('always-expanded')
      } else {
        globalBar.classList.remove('always-expanded')
      }
    }
  }

  setGlobalBarModalOpen(modalOpen: boolean) {
    if (!this.headerRedesignEnabled) return

    const globalBar = document.querySelector('.js-global-bar') as HTMLElement
    if (globalBar) {
      if (modalOpen) {
        globalBar.classList.add('search-expanded')
      } else {
        globalBar.classList.remove('search-expanded')
      }
    }
  }

  // NOTE: when the search input container is clicked directly, we should expand
  // the search input. But pretty much everything inside it will bubble up click
  // events here, so we should ignore clicks on any INNER element that bubbles
  // up to the container.
  searchInputContainerClicked(event: MouseEvent) {
    if ((event.target as HTMLDivElement).classList.contains('search-input-container')) {
      this.expand(this.isRetainScrollPosition())
    }
    sendEvent('blackbird.click', {target: 'SEARCH_BOX'})
  }

  async updateQueryBuilderVisibility() {
    await window.customElements.whenDefined('query-builder')
    this.queryBuilderContainer.hidden = !this.classList.contains('expanded')
    this.darkBackdrop.hidden = this.queryBuilderContainer.hidden
  }

  expandAndRetainScrollPosition(trigger: HTMLElement | null) {
    if (this.isRetainScrollPosition()) return this.expand(true)
    if (window.scrollY > 200) {
      this.classList.add('search-input-absolute')
      this.style.top = `${window.scrollY + 25}px`
      this.expand(true)
      this.#returnFocusElement = trigger
    } else {
      this.expand()
    }
  }

  handleExpand() {
    this.expand(this.isRetainScrollPosition())
  }

  async expand(retainScrollPosition?: boolean) {
    this.possiblyWarmCaches()

    if (this.classList.contains('expanded')) return

    if (!retainScrollPosition) {
      window.scrollTo(0, 0)
    }

    this.#returnFocusElement = this.inputButton
    if (this.searchSuggestionsDialog instanceof HTMLDialogElement) {
      this.searchSuggestionsDialog.showModal()
    } else {
      this.searchSuggestionsDialog.show()
    }

    this.classList.add('expanded')
    this.setGlobalNavVisibility(false)
    this.setGlobalBarModalOpen(true)
    this.updateQueryBuilderVisibility()

    // Ensure that querybuilder is connected
    await window.customElements.whenDefined('query-builder')

    if (this.query === '' && this.getAttribute('data-scope')) {
      this.query = `${this.getAttribute('data-scope')} `
    }

    this.queryBuilder.inputFocus()
    this.moveCaretToEndOfInput()
    this.queryBuilder.inputChange()

    this.parseSearchInputRaw()

    document.dispatchEvent(new CustomEvent('qbsearch-input:expand', {detail: {element: this}}))
  }

  handleClose = (e: Event) => {
    this.syncRichButtonText()
    this.classList.remove('expanded')
    if (!this.#globalNavAlwaysHidden) {
      this.setGlobalNavVisibility(true)
    }
    this.setGlobalBarModalOpen(false)
    this.updateQueryBuilderVisibility()

    e.preventDefault()

    if (this.classList.contains('search-input-absolute')) {
      this.classList.remove('search-input-absolute')
    }

    // When the dialog is closed, the focus gets moved to the search element by default
    // We need to guarantee that this is called after that happens, so set a timeout for 0ms
    // which will cause this to run on the next cycle.
    setTimeout(() => {
      this.#returnFocusElement?.focus()

      document.dispatchEvent(new CustomEvent('qbsearch-input:close', {detail: {element: this}}))
    }, 0)
  }

  retract = () => {
    this.searchSuggestionsDialog.close()
    this.#returnFocusElement?.focus()
  }

  possiblyWarmCaches() {
    if (!this.#cachesHaveBeenWarmed && this.isLoggedIn()) {
      this.#cachesHaveBeenWarmed = true
      // This request warms the blackbird caches, making searches faster. It's
      // OK to call repeatedly since it's a noop if the caches are already warm.
      // We don't need to check for a valid response.
      fetch('/search/warm_blackbird_caches', {
        headers: {Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
      })
    }
  }

  chooseSearchType(ast: BaseNode): Parsing.SearchType {
    const type = new URLSearchParams(window.location.search).get('type') as Parsing.SearchTypeURLParameter
    if (type) return this.parsing!.mapURLParamToSearchType(type)
    return this.parsing!.chooseSearchType(ast, this.isLoggedIn())
  }

  async search(query: string, openInNewWindow = false) {
    const parser = await this.loadParser()
    const ast = parser.parseString(query)
    const customScopes = this.#findCustomScopesNeededForSearch(ast)
    const searchType = parser.mapSearchTypeToURLParam(this.chooseSearchType(ast))

    const redirectURL = shouldRedirectInsteadOfSearch(ast, window.location.pathname)
    if (redirectURL) {
      softNavigate(redirectURL)
      return
    }

    if (this.#isReactContext && !openInNewWindow) {
      const searchParams: {
        type: Parsing.SearchTypeURLParameter
        saved_searches?: string
        p: null
        l: null
        expanded_query?: string
      } = {
        type: searchType,
        // Set page to null so that the search jumps us back to page zero
        p: null,
        l: null,
      }

      if (customScopes.length > 0) {
        searchParams['saved_searches'] = JSON.stringify(customScopes)
        searchParams['expanded_query'] = parser.getExpandedQuery(query, customScopes, ast)
      } else {
        // Set to undefined to clear them from the URL when there are no saved searches in query
        searchParams['saved_searches'] = undefined
        searchParams['expanded_query'] = undefined
      }

      // If we're in a react context, then allow react to do the searching for us
      window.dispatchEvent(
        new CustomEvent('blackbird_monolith_search', {
          detail: {
            search: query,
            searchParams,
          },
        }),
      )
    } else {
      // If we're not in a react context, then we need to do the search ourselves
      let typeParam = ''
      if (searchType !== '') {
        typeParam = `&type=${encodeURIComponent(searchType)}`
      }

      let href = `/search?q=${encodeURIComponent(query)}${typeParam}`

      // Only add the saved_searches param if it's not empty
      if (customScopes.length > 0) {
        href += `&saved_searches=${encodeURIComponent(JSON.stringify(customScopes))}`
        const expandedQuery = encodeURIComponent(parser.getExpandedQuery(query, customScopes, ast))
        href += `&expanded_query=${expandedQuery}`
      }

      const experimentsParam = getBlackbirdExperiments().join(',')
      if (experimentsParam !== '') {
        href += `&experiments=${experimentsParam}`
      }

      if (openInNewWindow) {
        // this actually usually goes to a new tab, except in Chrome and Safari where if you use shift+enter, it opens in a new window for magical reasons
        window.open(href, '_blank')
      } else {
        softNavigate(href)
      }
    }
  }

  #findCustomScopesNeededForSearch(ast: BaseNode): CustomScope[] {
    // It shouldn't be possible for parsing not to be loaded here, since we are
    // being passed a parsed AST.
    if (!this.parsing) {
      return []
    }

    const customScopeNames = this.parsing.getCustomScopeNames(ast)

    let customScopesFromUrl: CustomScope[]
    try {
      customScopesFromUrl = JSON.parse(new URLSearchParams(window.location.search).get('saved_searches') || '[]')
      if (!Array.isArray(customScopesFromUrl)) {
        customScopesFromUrl = []
      }
    } catch (e) {
      customScopesFromUrl = []
    }

    const customScopesNeededForSearch: CustomScope[] = []
    for (const customScopeName of customScopeNames) {
      const customScope =
        customScopesFromUrl.find(scope => scope.name === customScopeName) ||
        this.#customScopesSuggestionProvider.customScopesCache.get()?.find(scope => scope.name === customScopeName)
      if (customScope) {
        customScopesNeededForSearch.push({name: customScope.name, query: customScope.query} as CustomScope)
      }
    }
    return customScopesNeededForSearch
  }

  setLocalHistory(query: string) {
    // Don't save empty queries
    if (query.trim() === '') return

    let localStorage: string[] = JSON.parse(window.localStorage.getItem('github-search-history') ?? '[]')
    if (localStorage.length >= MAX_LOCAL_HISTORY) {
      // keep the last 50 items
      localStorage = localStorage.slice(0, MAX_LOCAL_HISTORY - 1)
    }

    if (!localStorage.find(item => item.toLowerCase() === query.toLowerCase())) {
      localStorage.unshift(query)
    }

    window.localStorage.setItem('github-search-history', JSON.stringify(localStorage))
  }

  handleChange() {
    this.parseSearchInput()
  }

  async loadParser() {
    if (!this.parsingPromise) {
      this.parsingPromise = import('./parsing/parsing')
      this.parsing = await this.parsingPromise
    }
    return this.parsingPromise
  }

  #waitingToParse = false
  #lastParseTime = 0
  parseSearchInput() {
    // the throttle() function in @github/mini-throttle is broken (although debounce() works), so
    // implement our own throttling here until that gets fixed
    const now = Date.now()
    if (now - this.#lastParseTime > parseDelay && !this.#waitingToParse) {
      this.parseSearchInputRaw()
    } else if (!this.#waitingToParse) {
      this.#waitingToParse = true
      setTimeout(
        () => {
          this.#waitingToParse = false
          this.parseSearchInputRaw()
        },
        parseDelay - (now - this.#lastParseTime),
      )
    }
  }

  // NOTE: this is the non-debounced version of parseSearchInput
  async parseSearchInputRaw() {
    if (!this.query) {
      // if the query is blank we don't need to parse or load the parser
      this.lastParsedQuery = this.query
      this.ast = {kind: 'Nothing'} as NothingNode
      this.#caretPositionKind = CaretPositionKind.Text
      this.#caretSelectedNode = undefined
      return
    }

    if (!this.parsing) {
      await this.loadParser()
    }

    this.#lastParseTime = Date.now()
    if (!this.ast || this.query !== this.lastParsedQuery) {
      this.lastParsedQuery = this.query
      const [ast /*, nodes */] = this.parsing!.parseSearchInput(this.lastParsedQuery)
      this.ast = ast
    }

    // TODO: get caret position properly
    const caretData = this.parsing!.getCaretPositionKindFromIndex(this.ast, 0)
    this.#caretPositionKind = caretData.kind
    this.#caretSelectedNode = caretData.node
  }

  handleSubmit(openInNewWindow = false) {
    // If the query is totally empty, just do nothing and ignore it
    if (this.query.trim().length === 0) {
      return
    }

    this.setLocalHistory(this.query)
    this.search(this.query, openInNewWindow)
    this.retract()
  }

  editCustomScope(event: Event) {
    this.customScopesManager.editCustomScope(event)
  }

  async #openManageCustomScopesDialog(event: Event) {
    this.retract()
    this.customScopesManager.show()

    // Stop propagation so that the scope isn't also selected
    event.stopPropagation()
  }

  newCustomScope(event: Event) {
    this.customScopesManager.create('')
    event.stopPropagation()
  }

  saveQueryAsCustomScope(event: CustomEvent<HTMLElement>) {
    this.customScopesManager.create(this.query)
    this.#dialogFocusReturn = event.detail
  }

  handleDialogClose() {
    // after the dialog closes, attempt to return the focus to the element that opened it
    setTimeout(() => {
      if (this.#dialogFocusReturn) {
        this.#dialogFocusReturn?.focus()
        this.#dialogFocusReturn = undefined
      } else {
        this.inputButton.focus()
      }
    })
  }

  showFeedbackDialog(event: Event) {
    this.feedbackDialog.show()
    this.retract()
    // Stop propagation so that the modal will stay open
    event.stopPropagation()
    event.preventDefault()
  }

  async submitFeedback(event: Event) {
    event.preventDefault()

    const form = (event.target as HTMLButtonElement).form!
    await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
    })
    this.feedbackDialog.close()
  }
}

class SearchCopilotEvent extends Event {
  declare content: string
  declare repoNwo: string
  constructor(content: string, repoNwo: string) {
    super('search-copilot-chat', {
      bubbles: false,
      cancelable: true,
    })

    this.content = content
    this.repoNwo = repoNwo
  }
}
