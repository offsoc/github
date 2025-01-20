import {Box} from '@primer/react'
import {memo, Suspense} from 'react'
import {graphql, type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {useRelayEnvironment} from 'react-relay/hooks'

import {Search} from '../components/search/Search'
import type {ClientSideRelayDataGeneratorViewQuery} from './__generated__/ClientSideRelayDataGeneratorViewQuery.graphql'
import type {ListCurrentViewFragment$key} from './__generated__/ListCurrentViewFragment.graphql'
import {currentViewQuery} from './ClientSideRelayDataGenerator'
import {HeaderLoading} from '../components/list/header/HeaderLoading'
import {useRouteInfo} from '../hooks/use-route-info'
import {Header} from '../components/list/header/Header'
import type {ListQuery$key} from './__generated__/ListQuery.graphql'
import type {LoadSearchQuery} from './shared'
import type {ListRepositoryFragment$key} from './__generated__/ListRepositoryFragment.graphql'

type ListWithFetchedView = {
  currentViewRef: PreloadedQuery<ClientSideRelayDataGeneratorViewQuery>
  fetchedRepository: ListRepositoryFragment$key | null
  search: ListQuery$key
  loadSearchQuery?: LoadSearchQuery
  onCollapse?: () => void
}

export type ListProps = Omit<ListWithFetchedView, 'currentViewRef'> & {
  fetchedView: ListCurrentViewFragment$key
  queryFromCustomView?: string | null
}

export const ListWithFetchedView = ({currentViewRef, ...rest}: ListWithFetchedView) => {
  const relayEnvironment = useRelayEnvironment()
  const currentViewEncapsulated = usePreloadedQuery<ClientSideRelayDataGeneratorViewQuery>(
    currentViewQuery,
    currentViewRef,
  )
  if (!currentViewEncapsulated.node) {
    return null
  }

  // This is used to get the original query, without replacements (such as @today)
  let queryFromCustomView: string | null = null
  const id = currentViewRef.variables.id
  if (id) {
    const viewNode = relayEnvironment.getStore().getSource().get(id)
    if (viewNode && viewNode.query) {
      queryFromCustomView = viewNode.query as string
    }
  }

  return <List fetchedView={currentViewEncapsulated.node} queryFromCustomView={queryFromCustomView} {...rest} />
}

const ListInternal = ({
  fetchedView,
  fetchedRepository,
  search,
  loadSearchQuery,
  queryFromCustomView,
  onCollapse,
}: ListProps) => {
  const currentViewNode = useFragment<ListCurrentViewFragment$key>(
    graphql`
      fragment ListCurrentViewFragment on Shortcutable {
        ...SearchBarCurrentViewFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...HeaderCurrentViewFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...EditViewButtonCurrentViewFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...HeaderContentCurrentViewFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...IconAndColorPickerViewFragment
      }
    `,
    fetchedView,
  )

  const repoData = useFragment<ListRepositoryFragment$key>(
    graphql`
      fragment ListRepositoryFragment on Repository {
        ...SearchRepositoryFragment
      }
    `,
    fetchedRepository || null,
  )

  const searchData = useFragment(
    graphql`
      fragment ListQuery on Query
      @argumentDefinitions(
        query: {type: "String!"}
        first: {type: "Int"}
        labelPageSize: {type: "Int!"}
        skip: {type: "Int", defaultValue: null}
        fetchRepository: {type: "Boolean!"}
      ) {
        ...SearchRootFragment
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

  const {itemIdentifier} = useRouteInfo()

  return (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
      aria-labelledby="view-title"
    >
      {currentViewNode && (
        <Suspense fallback={<HeaderLoading />}>
          <Header
            setSafeDocumentTitle={!!itemIdentifier?.number}
            currentView={currentViewNode}
            onCollapse={onCollapse}
          />
        </Suspense>
      )}
      {currentViewNode && (
        <Search
          itemIdentifier={itemIdentifier}
          currentView={currentViewNode}
          currentRepository={repoData ?? null}
          search={searchData}
          loadSearchQuery={loadSearchQuery}
          queryFromCustomView={queryFromCustomView}
        />
      )}
    </Box>
  )
}

export const List = memo(ListInternal)
