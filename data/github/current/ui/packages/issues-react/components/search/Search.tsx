import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {getQuery} from '@github-ui/list-view-items-issues-prs/Query'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {Box} from '@primer/react'
import {useCallback, useEffect, useRef} from 'react'
import {graphql, useFragment, type PreloadFetchPolicy} from 'react-relay'

import {useQueryContext} from '../../contexts/QueryContext'
import {useHyperlistAnalytics} from '../../hooks/use-hyperlist-analytics'
import type {AppPayload} from '../../types/app-payload'
import NewViewExperience from '../list/NewViewExperience'
import type {SearchBarCurrentViewFragment$key} from './__generated__/SearchBarCurrentViewFragment.graphql'
import {SearchBar} from './SearchBar'
import {SearchList} from './SearchList'

import type {LoadSearchQuery} from '../../pages/shared'
import type {SearchRepositoryFragment$key} from './__generated__/SearchRepositoryFragment.graphql'
import type {SearchRootFragment$key} from './__generated__/SearchRootFragment.graphql'

type SearchProps = {
  itemIdentifier: ItemIdentifier | undefined
  currentView: SearchBarCurrentViewFragment$key
  currentRepository: SearchRepositoryFragment$key | null
  search: SearchRootFragment$key
  loadSearchQuery?: LoadSearchQuery
  queryFromCustomView?: string | null
}

export function Search({
  itemIdentifier,
  currentView,
  currentRepository,
  search,
  loadSearchQuery,
  queryFromCustomView,
}: SearchProps) {
  const data = useFragment(
    graphql`
      fragment SearchRootFragment on Query
      @argumentDefinitions(
        query: {type: "String!"}
        first: {type: "Int"}
        labelPageSize: {type: "Int!"}
        skip: {type: "Int", defaultValue: null}
        fetchRepository: {type: "Boolean!"}
      ) {
        ...SearchList
          @arguments(
            query: $query
            first: $first
            labelPageSize: $labelPageSize
            fetchRepository: $fetchRepository
            skip: $skip
          )
      }
    `,
    search,
  )

  const repoData = useFragment(
    graphql`
      fragment SearchRepositoryFragment on Repository {
        ...SearchBarRepositoryFragment
        ...SearchListRepo
      }
    `,
    currentRepository,
  )

  const {activeSearchQuery, setActiveSearchQuery, setExecuteQuery, setIsQueryLoading, isNewView} = useQueryContext()
  const {sendHyperlistAnalyticsEvent} = useHyperlistAnalytics()
  const {scoped_repository} = useAppPayload<AppPayload>()

  const loadSearchResults = useCallback(
    (currentQuery: string, fetchPolicy: PreloadFetchPolicy = 'store-or-network') => {
      if (!loadSearchQuery) {
        return
      }
      loadSearchQuery(
        {
          query: getQuery(currentQuery, scoped_repository),
          skip: 0,
          name: scoped_repository ? scoped_repository.name : '',
          owner: scoped_repository ? scoped_repository.owner : '',
        },
        {fetchPolicy},
      )
    },

    [loadSearchQuery, scoped_repository],
  )

  const executeSearch = useCallback(
    (newQuery: string, fetchPolicy: PreloadFetchPolicy = 'network-only') => {
      setActiveSearchQuery(newQuery)
      setIsQueryLoading(true)
      loadSearchResults(newQuery, fetchPolicy)
      setIsQueryLoading(false)
      sendHyperlistAnalyticsEvent('search.execute', 'FILTER_BAR_INPUT', {new_query: newQuery})
    },
    [loadSearchResults, sendHyperlistAnalyticsEvent, setActiveSearchQuery, setIsQueryLoading],
  )

  useEffect(() => {
    setExecuteQuery(() => executeSearch)
  }, [executeSearch, setExecuteQuery])

  const listRef = useRef<HTMLUListElement>()

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
      <SearchBar
        currentView={currentView}
        currentRepository={repoData ?? null}
        queryFromCustomView={queryFromCustomView}
      />
      {isNewView && !activeSearchQuery ? (
        <NewViewExperience />
      ) : (
        <SearchList
          itemIdentifier={itemIdentifier}
          search={data}
          repository={repoData ?? null}
          loadSearchQuery={loadSearchQuery}
          query={activeSearchQuery}
          queryFromCustomView={queryFromCustomView}
          listRef={listRef}
        />
      )}
    </Box>
  )
}
