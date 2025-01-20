import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {ListViewSectionFilterLink} from '@github-ui/list-view/ListViewSectionFilterLink'
import {getQuery} from '@github-ui/list-view-items-issues-prs/Query'
import {ListLoading} from '@github-ui/list-view-items-issues-prs/ListLoading'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
import {type MutableRefObject, Suspense} from 'react'
import {graphql, useFragment, type UseQueryLoaderLoadQueryOptions} from 'react-relay'
import {useLocation} from 'react-router-dom'

import {VALUES} from '../../constants/values'
import type {AppPayload} from '../../types/app-payload'
import {ListError} from '../list/ListError'
import {ListItems} from '../list/ListItems'
import type {SearchList$key} from './__generated__/SearchList.graphql'
import type {IssueIndexPageQuery$variables} from '../../pages/__generated__/IssueIndexPageQuery.graphql'
import type {SearchListRepo$key} from './__generated__/SearchListRepo.graphql'

type SearchListProps = {
  itemIdentifier: ItemIdentifier | undefined
  query: string
  search: SearchList$key
  repository: SearchListRepo$key | null
  loadSearchQuery?: (vars: IssueIndexPageQuery$variables, opts: UseQueryLoaderLoadQueryOptions) => void
  queryFromCustomView?: string | null
  listRef: MutableRefObject<HTMLUListElement | undefined>
}

export function SearchList({
  itemIdentifier,
  query,
  search,
  repository,
  loadSearchQuery,
  queryFromCustomView,
  listRef,
}: SearchListProps) {
  const data = useFragment(
    graphql`
      fragment SearchList on Query
      @argumentDefinitions(
        query: {type: "String!"}
        first: {type: "Int"}
        labelPageSize: {type: "Int!"}
        skip: {type: "Int", defaultValue: null}
        fetchRepository: {type: "Boolean!"}
      ) {
        ...ListItemsPaginated_results
          @arguments(
            query: $query
            first: $first
            labelPageSize: $labelPageSize
            skip: $skip
            fetchRepository: $fetchRepository
          )
      }
    `,
    search,
  )

  const {scoped_repository} = useAppPayload<AppPayload>()
  const {pathname} = useLocation()
  const showBorder = !(itemIdentifier?.number !== undefined || pathname === '/issues/new')

  const repo = useFragment(
    graphql`
      fragment SearchListRepo on Repository {
        viewerCanPush
        isDisabled
        isLocked
        isArchived
      }
    `,
    repository,
  )

  const isBulkSupported = repo && repo.viewerCanPush && !(repo.isDisabled || repo.isLocked || repo.isArchived)

  const suspendedFilterLink = [
    <ListViewSectionFilterLink key="open" title="Open" count="4" isLoading href={''} />,
    <ListViewSectionFilterLink key="closed" title="Closed" count="4" isLoading href={''} />,
  ]

  return (
    <Suspense
      fallback={
        <ListLoading
          sectionFilters={suspendedFilterLink}
          showBorder={showBorder}
          layoutDensity={'default'}
          pageSize={VALUES.issuesPageSize()}
        />
      }
    >
      <PreloadedQueryBoundary
        fallback={ListError}
        onRetry={() => {
          if (!query || !loadSearchQuery) return
          loadSearchQuery(
            {
              query: getQuery(query, scoped_repository),
              owner: scoped_repository ? scoped_repository.owner : '',
              name: scoped_repository ? scoped_repository.name : '',
            },
            {fetchPolicy: 'network-only'},
          )
        }}
      >
        <ListItems
          search={data}
          queryFromCustomView={queryFromCustomView}
          listRef={listRef}
          isBulkSupported={isBulkSupported ?? false}
        />
      </PreloadedQueryBoundary>
    </Suspense>
  )
}
