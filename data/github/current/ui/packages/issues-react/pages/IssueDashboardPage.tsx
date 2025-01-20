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
import {LABELS} from '../constants/labels'
import {ASSIGNED_TO_ME_VIEW, EMPTY_VIEW} from '../constants/view-constants'
import {useEntryPointsLoader} from '../hooks/use-entrypoint-loaders'
import type {ClientSideRelayDataGeneratorViewQuery} from './__generated__/ClientSideRelayDataGeneratorViewQuery.graphql'
import {AnalyticsWrapper} from './AnalyticsWrapper'
import {currentViewQuery as currentView} from './ClientSideRelayDataGenerator'
import {List} from './List'
import {useQueryContext} from '../contexts/QueryContext'
import {useAppNavigate} from '../hooks/use-app-navigate'
import type {
  IssueDashboardPageQuery,
  IssueDashboardPageQuery$variables,
} from './__generated__/IssueDashboardPageQuery.graphql'

const PageQuery = graphql`
  query IssueDashboardPageQuery(
    $query: String = "state:open archived:false assignee:@me sort:updated-desc"
    $first: Int = 25
    $labelPageSize: Int = 20
    $skip: Int = null
  ) {
    ...ListQuery
      @arguments(query: $query, first: $first, labelPageSize: $labelPageSize, skip: $skip, fetchRepository: true)
  }
`

export const IssueDashboardPage: EntryPointComponent<
  {pageQuery: IssueDashboardPageQuery; customViewsQuery: SavedViewsQuery},
  Record<string, never>
> = ({queries: {pageQuery, customViewsQuery}}) => {
  const {queryRef: pageQueryRef, loadQuery} = useEntryPointsLoader(pageQuery, PageQuery)
  const {queryRef: savedViewsQueryRef} = useEntryPointsLoader(customViewsQuery, customViews)

  const {navigateToView} = useAppNavigate()
  const {search} = useLocation()

  if (!pageQueryRef) return null
  if (!savedViewsQueryRef) return null

  const urlSearchParams = new URLSearchParams(search)
  const urlQuery = urlSearchParams.get('q')

  if (!urlQuery) {
    navigateToView({viewId: ASSIGNED_TO_ME_VIEW.id, canEditView: true})
    return null
  }
  return (
    <IssueDashboardPageContent
      pageQueryRef={pageQueryRef}
      loadQuery={loadQuery}
      savedViewsQueryRef={savedViewsQueryRef}
    />
  )
}

function IssueDashboardPageContent({
  pageQueryRef,
  loadQuery,
  savedViewsQueryRef,
}: {
  pageQueryRef: PreloadedQuery<IssueDashboardPageQuery>
  savedViewsQueryRef: PreloadedQuery<SavedViewsQuery>
  loadQuery: (
    variables: IssueDashboardPageQuery$variables,
    options?: UseQueryLoaderLoadQueryOptions | undefined,
  ) => void
}) {
  const {setCurrentViewId} = useQueryContext()

  useEffect(() => {
    setCurrentViewId(EMPTY_VIEW.id)
  }, [setCurrentViewId])

  const currentViewNode = useLazyLoadQuery<ClientSideRelayDataGeneratorViewQuery>(
    currentView,
    {id: EMPTY_VIEW.id},
    {fetchPolicy: 'store-only'},
  )

  const data = usePreloadedQuery<IssueDashboardPageQuery>(PageQuery, pageQueryRef)

  if (!currentViewNode || !currentViewNode.node) return null

  return (
    <AnalyticsWrapper category="Issues Dashboard">
      <ThreePanesLayout
        leftPane={{
          element: <Sidebar customViewsRef={savedViewsQueryRef} />,
          ariaLabel: LABELS.viewSidebarPaneAriaLabel,
        }}
        middlePane={
          <List fetchedView={currentViewNode.node} fetchedRepository={null} search={data} loadSearchQuery={loadQuery} />
        }
      />
      <MobileNavigation customViewsRef={savedViewsQueryRef} />
    </AnalyticsWrapper>
  )
}
