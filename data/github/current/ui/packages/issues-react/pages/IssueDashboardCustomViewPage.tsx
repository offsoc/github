import {ThreePanesLayout} from '@github-ui/three-panes-layout'
import {useEffect} from 'react'
import {
  graphql,
  type EntryPointComponent,
  type PreloadedQuery,
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
import {ListWithFetchedView} from './List'
import {LABELS} from '../constants/labels'
import {VIEW_IDS} from '../constants/view-constants'
import {useQueryContext} from '../contexts/QueryContext'
import type {
  IssueDashboardCustomViewPageQuery,
  IssueDashboardCustomViewPageQuery$variables,
} from './__generated__/IssueDashboardCustomViewPageQuery.graphql'

const PageQuery = graphql`
  query IssueDashboardCustomViewPageQuery(
    $query: String = "state:open archived:false assignee:@me sort:updated-desc"
    $first: Int = 25
    $labelPageSize: Int = 20
    $skip: Int = null
  ) {
    ...ListQuery
      @arguments(query: $query, first: $first, labelPageSize: $labelPageSize, skip: $skip, fetchRepository: true)
  }
`

export const IssueDashboardCustomViewPage: EntryPointComponent<
  {
    pageQuery: IssueDashboardCustomViewPageQuery
    currentViewQuery: ClientSideRelayDataGeneratorViewQuery
    customViewsQuery: SavedViewsQuery
  },
  Record<string, never>
> = ({queries: {pageQuery, currentViewQuery, customViewsQuery}}) => {
  const {queryRef: pageQueryRef, loadQuery: loadQuery} = useEntryPointsLoader(pageQuery, PageQuery)
  const {queryRef: currentViewRef} = useEntryPointsLoader(currentViewQuery, currentView)
  const {queryRef: customViewsRef} = useEntryPointsLoader(customViewsQuery, customViews)

  const {setCurrentViewId} = useQueryContext()

  const {pathname} = useLocation()
  const id = pathname.split('/').pop()

  useEffect(() => {
    setCurrentViewId(id ? id : VIEW_IDS.empty)
  }, [id, pageQuery, setCurrentViewId])

  if (!currentViewRef) return null
  if (!pageQueryRef) return null
  if (!customViewsRef) return null

  return (
    <IssueDashboardCustomViewPageContent
      pageQueryRef={pageQueryRef}
      currentViewQueryRef={currentViewRef}
      loadQuery={loadQuery}
      savedViewsQueryRef={customViewsRef}
    />
  )
}

function IssueDashboardCustomViewPageContent({
  pageQueryRef,
  loadQuery,
  currentViewQueryRef,
  savedViewsQueryRef,
}: {
  pageQueryRef: PreloadedQuery<IssueDashboardCustomViewPageQuery>
  currentViewQueryRef: PreloadedQuery<ClientSideRelayDataGeneratorViewQuery>
  savedViewsQueryRef: PreloadedQuery<SavedViewsQuery>
  loadQuery: (
    variables: IssueDashboardCustomViewPageQuery$variables,
    options?: UseQueryLoaderLoadQueryOptions | undefined,
  ) => void
}) {
  const data = usePreloadedQuery<IssueDashboardCustomViewPageQuery>(PageQuery, pageQueryRef)

  return (
    <AnalyticsWrapper category="Issues Dashboard">
      <ThreePanesLayout
        leftPane={{
          element: <Sidebar customViewsRef={savedViewsQueryRef} />,
          ariaLabel: LABELS.viewSidebarPaneAriaLabel,
        }}
        middlePane={
          <ListWithFetchedView
            currentViewRef={currentViewQueryRef}
            fetchedRepository={null}
            search={data}
            loadSearchQuery={loadQuery}
          />
        }
      />
      <MobileNavigation customViewsRef={savedViewsQueryRef} />
    </AnalyticsWrapper>
  )
}
