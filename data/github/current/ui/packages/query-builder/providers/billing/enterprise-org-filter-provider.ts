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

import {TOP_ORGANIZATION_COUNT} from '../../constants/search-filters'
import type {
  enterpriseOrgFilterProviderQuery,
  enterpriseOrgFilterProviderQuery$data,
} from './__generated__/enterpriseOrgFilterProviderQuery.graphql'

const TopOrganizations = graphql`
  query enterpriseOrgFilterProviderQuery($slug: String!, $count: Int!, $query: String) {
    enterprise(slug: $slug) {
      organizations(first: $count, query: $query, orderBy: {field: CREATED_AT, direction: DESC}) {
        edges {
          node {
            name
            login
            avatarUrl
          }
        }
      }
    }
  }
`

type OrgData = {
  name: string
  login: string
  avatarUrl: string
}

export class EnterpriseOrgFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  name: string
  slug: string
  priority: number
  singularItemName: string
  value: string
  relayEnvironment: Environment

  // We cache the top orgs given we don't need to re-query on every keystroke
  topOrgCache: OrgData[] | undefined = undefined

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

    if (!this.topOrgCache) {
      // Immediately set this to avoid multiple requests
      this.topOrgCache = []
      const fetchPromise = this.fetchTopOrgs(event)
      this.dispatchEvent(new FetchDataEvent(fetchPromise))
    } else {
      // An enterprise might have a large number of organizations that might not be included in the initial fetch.
      // In this case, we check if the user is searching for something outside the cache and re-query if so.
      const searchedOrgExistsInCache = this.topOrgCache.some(org => hasMatch(lastElement.value, org.login))
      if (!searchedOrgExistsInCache) {
        const fetchPromise = this.fetchTopOrgs(event)
        this.dispatchEvent(new FetchDataEvent(fetchPromise))
        return
      }

      for (const org of this.topOrgCache) {
        this.emitSuggestion(org.name, org.login, org.avatarUrl, lastElement.value)
      }
    }
  }

  async fetchTopOrgs(event: QueryEvent) {
    let topOrgs: enterpriseOrgFilterProviderQuery$data | undefined
    const currentQueryValue = event.parsedQuery.at(-1)?.value

    try {
      topOrgs = await fetchQuery<enterpriseOrgFilterProviderQuery>(this.relayEnvironment, TopOrganizations, {
        slug: this.slug,
        query: currentQueryValue,
        count: TOP_ORGANIZATION_COUNT,
      }).toPromise()
    } catch (_) {
      // If we have an error, we don't want to cache the results, such that we can retry later.
      this.topOrgCache = undefined
      return
    }

    const query = event.parsedQuery.at(-1)!.value
    topOrgs?.enterprise?.organizations.edges?.map(org => {
      const orgLogin = org?.node?.login
      const orgAvatarUrl = org?.node?.avatarUrl
      const orgName = org?.node?.name

      // Add the org to the cache if it has a login and does not already exist
      const orgExistsInCache = this.topOrgCache?.some(cachedOrg => cachedOrg.login === orgLogin)
      if (orgLogin && orgAvatarUrl && !orgExistsInCache) {
        this.topOrgCache!.push({name: orgName ?? orgLogin, login: orgLogin, avatarUrl: orgAvatarUrl})
        this.emitSuggestion(orgName ?? orgLogin, orgLogin, orgAvatarUrl, query)
      }
    })
  }

  emitSuggestion(name: string, value: string, avatarUrl: string, query: string) {
    let priority = 2
    if (query && !hasMatch(query, value)) return
    if (query) priority -= score(query, value)
    this.dispatchEvent(
      new FilterItem({
        filter: this.value,
        value,
        name,
        priority,
        avatar: avatarUrl
          ? {
              url: avatarUrl,
              type: 'org',
            }
          : undefined,
      }),
    )
  }
}
