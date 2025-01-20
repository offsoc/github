import {Box, TreeView} from '@primer/react'
import {useEffect, useMemo} from 'react'
import {graphql, type PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {ConnectionHandler} from 'relay-runtime'

import {LABELS} from '../../constants/labels'
import {VALUES} from '../../constants/values'
import {useQueryContext} from '../../contexts/QueryContext'
import useKnownShortcuts from '../../hooks/use-known-views'
import {useViewsNav} from '../../hooks/viewsNav'
import type {SavedViewRoute} from '../../types/views-types'
import type {SavedViewsPaginated$key} from './__generated__/SavedViewsPaginated.graphql'
import type {SavedViewsPaginatedQuery} from './__generated__/SavedViewsPaginatedQuery.graphql'
import type {SavedViewsQuery} from './__generated__/SavedViewsQuery.graphql'
import {CreateSavedView} from './CreateSavedView'
import {SavedViewRow} from './SavedViewRow'

export const SavedViewsGraphqlQuery = graphql`
  query SavedViewsQuery(
    $viewsPageSize: Int = 25
    $selectedTeamsPageSize: Int = 25
    $teamViewPageSize: Int = 25
    $searchTypes: [SearchShortcutType!] = [ISSUES, PULL_REQUESTS]
  ) {
    viewer {
      dashboard {
        ...SavedViewsPaginated @arguments(viewsPageSize: $viewsPageSize, searchTypes: $searchTypes)
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...SharedViewTreeList
          @arguments(
            selectedTeamsPageSize: $selectedTeamsPageSize
            teamViewPageSize: $teamViewPageSize
            searchTypes: $searchTypes
          )
      }
    }
  }
`

type SavedViewsProps = {
  savedViewsRef: PreloadedQuery<SavedViewsQuery>
}
type SavedViewsInternalProps = {
  savedViewsRef: SavedViewsPaginated$key
}

export function SavedViews({savedViewsRef}: SavedViewsProps) {
  const preloadedData = usePreloadedQuery<SavedViewsQuery>(SavedViewsGraphqlQuery, savedViewsRef)
  return preloadedData.viewer.dashboard ? <SavedViewsInternal savedViewsRef={preloadedData.viewer.dashboard} /> : null
}

function SavedViewsInternal({savedViewsRef}: SavedViewsInternalProps) {
  const {knownViews} = useKnownShortcuts()

  const {data} = usePaginationFragment<SavedViewsPaginatedQuery, SavedViewsPaginated$key>(
    graphql`
      fragment SavedViewsPaginated on UserDashboard
      @argumentDefinitions(
        viewsPageSize: {type: "Int"}
        cursor: {type: "String"}
        searchTypes: {type: "[SearchShortcutType!]!"}
      )
      @refetchable(queryName: "SavedViewsPaginatedQuery") {
        shortcuts(first: $viewsPageSize, after: $cursor, searchTypes: $searchTypes)
          @connection(key: "Viewer_shortcuts") {
          edges {
            node {
              id
              name
              query
              ...SavedViewRow
            }
          }
        }
      }
    `,
    savedViewsRef,
  )

  const {shortcuts: views, id: fragmentId} = data
  const connectionID = ConnectionHandler.getConnectionID(
    fragmentId, // passed as input to the mutation/subscription
    'Viewer_shortcuts',
  )

  const {setSaveViewsConnectionId} = useQueryContext()
  useEffect(() => {
    setSaveViewsConnectionId(connectionID)
  }, [connectionID, setSaveViewsConnectionId])

  const savedViews = (views?.edges || []).flatMap(a => (a && a.node ? a.node : []))

  const savedViewRoutes: SavedViewRoute[] = useMemo(
    () =>
      savedViews.map(({id, name, query}, index) => ({
        id,
        name,
        query,
        position: index + knownViews.length + 1,
      })),
    [knownViews.length, savedViews],
  )

  const viewKeys = useMemo(() => savedViewRoutes.map(route => route.position.toString()), [savedViewRoutes])
  useViewsNav(savedViewRoutes, viewKeys, knownViews.length)

  return (
    <TreeView.Item id="saved-views" defaultExpanded>
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
        <TreeView.DirectoryIcon />
        <Box sx={{fontSize: 0, fontWeight: 'bold', color: 'fg.default'}}>{LABELS.myViews}</Box>
      </Box>
      <TreeView.SubTree>
        {savedViews.length > 0 && (
          <>
            {savedViews.map((savedView, index) => (
              <SavedViewRow key={index} savedView={savedView} position={index + 1} />
            ))}
          </>
        )}
        {savedViews.length < VALUES.viewsPageSize && <CreateSavedView />}
      </TreeView.SubTree>
    </TreeView.Item>
  )
}
