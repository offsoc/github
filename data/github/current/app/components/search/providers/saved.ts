import {filterSort} from '@github-ui/filter-sort'
import {compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import type {QueryEvent, SearchProvider} from '@github-ui/query-builder-element/query-builder-api'
import {Octicon, SearchItem} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {CaretPositionKind, containsQualifier, isQualifier, isSavedQualifier, isContentNode} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'
import type {CustomScope} from '../suggestions/types'

export class CustomScopeCache {
  #cache: CustomScope[] = []
  #filled: boolean

  set(scopes: CustomScope[]) {
    this.#cache = scopes
    this.#filled = true
  }

  get() {
    if (this.#filled) return this.#cache
    return undefined
  }

  len() {
    return this.#cache.length
  }

  clear() {
    this.#filled = false
    this.#cache = []
  }
}

export class SavedScopeProvider extends EventTarget implements SearchProvider {
  priority = 4
  name = 'Saved queries'
  singularItemName = 'saved query'
  value = 'saved query'
  type = 'search' as const
  #customScopesUrl: string | null
  customScopesCache = new CustomScopeCache()

  constructor(
    public queryBuilder: QueryBuilderElement,
    customScopesUrl: string,
  ) {
    super()
    this.#customScopesUrl = customScopesUrl
    this.queryBuilder.addEventListener('query', this)
  }

  async fetchSuggestions(): Promise<CustomScope[]> {
    let data = []
    if (this.#customScopesUrl) {
      const response = await fetch(this.#customScopesUrl, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      })
      if (!response.ok) {
        return []
      }
      data = await response.json()
      this.#replaceCustomScopesCache(data)
    }
    return data
  }

  #replaceCustomScopesCache(data: CustomScope[]): void {
    this.customScopesCache.set(data)
  }

  async handleEvent(event: QueryEvent) {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined

    if (
      !state ||
      (state.caretPositionKind !== CaretPositionKind.Text && state.caretPositionKind !== CaretPositionKind.Saved)
    ) {
      return []
    }

    // If the query already contains a saved search, and the caret isn't over it, don't suggest any more
    if (state.caretPositionKind !== CaretPositionKind.Saved && state.ast && containsQualifier(state.ast, 'Saved')) {
      return []
    }

    // If the query already contains an org or repo term, don't suggest saved searches
    if (state.ast && (containsQualifier(state.ast, 'Repo') || containsQualifier(state.ast, 'Org'))) {
      return []
    }

    let term = ''
    if (state.caretSelectedNode) {
      if (isSavedQualifier(state.caretSelectedNode)) {
        if (isContentNode(state.caretSelectedNode.content)) {
          term = String(state.caretSelectedNode.content.value)
        }
      } else if (isContentNode(state.caretSelectedNode)) {
        term = String(state.caretSelectedNode.value)
      }
    }

    let suggestions = this.customScopesCache.get()
    if (suggestions === undefined) {
      suggestions = await this.fetchSuggestions()
    }

    if (term.trim().length > 0) {
      // Remove whitespace and quotes (which can surround saved searches)
      const fuzzyQuery = term.replace(/[\s"]/g, '')
      const key = (s: CustomScope) => {
        const score = fuzzyScore(s.name, fuzzyQuery)
        return score > 0 ? {score, text: s.name} : null
      }
      suggestions = filterSort(suggestions, key, compare)
    }

    for (const suggestion of suggestions) {
      const qualifier = 'saved:'

      let quotedName = suggestion.name.includes(' ') ? `"${suggestion.name}"` : suggestion.name

      let replaceQueryWith = ''
      if (state.query.endsWith(' ') || state.query === '') {
        replaceQueryWith = `${state.query}${qualifier + quotedName} `
      } else {
        replaceQueryWith = `${state.query} ${qualifier + quotedName} `
      }
      let moveCaretTo = replaceQueryWith.length

      if (state.caretSelectedNode && (isContentNode(state.caretSelectedNode) || isQualifier(state.caretSelectedNode))) {
        const rewriteStart = state.caretSelectedNode.location.start
        let rewriteEnd = state.caretSelectedNode.location.end
        if (isQualifier(state.caretSelectedNode) && isContentNode(state.caretSelectedNode.content)) {
          rewriteEnd = state.caretSelectedNode.content.location.end
        }

        const queryStart = state.query.slice(0, rewriteStart)
        const queryEnd = state.query.slice(rewriteEnd).trimEnd()
        if (queryEnd === '') {
          quotedName += ' ' // Add a space if the insertion is at the end
        }

        const newQuery = queryStart + qualifier + quotedName + queryEnd
        replaceQueryWith = newQuery
        moveCaretTo = rewriteStart + qualifier.length + quotedName.length
      }

      this.dispatchEvent(
        new SearchItem({
          value: `saved:${suggestion.name}`,
          icon: Octicon.Bookmark,
          priority: 0,
          action: {
            replaceQueryWith,
            moveCaretTo,
          },
        }),
      )
    }

    if (state.caretPositionKind === CaretPositionKind.Saved) {
      this.dispatchEvent(
        new SearchItem({
          value: `Manage saved searches`,
          icon: Octicon.PlusCircle,
          scope: 'COMMAND',
          priority: 0,
          action: {
            commandName: 'blackbird-monolith.manageCustomScopes',
            data: {},
          },
        }),
      )
    }
  }
}
