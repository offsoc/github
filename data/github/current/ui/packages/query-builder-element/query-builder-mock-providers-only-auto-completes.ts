import {type QueryEvent, type FilterProvider, FilterItem, type QueryFilterElement, Octicon} from './query-builder-api'
import type {QueryBuilderElement} from './query-builder-element'
import {hasMatch, score} from 'fzy.js'

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

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
document.addEventListener('query-builder:request-provider', (event: Event) => {
  new ProjectsProvider(event.target as QueryBuilderElement)
  new ReposProvider(event.target as QueryBuilderElement)
})
