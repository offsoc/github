import type {SearchProvider, QueryEvent} from '@github-ui/query-builder-element/query-builder-api'
import {SearchItem, Octicon} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import safeStorage from '@github-ui/safe-storage'
import {CaretPositionKind} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'

const safeLocalStorage = safeStorage('localStorage')

export class HistoryProvider extends EventTarget implements SearchProvider {
  priority = 5
  name = 'History'
  singularItemName = 'history'
  value = 'history'
  type = 'search' as const

  constructor(public queryBuilder: QueryBuilderElement) {
    super()
    this.queryBuilder.addEventListener('query', this)
  }

  handleEvent(event: QueryEvent) {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined
    if (!state || state.caretPositionKind !== CaretPositionKind.Text) {
      return []
    }

    const query = event.toString()
    let suggestions: string[] = JSON.parse(safeLocalStorage.getItem('github-search-history') ?? '[]')

    const trimmedQuery = state.query.trim()
    if (trimmedQuery.length !== 0) {
      return []
    }

    // Deduplicate suggestions
    const seen: Record<string, boolean> = {}
    suggestions = suggestions.filter(item => {
      if (!seen[item]) {
        seen[item] = true
        return true
      }
      return false
    })

    let suggestionCount = 0
    for (const suggestion of suggestions) {
      if (suggestionCount >= 5) break

      const historyQuery = suggestion.trim()
      if (historyQuery.startsWith(query)) {
        suggestionCount += 1
        this.dispatchEvent(
          new SearchItem({
            value: historyQuery,
            icon: Octicon.Search,
            scope: 'GENERAL',
            priority: historyQuery.length,
            action: {url: `/search?q=${historyQuery}`},
          }),
        )
      }
    }
  }
}
