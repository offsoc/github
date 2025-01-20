import {ThemeProvider} from '@primer/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useState} from 'react'
import {MemoryRouter, type MemoryRouterProps} from 'react-router-dom'
import {createMockEnvironment as createRelayMockEnvironment} from 'relay-test-utils'

import type {MemexColumn} from '../client/api/columns/contracts/memex-column'
import {DefaultPrivileges, type Privileges} from '../client/api/common-contracts'
import type {EnabledFeatures} from '../client/api/enabled-features/contracts'
import type {MemexItem} from '../client/api/memex-items/contracts'
import type {PageView} from '../client/api/view/contracts'
import {AppContainer} from '../client/app'
import {BoardContextProvider} from '../client/components/board/board-context'
import {BoardFilterInput} from '../client/components/board/board-filter-input'
import {BoardNavigationProvider, type CardGrid} from '../client/components/board/navigation'
import {ViewsProvider} from '../client/components/views'
import type {JSONIslandData} from '../client/helpers/json-island'
import {ViewType} from '../client/helpers/view-type'
import type {MemexItemModel} from '../client/models/memex-item-model'
import {InsightsChartView} from '../client/pages/insights/components/insights-chart-view'
import {InsightsLayout} from '../client/pages/insights/components/insights-layout'
import {InsightsConfigurationPaneProvider} from '../client/pages/insights/hooks/use-insights-configuration-pane'
import {ProjectViewInner} from '../client/project-view'
import {MemexStateProvider} from '../client/state-providers/memex/memex-state-provider'
import {setMemexItemsQueryDataInQueryClient} from '../client/state-providers/memex-items/query-client-api/memex-items'
import {AddFieldModalContextProvider} from '../client/state-providers/modals/add-field-modal-state-provider'
import {Resources} from '../client/strings'
import {DefaultWorkflowsPersisted} from '../mocks/data/workflows'
import {createMockEnvironment} from './create-mock-environment'
import {buildSystemColumns} from './factories/columns/system-column-factory'
import {buildMemex} from './factories/memexes/memex-factory'
import {viewFactory} from './factories/views/view-factory'

type TestViewOptions = {
  items?: Array<MemexItem>
  columns?: Array<MemexColumn>
  views?: Array<PageView>
  viewerPrivileges?: Privileges
  children?: React.ReactNode
  excludeLastUpdated?: boolean
}

export const setupProjectView = (
  projectView: ViewType,
  {items = [], columns = [], views, viewerPrivileges, children = null}: TestViewOptions = {items: [], columns: []},
) => {
  const viewData = views ?? [viewFactory.withViewType(projectView).withDefaultColumnsAsVisibleFields(columns).build()]
  const privileges = viewerPrivileges ?? DefaultPrivileges

  createTestEnvironment({
    'memex-data': buildMemex(),
    'memex-views': viewData,
    'memex-columns-data': columns,
    'memex-items-data': items,
    'memex-viewer-privileges': privileges,
  })

  const ProjectViewComponent = getProjectViewComponent(
    <>
      {children}
      <ProjectViewInner type={projectView} />
    </>,
  )

  return {ProjectViewComponent}
}

/**
 * setupTableView and setupBoardView intentionally render the <ProjectViewInner> component
 * to maintain smaller DOM size and improve testing performance
 * If switching between views is needed, provide <ProjectView> as a child instead.
 */

export function setupTableView({columns, ...options}: TestViewOptions) {
  const {ProjectViewComponent} = setupProjectView(ViewType.Table, {
    ...options,
    columns: columns ?? buildSystemColumns(),
  })
  return {Table: ProjectViewComponent}
}

export function setupBoardView({columns, ...options}: TestViewOptions) {
  const {ProjectViewComponent} = setupProjectView(ViewType.Board, {
    ...options,
    columns: columns ?? buildSystemColumns(),
  })
  return {Board: ProjectViewComponent}
}

export function setupBoardFilterBar({columns, items}: TestViewOptions) {
  const columnsData = columns ?? buildSystemColumns()

  createTestEnvironment({
    'memex-data': buildMemex(),
    'memex-columns-data': columnsData,
    'memex-views': [viewFactory.withViewType('board').withDefaultColumnsAsVisibleFields(columnsData).build()],
    'memex-items-data': items,
  })

  const navigationMetaRef: {current: {cardGrid: CardGrid}} = {
    current: {
      cardGrid: [
        {
          horizontalGroupId: Resources.undefined,
          isCollapsed: false,
          isFooterDisabled: false,
          verticalGroups: [{verticalGroupId: 'abc', items: []}],
        },
      ],
    },
  }

  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = () => {
    return (
      <TestAppContainer>
        <ViewsProvider>
          <BoardContextProvider>
            <BoardNavigationProvider metaRef={navigationMetaRef}>
              <BoardFilterInput />
            </BoardNavigationProvider>
          </BoardContextProvider>
        </ViewsProvider>
      </TestAppContainer>
    )
  }

  return {FilterBar: wrapper}
}

export const setupInsightsPage = ({
  basicCharts,
  limitedChartsLimit,
}: {
  basicCharts: boolean
  limitedChartsLimit?: number
}) => {
  const insightsFeatures: Array<EnabledFeatures> = basicCharts
    ? ['memex_charts_basic_private', 'memex_charts_basic_public']
    : []

  createTestEnvironment({
    'memex-data': buildMemex(),
    'memex-columns-data': buildSystemColumns(),
    'memex-limits': {
      limitedChartsLimit: limitedChartsLimit ?? 2,
      projectItemLimit: 100,
      projectItemArchiveLimit: 10_000,
      singleSelectColumnOptionsLimit: 25,
      autoAddCreationLimit: 4,
      viewsLimit: 50,
    },
    'memex-relay-ids': {
      memexProject: 'PVT_1234',
    },
    'memex-enabled-features': insightsFeatures,
  })

  const InsightsPageComponent = getInsightsPageComponent()

  return {InsightsPageComponent}
}

export function setupRoadmapView({columns, ...options}: TestViewOptions) {
  const {ProjectViewComponent} = setupProjectView(ViewType.Roadmap, {
    ...options,
    columns: columns ?? buildSystemColumns(),
  })
  return {Roadmap: ProjectViewComponent}
}

/**
 * TestAppContainer provides a minimal wrapper for testing Memex
 * components.
 *
 * It wraps AppContainer, which renders the top level context
 * providers necessary for much of the app to function, inside
 * a MemoryRouter.
 */
export const TestAppContainer = ({
  children,
  routerProps,
}: {
  children?: React.ReactNode
  routerProps?: Omit<MemoryRouterProps, 'children'>
}) => {
  const environment = createRelayMockEnvironment()
  return (
    <>
      <MemoryRouter initialEntries={['/orgs/monalisa/projects/1']} {...routerProps}>
        <QueryClientWrapper>
          <ThemeProvider>
            <MemexStateProvider>
              <AppContainer environment={environment}>{children}</AppContainer>
            </MemexStateProvider>
          </ThemeProvider>
        </QueryClientWrapper>
      </MemoryRouter>
      <projects-v2 id="memex-root" />
      <div id="portal-root" />
    </>
  )
}

/**
 * Additional context required for project views.
 */
const getProjectViewComponent = (View: JSX.Element) => {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = () => {
    return (
      <TestAppContainer>
        <AddFieldModalContextProvider>
          <ViewsProvider>{View}</ViewsProvider>
        </AddFieldModalContextProvider>
      </TestAppContainer>
    )
  }

  return wrapper
}

/**
 * Additional context required for insights view.
 */
const getInsightsPageComponent = () => {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = () => {
    return (
      <TestAppContainer>
        <InsightsConfigurationPaneProvider>
          <InsightsLayout>
            <InsightsChartView />
          </InsightsLayout>
        </InsightsConfigurationPaneProvider>
      </TestAppContainer>
    )
  }

  return wrapper
}

/**
 * createTestEnvironment sets up a mock server with
 * basic data for tests.
 *
 * By default, it seeds the server with a single memex, a single view,
 * and the system default columns.
 *
 * Data can be overridden or supplemented by passing in additional
 * JSON island data.
 *
 * @param jsonIslandData - override or supplement the default data
 */
export const createTestEnvironment = (jsonIslandData: Partial<JSONIslandData> = {}) => {
  const views = [viewFactory.build()]

  createMockEnvironment({
    jsonIslandData: {
      'memex-data': buildMemex(),
      'memex-columns-data': buildSystemColumns(),
      'memex-items-data': [],
      'memex-views': views,
      'memex-workflows-data': DefaultWorkflowsPersisted,
      ...jsonIslandData,
    },
  })
}

export type QueryClientInitialData = {
  ['memexItems']?: Array<MemexItemModel>
  /**
   * A query client to use instead of creating a new one. This parameter should be used
   * if a test wants to access the QueryClient for assertions after the code under test
   * has been executed.
   */
  queryClient?: QueryClient
}

export const QueryClientWrapper = ({
  children,
  initialData = {},
}: {
  children?: React.ReactNode
  initialData?: QueryClientInitialData
}) => {
  const [client] = useState(() => initialData.queryClient || createTestQueryClient())
  if (initialData?.memexItems) {
    setMemexItemsQueryDataInQueryClient(client, {
      pages: [
        {
          nodes: initialData.memexItems,
          pageInfo: {hasNextPage: false, hasPreviousPage: false},
          totalCount: {value: initialData.memexItems.length, isApproximate: false},
        },
      ],
      pageParams: [],
    })
  }
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // this behaviour is behind a feature flag in production
        // but we are updating our tests to avoid any "offline mode" usage
        // given these are running within a jsdom environment
        networkMode: 'always',
      },
      mutations: {
        retry: false,
        // this behaviour is behind a feature flag in production
        // but we are updating our tests to avoid any "offline mode" usage
        // given these are running within a jsdom environment
        networkMode: 'always',
      },
    },
  })
}
