import {useCallback, useRef} from 'react'
import type {QueryFn, RelayEnv} from './types'
import identity from 'lodash-es/identity'
import {fetchQuery, readInlineData} from 'react-relay'
import {RepositoryFragment, SearchRepositories} from '@github-ui/item-picker/RepositoryPicker'
import type {
  RepositoryPickerRepository$data,
  RepositoryPickerRepository$key,
} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {Subscription} from 'relay-runtime'
import type {
  RepositoryPickerSearchRepositoriesQuery$data,
  RepositoryPickerSearchRepositoriesQuery,
} from '@github-ui/item-picker/RepositoryPickerSearchRepositoriesQuery.graphql'
import {getRepositorySearchQuery} from '@github-ui/issue-viewer/Queries'
import {formatQueryWithOrg} from './utils'

interface Props {
  org: string
  relayEnv: RelayEnv
}

export function useOrgOnlyRepos({org, relayEnv}: Props): QueryFn {
  const searchedReposSubscription = useRef<Subscription | undefined>(undefined)

  const queryFn = useCallback(
    async (query: string) => {
      const formattedQuery = formatQueryWithOrg({org, query})

      const searchedRepos: RepositoryPickerSearchRepositoriesQuery$data = await new Promise((resolve, reject) => {
        fetchQuery<RepositoryPickerSearchRepositoriesQuery>(relayEnv, SearchRepositories, {
          searchQuery: getRepositorySearchQuery(formattedQuery),
        }).subscribe({
          start: newSubscription => {
            searchedReposSubscription.current?.unsubscribe()
            searchedReposSubscription.current = newSubscription
          },
          next: data => {
            resolve(data)
          },
          error: (e: Error) => {
            reject(e)
          },
        })
      })

      const nodes = searchedRepos.search.nodes ?? []

      const fetchedRepos = nodes
        .map(node => (node ? readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, node) : undefined))
        .filter(identity) as RepositoryPickerRepository$data[]

      return fetchedRepos
    },
    [org, relayEnv],
  )

  return queryFn
}
