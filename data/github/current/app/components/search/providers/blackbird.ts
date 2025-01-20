import type {QueryEvent, SearchProvider} from '@github-ui/query-builder-element/query-builder-api'
import {Octicon, SearchItem, PrefixColor, FetchDataEvent} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {CaretPositionKind} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'
import {SymbolKind} from '@github-ui/code-nav'

interface BlackbirdSymbol {
  fully_qualified_name: string
  kind: string
}

interface BlackbirdSuggestion {
  kind: string
  query: string
  repository_nwo: string
  language: string
  path: string
  repository_id: number
  commit_sha: string
  line_number: number
  symbol: BlackbirdSymbol | null
}

type SuggestionsResponse = {
  suggestions: BlackbirdSuggestion[]
  queryErrors: []
  failed: boolean
}

export class BlackbirdProvider extends EventTarget implements SearchProvider {
  priority = 9
  name = 'Code'
  singularItemName = 'code'
  value = 'code'
  type = 'search' as const
  manuallyDetermineFilterEligibility = true

  #cache: Record<string, BlackbirdSuggestion[]> = {}
  #input: HTMLElement

  constructor(
    public queryBuilder: QueryBuilderElement,
    input: HTMLElement,
  ) {
    super()
    this.queryBuilder.addEventListener('query', this)
    this.#input = input
  }

  async handleEvent(event: QueryEvent) {
    const result = this.fetchData(event)
    this.dispatchEvent(new FetchDataEvent(result))
    const suggestions = (await result)!

    let suggestionsEmitted = 0
    for (const suggestion of suggestions) {
      if (suggestionsEmitted >= 5) return

      if (suggestion.kind === 'SUGGESTION_KIND_PATH') {
        if (!suggestion.path) continue

        const trailingSlashPos = suggestion.path.lastIndexOf('/')
        const filename = suggestion.path.substring(trailingSlashPos + 1)
        const path = truncatePath(suggestion.path.substring(0, trailingSlashPos + 1))

        // TODO: omit this if the query is scoped to a repo already
        const repoPrefix = suggestion.repository_nwo
        const separator = repoPrefix.length > 0 && path.length > 0 ? ' · ' : ''
        const encodedPath = suggestion.path.split('/').map(encodeURIComponent).join('/')

        this.dispatchEvent(
          new SearchItem({
            value: filename,
            icon: Octicon.FileCode,
            description: `${repoPrefix}${separator}${path}`,
            priority: 0,
            action: {
              url: `/${suggestion.repository_nwo}/blob/${suggestion.commit_sha}/${encodedPath}#L${suggestion.line_number}`,
            },
          }),
        )
      } else if (suggestion.kind === 'SUGGESTION_KIND_SYMBOL') {
        const path = truncatePath(suggestion.path)

        // TODO: omit this if the query is scoped to a repo already
        const repoPrefix = suggestion.repository_nwo
        const separator = repoPrefix.length > 0 && path.length > 0 ? ' · ' : ''
        const encodedPath = suggestion.path.split('/').map(encodeURIComponent).join('/')
        const kind = new SymbolKind({kind: suggestion.symbol?.kind ?? ''})

        this.dispatchEvent(
          new SearchItem({
            value: suggestion.symbol?.fully_qualified_name ?? '',
            prefixText: kind.fullName,
            prefixColor: prefixColorForSymbolKind(kind),
            icon: Octicon.FileCode,
            description: `${repoPrefix}${separator}${path}`,
            priority: 0,
            action: {
              url: `/${suggestion.repository_nwo}/blob/${suggestion.commit_sha}/${encodedPath}#L${suggestion.line_number}`,
            },
          }),
        )
      } else {
        // Unsupported suggestion type, skip
        continue
      }
      suggestionsEmitted++
    }
  }

  async fetchData(event: QueryEvent) {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined

    if (!state || !state.query) {
      return []
    }

    if (state.caretPositionKind !== CaretPositionKind.Text && state.caretPositionKind !== CaretPositionKind.Path) {
      return []
    }

    if (this.#cache[state.query]) {
      return this.#cache[state.query]
    }

    if (this.#input.getAttribute('data-logged-in') === 'false') {
      return []
    }

    const urlParams = new URLSearchParams({query: state.query, saved_searches: JSON.stringify(state.customScopes)})
    const url = this.#input.getAttribute('data-blackbird-suggestions-path')
    if (!url) throw new Error('could not get blackbird suggestions path')
    const response = (await (
      await fetch(`${url}?${urlParams}`, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      })
    ).json()) as SuggestionsResponse

    if (response.failed) {
      return []
    }

    // Store the cached response
    this.#cache[state.query] = response.suggestions

    return response.suggestions
  }
}

function prefixColorForSymbolKind(kind: SymbolKind): PrefixColor {
  switch (kind.plColor) {
    case 'prettylights.syntax.entity':
      return PrefixColor.Entity
    case 'prettylights.syntax.constant':
      return PrefixColor.Constant
    case 'prettylights.syntax.keyword':
      return PrefixColor.Keyword
    case 'prettylights.syntax.variable':
      return PrefixColor.Variable
    case 'prettylights.syntax.string':
      return PrefixColor.String
    default:
      return PrefixColor.Entity
  }
}

function truncatePath(path: string) {
  if (path.length > 60) {
    return `...${path.substring(path.length - 60 + 3)}`
  }

  return path
}
