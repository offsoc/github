import {filterSort} from '@github-ui/filter-sort'
import {compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import type {QueryEvent, SearchProvider, Octicon} from '@github-ui/query-builder-element/query-builder-api'
import {FetchDataEvent, SearchItem} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {isContentNode, isQualifier} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'
import {ExplorePages, InitialExplorePages} from '../suggestions/explore-pages'

interface ExplorePage {
  title: string
  url: string
  octicon: Octicon | string
}

const resultsPriority = 11 // The priority of the explore search provider, higher numbers appear at the bottom of the results

export class ExploreProvider extends EventTarget implements SearchProvider {
  priority = resultsPriority
  name = 'Explore'
  singularItemName = 'explore page'
  value = 'explore'
  type = 'search' as const
  manuallyDetermineFilterEligibility = true

  #querySuggestions: ExplorePage[] | null = null
  #defaultSuggestions: ExplorePage[] | null = null

  constructor(public queryBuilder: QueryBuilderElement) {
    super()
    this.queryBuilder.addEventListener('query', this)
  }

  // For experimental / testing, we will get the explore pages from a hardcoded list from now.
  #fetchQuerySuggestions() {
    const data = Promise.resolve(ExplorePages)
    this.dispatchEvent(new FetchDataEvent(data))
    return data
  }

  #fetchDefaultSuggestions() {
    const data = Promise.resolve(InitialExplorePages)
    this.dispatchEvent(new FetchDataEvent(data))
    return data
  }

  async #addDefaultSuggestions() {
    this.#defaultSuggestions = await this.#fetchDefaultSuggestions()
    for (const page of this.#defaultSuggestions) {
      this.dispatchEvent(
        new SearchItem({
          value: page.title,
          icon: page.octicon as Octicon,
          priority: resultsPriority,
          scope: 'EXPLORE',
          action: {
            url: `${page.url}?ref_loc=search`,
          },
        }),
      )
    }
  }

  async handleEvent(event: QueryEvent) {
    const path = window.location.pathname
    const isHomePagePath = path === '/' || path === '/home'
    const isMarketingPagePath = ExplorePages.some(page => page.url.startsWith('/') && path.startsWith(page.url))

    if (!isHomePagePath && !isMarketingPagePath) {
      // We only want to show suggestions on the homepage and marketing pages
      return []
    }

    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined
    if (!state?.query) {
      await this.#addDefaultSuggestions()
      return []
    }

    if (this.#querySuggestions === null) {
      this.#querySuggestions = await this.#fetchQuerySuggestions()
    }

    // make sure we only suggest for terms that are user typed content (number, text etc.)
    let term = state?.query
    if (state?.caretSelectedNode && isQualifier(state?.caretSelectedNode)) {
      if (isContentNode(state.caretSelectedNode.content)) {
        term = state.caretSelectedNode.content.value as string
      } else {
        term = ''
      }
    }

    let matches = this.#querySuggestions
    if (term && term.length > 0) {
      const fuzzyQuery = term.replace(/\s/g, '')
      const key = (page: ExplorePage) => {
        const score = fuzzyScore(page.title, fuzzyQuery)
        return score > 0 ? {score, text: page.title} : null
      }
      matches = filterSort(this.#querySuggestions, key, compare)
    }

    for (const page of matches.slice(0, 5)) {
      this.dispatchEvent(
        new SearchItem({
          value: page.title,
          icon: page.octicon as Octicon,
          priority: resultsPriority,
          scope: 'EXPLORE',
          action: {
            url: `${page.url}?q=${term}&ref_loc=search`,
          },
        }),
      )
    }
  }
}
