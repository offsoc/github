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
import {fetchQuery, graphql} from 'react-relay'

import type {
  issueTypeFilterProviderQuery,
  issueTypeFilterProviderQuery$data,
} from './__generated__/issueTypeFilterProviderQuery.graphql'
import {FILTER_VALUES} from '../constants/search-filters'

const RepoIssueTypesQuery = graphql`
  query issueTypeFilterProviderQuery($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      issueTypes(first: 10) {
        edges {
          node {
            name
          }
        }
      }
    }
  }
`

type IssueTypeData = {
  name?: string | undefined
  value: string
}

export class IssueTypeFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  icon = 'issue' as Icon
  name: string
  priority: number
  singularItemName: string
  value: string
  owner: string | ''
  repo: string | ''
  relayEnvironment: Environment

  // We cache the issue types given we don't need to re-query on every keystroke
  issueTypeCache: IssueTypeData[] | undefined = undefined

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
    repositoryScope: string,
  ) {
    super()

    this.name = name
    this.singularItemName = name
    this.value = value
    this.icon = icon
    this.priority = priority
    const repoParts = repositoryScope.split('/')
    this.owner = repoParts[0]!
    this.repo = repoParts[1]!
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

    if (!this.issueTypeCache) {
      // Immediately set this to avoid multiple requests
      this.issueTypeCache = []

      // Add static item type (issue, pr) values to suggestions for now
      const filterKey = this.value
      FILTER_VALUES[filterKey]?.map(filterValue => {
        const {name} = filterValue
        const value = 'value' in filterValue ? filterValue.value : filterValue.valueFunc()
        const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1)
        this.issueTypeCache?.push({value, name: name ?? capitalizedValue})
        this.emitSuggestion(value, name ?? capitalizedValue, lastElement.value)
      })

      const fetchPromise = this.fetchRepoIssueTypes(event)
      this.dispatchEvent(new FetchDataEvent(fetchPromise))
    } else {
      for (const issueType of this.issueTypeCache) {
        this.emitSuggestion(issueType.value, issueType?.name, lastElement.value)
      }
    }
  }

  async fetchRepoIssueTypes(event: QueryEvent) {
    let repoIssueTypes: issueTypeFilterProviderQuery$data | undefined

    try {
      repoIssueTypes = await fetchQuery<issueTypeFilterProviderQuery>(this.relayEnvironment, RepoIssueTypesQuery, {
        name: this.repo,
        owner: this.owner,
      }).toPromise()
    } catch (_) {
      // If we have an error, we don't want to cache the results, such that we can retry later.
      this.issueTypeCache = undefined
      return
    }

    const query = event.parsedQuery.at(-1)!.value
    repoIssueTypes?.repository?.issueTypes?.edges?.map(issueType => {
      const value = issueType?.node?.name
      if (value) {
        this.issueTypeCache!.push({value})
        this.emitSuggestion(value, undefined, query)
      }
    })
  }

  emitSuggestion(value: string, name: string | undefined, query: string) {
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
