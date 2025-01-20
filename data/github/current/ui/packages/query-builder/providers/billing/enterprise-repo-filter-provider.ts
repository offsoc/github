import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FetchDataEvent,
  FilterItem,
  type FilterProvider,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch, score} from 'fzy.js'
import type {Environment} from 'react-relay'
import {fetchQuery, graphql} from 'react-relay'

import {TOP_REPOSITORIES_COUNT} from '../../constants/search-filters'
import type {
  enterpriseRepoFilterProviderQuery,
  enterpriseRepoFilterProviderQuery$data,
} from './__generated__/enterpriseRepoFilterProviderQuery.graphql'

const TopRepositories = graphql`
  query enterpriseRepoFilterProviderQuery($slug: String!, $count: Int!, $phrase: String) {
    viewer {
      enterpriseRepositories(phrase: $phrase, slug: $slug, first: $count) {
        nodes {
          nameWithOwner
        }
      }
    }
  }
`

type RepoData = {
  name: string
}

export class EnterpriseRepoFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  name: string
  slug: string
  priority: number
  singularItemName: string
  value: string
  relayEnvironment: Environment

  // We cache the top repos given we don't need to re-query on every keystroke
  topRepoCache: RepoData[] | undefined = undefined

  constructor(
    queryBuilder: QueryBuilderElement,
    {
      name,
      slug,
      value,
      priority,
      relayEnvironment,
    }: {
      name: string
      slug: string
      value: string
      priority: number
      relayEnvironment: Environment
    },
  ) {
    super()

    this.name = name
    this.slug = slug
    this.singularItemName = name
    this.value = value
    this.priority = priority
    this.relayEnvironment = relayEnvironment
    queryBuilder.addEventListener('query', this)
    queryBuilder.attachProvider(this)
  }

  async handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)!

    if (
      (lastElement.value !== '' || this.priority <= 5) &&
      lastElement?.type !== 'filter' &&
      !event.parsedQuery.some(e => e.type === 'filter' && e.filter === this.value) &&
      (hasMatch(lastElement?.value, this.name) || hasMatch(lastElement?.value, this.value))
    ) {
      this.dispatchEvent(new Event('show'))
    }

    if (lastElement?.type !== this.type || lastElement.filter !== this.value) return

    if (!this.topRepoCache) {
      // Immediately set this to avoid multiple requests
      this.topRepoCache = []
      const fetchPromise = this.fetchTopRepos(event)
      this.dispatchEvent(new FetchDataEvent(fetchPromise))
    } else {
      // An enterprise might have a large number of repos that might not be included in the initial fetch.
      // In this case, we check if the user is searching for something outside the cache and re-query if so.
      const searchedRepoExistsInCache = this.topRepoCache.some(repo => hasMatch(lastElement.value, repo.name))

      if (!searchedRepoExistsInCache) {
        const fetchPromise = this.fetchTopRepos(event)
        this.dispatchEvent(new FetchDataEvent(fetchPromise))
        return
      }

      for (const repo of this.topRepoCache) {
        this.emitSuggestion(repo.name, repo.name, lastElement.value)
      }
    }
  }

  async fetchTopRepos(event: QueryEvent) {
    let topRepos: enterpriseRepoFilterProviderQuery$data | undefined
    const currentQueryValue = event.parsedQuery.at(-1)?.value

    try {
      topRepos = await fetchQuery<enterpriseRepoFilterProviderQuery>(this.relayEnvironment, TopRepositories, {
        slug: this.slug,
        phrase: currentQueryValue,
        count: TOP_REPOSITORIES_COUNT,
      }).toPromise()
    } catch (_) {
      // If we have an error, we don't want to cache the results, such that we can retry later.
      this.topRepoCache = undefined
      return
    }

    const query = event.parsedQuery.at(-1)!.value
    topRepos?.viewer?.enterpriseRepositories?.nodes?.map(repo => {
      const name = repo?.nameWithOwner

      // Add the repo to the cache if it has a name and does not already exist
      const repoExistsInCache = this.topRepoCache?.some(cachedRepo => cachedRepo.name === name)
      if (name && !repoExistsInCache) {
        this.topRepoCache!.push({name})
        this.emitSuggestion(name, name, query)
      }
    })
  }

  emitSuggestion(name: string, value: string, query: string) {
    let priority = 2
    if (query && !hasMatch(query, value)) return
    if (query) priority -= score(query, value)
    this.dispatchEvent(
      new FilterItem({
        filter: this.value,
        value,
        name,
        priority,
      }),
    )
  }
}
