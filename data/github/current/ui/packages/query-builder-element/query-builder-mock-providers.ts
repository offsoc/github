import {
  type SearchProvider,
  SearchItem,
  type QueryEvent,
  type FilterProvider,
  FilterItem,
  type QueryFilterElement,
  Octicon,
} from './query-builder-api'
import type {QueryBuilderElement} from './query-builder-element'
import {hasMatch, score} from 'fzy.js'

// Feel free to add, edit, or update these. They are for testing and demo purposes.
class EchoSearchProvider extends EventTarget implements SearchProvider {
  priority = 1
  name = 'Search'
  singularItemName = 'search item'
  value = 'search'
  type = 'search' as const

  constructor(public queryBuilder: QueryBuilderElement) {
    super()

    this.queryBuilder.addEventListener('query', this)
    this.queryBuilder.attachProvider(this)
  }

  handleEvent(event: QueryEvent) {
    const rawQuery = event.rawQuery || ''

    if (rawQuery === '') return
    this.dispatchEvent(
      new SearchItem({
        priority: 4,
        value: 'saved:a11y repo:github/github',
        icon: Octicon.Search,
        action: {
          query: 'saved:a11y repo:github/github',
        },
      }),
    )
    this.dispatchEvent(
      new SearchItem({
        priority: 3,
        value: `org:github ${rawQuery}`,
        icon: Octicon.Team,
        scope: 'ORG',
        action: {
          url: `/search?q=${rawQuery}`,
        },
      }),
    )
    this.dispatchEvent(
      new SearchItem({
        priority: 2,
        value: `repo:github/github ${rawQuery}`,
        scope: 'REPO',
        action: {
          url: `/search?q=${rawQuery}`,
        },
      }),
    )
    this.dispatchEvent(
      new SearchItem({
        priority: 1,
        value: `${rawQuery}`,
        scope: 'GENERAL',
        action: {
          url: `/search?q=${rawQuery}`,
        },
      }),
    )
  }
}

class ProjectsProvider extends EventTarget implements FilterProvider {
  priority = 3
  name = 'Projects'
  singularItemName = 'project'
  value = 'project'
  type = 'filter' as const

  constructor(public queryBuilder: QueryBuilderElement) {
    super()

    this.queryBuilder.addEventListener('query', this)
    this.queryBuilder.attachProvider(this)
  }

  handleEvent(event: QueryEvent) {
    const lastQuery = event.parsedQuery.at(-1)
    const lastQueryValue = lastQuery?.value || ''
    const lastQueryType = lastQuery?.type
    const lastQueryFilter = (lastQuery as QueryFilterElement)?.filter || ''

    if (lastQueryType !== 'filter' && (hasMatch(lastQueryValue, this.value) || lastQueryValue === '')) {
      this.dispatchEvent(new Event('show'))
    }

    if (lastQueryType === 'filter' && lastQueryFilter === 'project') {
      this.project('memex', lastQueryValue)
      this.project('accessibility-audits', lastQueryValue)
    }
  }

  project(value: string, query: string) {
    if (query && !hasMatch(query, value)) return
    let priority = 2
    if (query) priority -= score(query, value)
    this.dispatchEvent(new FilterItem({filter: 'project', value, priority}))
  }
}

class ReposProvider extends EventTarget implements FilterProvider {
  priority = 2
  name = 'Repositories'
  singularItemName = 'repo'
  value = 'repo'
  type = 'filter' as const

  constructor(public queryBuilder: QueryBuilderElement) {
    super()

    this.queryBuilder.addEventListener('query', this)
    this.queryBuilder.attachProvider(this)
  }

  handleEvent(event: QueryEvent) {
    const lastQuery = event.parsedQuery.at(-1)
    const lastQueryValue = lastQuery?.value || ''
    const lastQueryType = lastQuery?.type

    if (lastQueryType !== 'filter' && (hasMatch(lastQueryValue, this.value) || lastQueryValue === '')) {
      this.dispatchEvent(new Event('show'))
    }

    this.repo('github/accessibility', lastQueryValue)
    this.repo('github/github', lastQueryValue)
    this.repo('github/accessibility-audits', lastQueryValue)
    this.repo('item with spaces', lastQueryValue)
  }

  repo(value: string, query: string) {
    if (query && !hasMatch(query, value)) return
    let priority = 2
    if (query) priority -= score(query, value)
    this.dispatchEvent(new FilterItem({filter: 'repo', value, priority, icon: Octicon.Repo}))
  }
}

class StateProvider extends EventTarget implements FilterProvider {
  name = 'States'
  singularItemName = 'state'
  value = 'is'
  priority = 4
  type = 'filter' as const

  constructor(public queryBuilder: QueryBuilderElement) {
    super()

    this.queryBuilder.addEventListener('query', this)
    this.queryBuilder.attachProvider(this)
  }

  handleEvent(event: QueryEvent) {
    const states = ['answered', 'unanswered', 'locked', 'unlocked']
    const lastQuery = event.parsedQuery.at(-1)
    const lastQueryValue = lastQuery?.value || ''
    const lastQueryType = lastQuery?.type
    const lastQueryFilter = (lastQuery as QueryFilterElement)?.filter || ''

    const filteredStates = states.filter(suggestion => {
      if ((lastQueryValue && hasMatch(lastQueryValue, suggestion)) || lastQueryValue === '') return suggestion
    })

    if (lastQueryType !== 'filter' && (hasMatch(lastQueryValue || '', this.value) || lastQueryValue === '')) {
      this.dispatchEvent(new Event('show'))
    }

    // Prevents the state items from being fetched if the state filter was not chosen
    if (lastQueryType !== 'filter' || lastQueryFilter !== this.value) return

    for (const state of filteredStates) {
      this.dispatchEvent(new FilterItem({filter: 'is', value: state}))
    }
  }
}

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
document.addEventListener('query-builder:request-provider', (event: Event) => {
  new EchoSearchProvider(event.target as QueryBuilderElement)
  new ProjectsProvider(event.target as QueryBuilderElement)
  new ReposProvider(event.target as QueryBuilderElement)
  new StateProvider(event.target as QueryBuilderElement)
})
