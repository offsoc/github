import {ThreePanesLayout} from '@github-ui/three-panes-layout'
import {useEffect} from 'react'
import {
  type EntryPointComponent,
  type PreloadedQuery,
  useLazyLoadQuery,
  graphql,
  usePreloadedQuery,
  type UseQueryLoaderLoadQueryOptions,
} from 'react-relay'
import {useLocation} from 'react-router-dom'

import type {SavedViewsQuery} from '../components/sidebar/__generated__/SavedViewsQuery.graphql'
import MobileNavigation from '../components/sidebar/MobileNavigation'
import {SavedViewsGraphqlQuery as customViews} from '../components/sidebar/SavedViews'
import {Sidebar} from '../components/sidebar/Sidebar'

import {useEntryPointsLoader} from '../hooks/use-entrypoint-loaders'
import type {ClientSideRelayDataGeneratorViewQuery} from './__generated__/ClientSideRelayDataGeneratorViewQuery.graphql'
import {AnalyticsWrapper} from './AnalyticsWrapper'
import {currentViewQuery as currentView} from './ClientSideRelayDataGenerator'
import {List} from './List'
import {LABELS} from '../constants/labels'
import {VIEW_IDS} from '../constants/view-constants'
import {useQueryContext} from '../contexts/QueryContext'
import type {
  IssueDashboardKnownViewPageQuery,
  IssueDashboardKnownViewPageQuery$variables,
} from './__generated__/IssueDashboardKnownViewPageQuery.graphql'

const PageQuery = graphql`
  query IssueDashboardKnownViewPageQuery(
    $query: String = "state:open archived:false assignee:@me sort:updated-desc"
    $first: Int = 25
    $labelPageSize: Int = 20
    $skip: Int = null
  ) {
    ...ListQuery
      @arguments(query: $query, first: $first, labelPageSize: $labelPageSize, skip: $skip, fetchRepository: true)
  }
`

export const IssueDashboardKnownViewPage: EntryPointComponent<
  {
    pageQuery: IssueDashboardKnownViewPageQuery
    customViewsQuery: SavedViewsQuery
  },
  Record<string, never>
> = ({queries: {pageQuery, customViewsQuery}}) => {
  const {queryRef: pageQueryRef, loadQuery: loadQuery} = useEntryPointsLoader(pageQuery, PageQuery)
  const {queryRef: customViewsRef} = useEntryPointsLoader(customViewsQuery, customViews)

  const {setCurrentViewId} = useQueryContext()

  const {pathname} = useLocation()
  const id = pathname.split('/').pop()

  useEffect(() => {
    setCurrentViewId(id ? id : VIEW_IDS.empty)
  }, [id, pageQuery, setCurrentViewId])

  if (!pageQueryRef) return null
  if (!customViewsRef) return null

  return (
    <IssueDashboardKnownViewPageContent
      id={id}
      pageQueryRef={pageQueryRef}
      loadQuery={loadQuery}
      savedViewsQueryRef={customViewsRef}
    />
  )
}

function IssueDashboardKnownViewPageContent({
  id,
  pageQueryRef,
  loadQuery,
  savedViewsQueryRef,
}: {
  id?: string
  pageQueryRef: PreloadedQuery<IssueDashboardKnownViewPageQuery>
  savedViewsQueryRef: PreloadedQuery<SavedViewsQuery>
  loadQuery: (
    variables: IssueDashboardKnownViewPageQuery$variables,
    options?: UseQueryLoaderLoadQueryOptions | undefined,
  ) => void
}) {
  const data = usePreloadedQuery<IssueDashboardKnownViewPageQuery>(PageQuery, pageQueryRef)
  const currentViewNode = useLazyLoadQuery<ClientSideRelayDataGeneratorViewQuery>(
    currentView,
    {id},
    {fetchPolicy: 'store-only'},
  )

  return (
    <AnalyticsWrapper category="Issues Dashboard">
      <ThreePanesLayout
        leftPane={{
          element: <Sidebar customViewsRef={savedViewsQueryRef} />,
          ariaLabel: LABELS.viewSidebarPaneAriaLabel,
        }}
        middlePane={
          currentViewNode.node ? (
            <List
              fetchedView={currentViewNode.node}
              search={data}
              fetchedRepository={null}
              loadSearchQuery={loadQuery}
            />
          ) : undefined
        }
      />
      <MobileNavigation customViewsRef={savedViewsQueryRef} />
    </AnalyticsWrapper>
  )
}
