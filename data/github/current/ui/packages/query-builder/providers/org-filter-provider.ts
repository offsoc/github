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

import {TOP_ORGANIZATION_COUNT} from '../constants/search-filters'
import type {orgFilterProviderQuery, orgFilterProviderQuery$data} from './__generated__/orgFilterProviderQuery.graphql'

const TopOrganizations = graphql`
  query orgFilterProviderQuery($count: Int!) {
    viewer {
      organizations(first: $count) {
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

export class OrgFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  icon = 'organization' as Icon
  name: string
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
      for (const org of this.topOrgCache) {
        this.emitSuggestion(org.name, org.login, org.avatarUrl, lastElement.value)
      }
    }
  }

  async fetchTopOrgs(event: QueryEvent) {
    let topOrgs: orgFilterProviderQuery$data | undefined

    try {
      topOrgs = await fetchQuery<orgFilterProviderQuery>(this.relayEnvironment, TopOrganizations, {
        count: TOP_ORGANIZATION_COUNT,
      }).toPromise()
    } catch (_) {
      // If we have an error, we don't want to cache the results, such that we can retry later.
      this.topOrgCache = undefined
      return
    }

    const query = event.parsedQuery.at(-1)!.value
    topOrgs?.viewer.organizations.edges?.map(org => {
      const orgLogin = org?.node?.login
      const orgAvatarUrl = org?.node?.avatarUrl
      const orgName = org?.node?.name
      if (orgLogin && orgAvatarUrl) {
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
        icon: this.icon,
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
