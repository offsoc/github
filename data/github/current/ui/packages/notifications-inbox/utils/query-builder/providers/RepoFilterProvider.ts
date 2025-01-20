// eslint-disable-next-line filenames/match-regex
import {getRepositorySearchQuery} from '@github-ui/issue-viewer/Queries'

import {
  FILTER_PRIORITY_DISPLAY_THRESHOLD,
  TOP_REPOSITORIES_COUNT,
} from '@github-ui/query-builder/constants/search-filters'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FetchDataEvent,
  FilterItem,
  type FilterProvider,
  type Icon,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch, score} from 'fzy.js'
import type {Environment} from 'react-relay'
import {fetchQuery, readInlineData} from 'react-relay'
import type {Subscription} from 'relay-runtime'
import {
  SearchRepositories,
  RepositoryFragment,
  TopRepositories,
  TopRepositoriesFragment,
} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerRepository$key} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {
  RepositoryPickerSearchRepositoriesQuery$data,
  RepositoryPickerSearchRepositoriesQuery,
} from '@github-ui/item-picker/RepositoryPickerSearchRepositoriesQuery.graphql'
import type {RepositoryPickerTopRepositories$key} from '@github-ui/item-picker/RepositoryPickerTopRepositories.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'

export class RepoFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  icon: Icon
  singularItemName: string
  name: string
  priority: number
  value: string
  description: ''
  relayEnvironment: Environment

  searchedReposSubscription: Subscription | undefined = undefined
  topRepoNwoCache: string[] | undefined = undefined

  constructor(
    queryBuilder: QueryBuilderElement,
    {
      name,
      value,
      icon,
      priority,
      relayEnvironment,
    }: {
      name: string
      value: string
      icon: Icon
      priority: number
      relayEnvironment: Environment
    },
  ) {
    super()

    this.name = name
    this.singularItemName = name
    this.value = value
    this.icon = icon
    this.priority = priority
    this.relayEnvironment = relayEnvironment
    queryBuilder.addEventListener('query', this)
    queryBuilder.attachProvider(this)
  }

  async handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)!
    if (
      (lastElement.value !== '' || this.priority <= FILTER_PRIORITY_DISPLAY_THRESHOLD) &&
      lastElement?.type !== 'filter' &&
      !event.parsedQuery.some(e => e.type === 'filter' && e.filter === this.value) &&
      (hasMatch(lastElement?.value, this.name) || hasMatch(lastElement?.value, this.value))
    ) {
      this.dispatchEvent(new Event('show'))
    }

    if (lastElement?.type !== this.type || lastElement.filter !== this.value) return

    const containsValidOrgName = lastElement.value.indexOf('/') > 0
    if (containsValidOrgName) {
      this.dispatchEvent(new FetchDataEvent(this.fetchSearchedRepos(lastElement.value)))
      return
    }

    if (!this.topRepoNwoCache) {
      // Immediately set this to avoid multiple requests
      this.topRepoNwoCache = []
      this.dispatchEvent(new FetchDataEvent(this.fetchTopRepos(event)))
      return
    }

    for (const repoNwo of this.topRepoNwoCache) {
      this.emitSuggestion(repoNwo, lastElement.value)
    }
  }

  async fetchSearchedRepos(query: string): Promise<void> {
    const searchedRepos: RepositoryPickerSearchRepositoriesQuery$data = await new Promise((resolve, reject) => {
      fetchQuery<RepositoryPickerSearchRepositoriesQuery>(this.relayEnvironment, SearchRepositories, {
        searchQuery: getRepositorySearchQuery(query),
      }).subscribe({
        start: subscription => {
          this.searchedReposSubscription?.unsubscribe()
          this.searchedReposSubscription = subscription
        },
        next: data => {
          resolve(data)
        },
        error: (error: Error) => {
          reject(error)
        },
      })
    })

    const fetchedRepos = (searchedRepos.search.nodes || []).flatMap(node =>
      node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, node)] : [],
    )

    fetchedRepos.map(({owner: {login}, name}) => {
      this.emitSuggestion(`${login}/${name}`, query)
    })
  }

  async fetchTopRepos(event: QueryEvent): Promise<void> {
    let topRepos
    try {
      topRepos = await fetchQuery<RepositoryPickerTopRepositoriesQuery>(this.relayEnvironment, TopRepositories, {
        topRepositoriesFirst: TOP_REPOSITORIES_COUNT,
      }).toPromise()
    } catch (_) {
      // If we have an error, we don't want to cache the results, such that we can retry later.
      this.topRepoNwoCache = undefined
      return
    }
    if (!topRepos?.viewer) return
    const query = event.parsedQuery.at(-1)!.value
    const {topRepositories} = readInlineData<RepositoryPickerTopRepositories$key>(
      TopRepositoriesFragment,
      topRepos.viewer,
    )

    const fetchedRepos = (topRepositories.edges || []).flatMap(a =>
      a?.node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, a.node)] : [],
    )
    fetchedRepos.map(({owner: {login}, name}) => {
      const repoNwo = `${login}/${name}`
      this.topRepoNwoCache!.push(repoNwo)
      this.emitSuggestion(repoNwo, query)
    })
  }

  emitSuggestion(value: string, query: string) {
    let priority = 2
    if (query && !hasMatch(query, value)) return
    if (query) priority -= score(query, value)
    this.dispatchEvent(
      new FilterItem({
        filter: this.value,
        value,
        priority,
        icon: this.icon,
      }),
    )
  }
}
