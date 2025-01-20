import {
  Octicon,
  SearchItem,
  type QueryBuilderElement,
  type QueryEvent,
  type SearchProvider,
} from '@github-ui/query-builder-element'
import type {ParsedIntermediateRepresentation, QbsearchInputElement} from '../qbsearch-input-element'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {debounce} from '@github/mini-throttle'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {CopilotAuthTokenProvider} from '@github-ui/copilot-auth-token'
import {CaretPositionKind} from '../parsing/common'

const DEFAULT_NL_SEARCH_QUERY = 'is:issue is:open assignee:@me'

export class CopilotProvider extends EventTarget implements SearchProvider {
  priority = 10
  name = 'Copilot'
  singularItemName = 'copilot'
  value = 'copilot'
  type = 'search' as const
  #copilotChatEnabled: boolean = false
  #naturalLanugageSearchEnabled: boolean = false
  #input: QbsearchInputElement
  #repo: string | null
  #nlSearchToken: string | null
  #abortController: AbortController = new AbortController()
  #copilotAuthTokenProvider: CopilotAuthTokenProvider

  constructor(
    public queryBuilder: QueryBuilderElement,
    input: QbsearchInputElement,
  ) {
    super()
    this.queryBuilder.addEventListener('query', this)
    this.#input = input
    this.#repo = this.#input.getAttribute('data-current-repository')
    this.#copilotChatEnabled = this.#input.getAttribute('data-copilot-chat-enabled') === 'true'
    this.#naturalLanugageSearchEnabled = this.#input.getAttribute('data-nl-search-enabled') === 'true'
    this.#nlSearchToken = this.#input.getAttribute('data-nl-search-csrf')
    this.#copilotAuthTokenProvider = new CopilotAuthTokenProvider([])
  }

  fetchIndexStatusPromise(repo: string, token: string) {
    const fetchUrl = new URL(`/search/check_indexing_status?nwo=${encodeURIComponent(repo)}`, window.location.origin)
    const indexedResponse = fetch(fetchUrl.href, {
      method: 'GET',
      mode: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Scoped-CSRF-Token': token,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    return indexedResponse
  }

  primerSpinner() {
    return {
      // eslint-disable-next-line github/unescaped-html-literal
      html: `<svg style="box-sizing: content-box; color: var(--color-icon-primary); fill: none" width="16" height="16" viewBox="0 0 16 16" class="anim-rotate">
  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" fill="none"></circle>
  <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
</svg>` as SafeHTMLString,
    }
  }

  async handleEvent(event: QueryEvent) {
    if (!this.#copilotChatEnabled) return
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined
    if (!state || state.caretPositionKind !== CaretPositionKind.Text) return

    const trimmedQuery = state?.query.trim() ?? ''

    this.dispatchEvent(
      new SearchItem({
        value: `Ask Copilot`,
        scope: 'COPILOT_CHAT',
        icon: Octicon.Copilot,
        priority: 0,
        action: {
          commandName: 'search-copilot-chat',
          data: {
            content: trimmedQuery,
            repoNwo: this.#repo,
          },
        },
      }),
    )

    if (!this.#naturalLanugageSearchEnabled) return
    if (!trimmedQuery) {
      this.dispatchEvent(
        new SearchItem({
          id: 'copilot-nl-search',
          value: DEFAULT_NL_SEARCH_QUERY,
          scope: 'COPILOT_SEARCH',
          icon: Octicon.Copilot,
          priority: 0,
          action: {
            commandName: 'convert-to-query-syntax',
            data: {
              content: DEFAULT_NL_SEARCH_QUERY,
            },
          },
        }),
      )
    } else {
      this.dispatchEvent(
        new SearchItem({
          id: 'copilot-nl-search',
          value: trimmedQuery,
          scope: 'COPILOT_SEARCH',
          icon: trimmedQuery === DEFAULT_NL_SEARCH_QUERY ? Octicon.Copilot : this.primerSpinner(),
          priority: 0,
          action: {
            commandName: 'no-op',
            data: {},
          },
        }),
      )
    }
    this.queryCopilotSearchDebounced(event)
  }

  queryCopilotSearch = async (event: QueryEvent) => {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined
    const trimmedQuery = state?.query.trim() ?? ''

    if (!this.#nlSearchToken || !trimmedQuery || trimmedQuery === DEFAULT_NL_SEARCH_QUERY) return

    try {
      const token = await this.#copilotAuthTokenProvider.getAuthToken()
      this.#abortController.abort()
      this.#abortController = new AbortController()

      const response = await verifiedFetchJSON('/copilot/completions/nl-search', {
        method: 'POST',
        body: {query: trimmedQuery},
        headers: {
          'Scoped-CSRF-Token': this.#nlSearchToken,
          'X-Copilot-Api-Token': token.value,
        },
        signal: this.#abortController.signal,
      })

      if (!response.ok) {
        return this.dispatchEvent(
          new SearchItem({
            isUpdate: true,
            id: 'copilot-nl-search',
            value: 'There was an error parsing your query',
            scope: 'COPILOT_SEARCH',
            icon: Octicon.CopilotError,
            priority: 0,
            action: {
              commandName: 'no-op',
              data: {},
            },
          }),
        )
      }

      const result: {query: string} = await response.json()
      if (trimmedQuery.length > 0 && this.#naturalLanugageSearchEnabled) {
        this.dispatchEvent(
          new SearchItem({
            isUpdate: true,
            id: 'copilot-nl-search',
            value: result.query || trimmedQuery,
            scope: 'COPILOT_SEARCH',
            icon: Octicon.Copilot,
            priority: 0,
            action: {
              commandName: 'convert-to-query-syntax',
              data: {
                content: result.query || trimmedQuery,
              },
            },
          }),
        )
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      this.dispatchEvent(
        new SearchItem({
          isUpdate: true,
          id: 'copilot-nl-search',
          value: 'There was an error parsing your query',
          scope: 'COPILOT_SEARCH',
          icon: Octicon.CopilotError,
          priority: 0,
          action: {
            commandName: 'no-op',
            data: {},
          },
        }),
      )
      return
    }
  }
  readonly queryCopilotSearchDebounced = debounce(this.queryCopilotSearch, 1000)
}
