import {setClientEnvForSsr} from '@github-ui/client-env'
import type {GraphQLHandler, HttpHandler, PathParams} from 'msw'
import {http, HttpResponse, passthrough} from 'msw'

import type {MemexColumn} from '../../client/api/columns/contracts/memex-column'
import type {PaginatedMemexItemsData} from '../../client/api/memex-items/paginated-views'
import type {ViewTypeParam} from '../../client/api/view/contracts'
import {normalizeToFilterName} from '../../client/components/filter-bar/helpers/search-filter'
import type {JSONIslandData} from '../../client/helpers/json-island'
import {
  FILTER_QUERY_PARAM,
  HORIZONTAL_GROUPED_BY_COLUMN_KEY,
  SLICE_BY_COLUMN_ID_KEY,
  SLICE_VALUE_KEY,
  SORTED_BY_COLUMN_DIRECTION_KEY,
  SORTED_BY_COLUMN_ID_KEY,
  VERTICAL_GROUPED_BY_COLUMN_KEY,
  VIEW_TYPE_PARAM,
} from '../../client/platform/url'
import type {ApiMetadataJSONIsland} from '../../client/services/types'
import {mockApiMetadataJsonIsland} from '../data/api-metadata'
import {MemexBaseRefreshEvents, MemexRefreshEvents} from '../data/memex-refresh-events'
import type {MemexItemCollationParams} from '../in-memory-database/memex-items'
import {MockDatabase, type MockDatabaseAsyncData} from '../in-memory-database/mock-database'
import {
  deleteProjectV2WorkflowByNumberResponse,
  getIssuePickerSearchResponse,
  getItemsBlockIssueTypeSuggestionsResponse,
  getItemsBlockLabelSuggestionsResponse,
  getItemsBlockMilestoneSuggestionsResponse,
  getRepositoryPickerCurrentRepoResponse,
  getRepositoryPickerTopRepositoriesResponse,
} from '../mock-data'
import {mockMemexAliveConfig} from '../socket-message'
import type {BaseController} from './base-controller'
import {ChartsController} from './charts-controller'
import {ColumnsController} from './columns-controller'
import {FailbotController} from './failbot-controller'
import {getPersistedQueryName} from './get-persisted-query-name'
import {JobStatusController} from './jobs-status-controller'
import {LiveUpdatesController} from './live-update-controller'
import {MarkdownController} from './markdown-controller'
import {MemexItemsController} from './memex-items-controller'
import {MemexesController} from './memexes-controller'
import {MigrationController} from './migration-controller'
import {NotificationsSubscriptionsController} from './notifications-subscriptions-controller'
import {buildPaginatedGroups, buildSlices, sliceNodesAndBuildPageInfo} from './pagination'
import {RepositoriesController} from './repositories-controller'
import {SidePanelController} from './side-panel-controller'
import {StatsController} from './stats-controller'
import {StatusesController} from './statuses-controller'
import {UserNoticesController} from './user-noices-controller'
import {ViewsController} from './views-controller'
import {WorkflowsController} from './workflows-controller'

export type ServerUrlData = {
  viewNumber?: number
  queryParams?: {
    [FILTER_QUERY_PARAM]: string | null
    [SORTED_BY_COLUMN_DIRECTION_KEY]: Array<string>
    [SORTED_BY_COLUMN_ID_KEY]: Array<string>
    [HORIZONTAL_GROUPED_BY_COLUMN_KEY]: string | null
    [VERTICAL_GROUPED_BY_COLUMN_KEY]: string | null
    [SLICE_BY_COLUMN_ID_KEY]: string | null
    [SLICE_VALUE_KEY]: string | null
    [VIEW_TYPE_PARAM]: string | null
  }
}

type MockServerData = MockDatabaseAsyncData & {
  jsonIslandData: Partial<JSONIslandData>
  sleepMs?: number
  enableRedaction?: boolean
}

declare global {
  interface Window {
    __memexInMemoryServer: MockServer
  }
}

export class MockServer {
  public declare db: MockDatabase
  public declare memexes: MemexesController
  public declare memexItems: MemexItemsController
  public declare views: ViewsController
  public declare columns: ColumnsController
  public declare repositories: RepositoriesController
  public declare workflows: WorkflowsController
  public declare stats: StatsController
  public declare charts: ChartsController
  public declare liveUpdate: LiveUpdatesController
  public declare markdown: MarkdownController
  public declare migration: MigrationController
  public declare sidePanel: SidePanelController
  public declare jobStatus: JobStatusController
  public declare failbot: FailbotController
  public declare enableRedaction: boolean
  public declare statuses: StatusesController
  public declare notificationsSubscriptions: NotificationsSubscriptionsController
  public declare userNotices: UserNoticesController

  public declare sleepMs: MockServerData['sleepMs']
  public liveUpdatesEnabled = true
  public handlers: Array<HttpHandler | GraphQLHandler> = []
  public errorHandlers: Array<HttpHandler | GraphQLHandler> = []

  private declare jsonIslandData: MockServerData['jsonIslandData']

  constructor({sleepMs = 0, jsonIslandData, enableRedaction = false, ...serverData}: MockServerData) {
    this.db = new MockDatabase({
      memex: jsonIslandData['memex-data'],
      memexItems: jsonIslandData['memex-items-data'],
      columns: jsonIslandData['memex-columns-data'],
      workflows: jsonIslandData['memex-workflows-data'],
      views: jsonIslandData['memex-views'],
      charts: jsonIslandData['memex-charts-data'],
      ...serverData,
    })

    this.jsonIslandData = jsonIslandData
    this.enableRedaction = enableRedaction

    this.memexes = new MemexesController(this.db, this)
    this.views = new ViewsController(this.db, this)
    this.memexItems = new MemexItemsController(this.db, this)
    this.columns = new ColumnsController(this.db, this)
    this.repositories = new RepositoriesController(this.db, this)
    this.workflows = new WorkflowsController(this.db, this)
    this.stats = new StatsController(this.db, this)
    this.charts = new ChartsController(this.db, this)
    this.liveUpdate = new LiveUpdatesController(this.db, this)
    this.markdown = new MarkdownController(this.db, this)
    this.migration = new MigrationController(this.db, this)
    this.sidePanel = new SidePanelController(this.db, this)
    this.jobStatus = new JobStatusController(this.db, this)
    this.failbot = new FailbotController(this.db, this)
    this.statuses = new StatusesController(this.db, this)
    this.notificationsSubscriptions = new NotificationsSubscriptionsController(this.db, this)
    this.userNotices = new UserNoticesController(this.db, this)

    this.sleepMs = sleepMs

    this.#registerControllerRequestHandlers(
      this.failbot,
      this.views,
      this.stats,
      this.repositories,
      this.charts,
      this.columns,
      this.workflows,
      this.memexItems,
      this.memexes,
      this.repositories,
      this.liveUpdate,
      this.markdown,
      this.migration,
      this.sidePanel,
      this.jobStatus,
      this.statuses,
      this.notificationsSubscriptions,
      this.userNotices,
    )

    window.__memexInMemoryServer = this
  }

  #registerControllerRequestHandlers(...controllers: Array<BaseController>) {
    for (const controller of controllers) {
      if (controller.handlers) {
        this.handlers.push(...controller.handlers)
      }
      if (controller.errorHandlers) {
        this.errorHandlers.push(...controller.errorHandlers)
      }
    }

    /**
     * Ensure we passthrough any asset checks that we haven't handled already to the
     * dev server
     */
    for (const extension of [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'svg',
      'js',
      'js.map',
      'json',
      'css',
      'css.map',
      'ico',
      'mp4',
    ]) {
      this.handlers.push(http.get(`*.${extension}`, passthrough))
    }

    const baseUrl = process.env.APP_ENV === 'staging' || process.env.APP_ENV === 'development' ? '' : 'http://memex.dev'

    this.handlers.push(
      http.get(`${baseUrl}/_graphql`, async ({request}): Promise<Response> => {
        const body = new URL(request.url).searchParams.get('body')
        if (!body) {
          return HttpResponse.json({
            errors: {
              message: 'No body provided',
            },
          })
        }

        const queryId = JSON.parse(body).query as string | undefined
        const queryName = getPersistedQueryName(queryId)

        if (queryName === 'searchInputLabelSuggestionsQuery') {
          return HttpResponse.json(getItemsBlockLabelSuggestionsResponse)
        }

        if (queryName === 'searchInputMilestoneSuggestionsQuery') {
          return HttpResponse.json(getItemsBlockMilestoneSuggestionsResponse)
        }

        if (queryName === 'searchInputIssueTypeSuggestionsQuery') {
          return HttpResponse.json(getItemsBlockIssueTypeSuggestionsResponse)
        }

        if (queryName === 'RepositoryPickerTopRepositoriesQuery') {
          return HttpResponse.json(getRepositoryPickerTopRepositoriesResponse)
        }

        if (queryName === 'RepositoryPickerCurrentRepoQuery') {
          return HttpResponse.json(getRepositoryPickerCurrentRepoResponse)
        }

        if (queryName === 'IssuePickerSearchQuery') {
          return HttpResponse.json(getIssuePickerSearchResponse)
        }

        return HttpResponse.json({
          data: {
            viewer: {
              id: '452a3df3ffdb2525f9563b07bdbef0f3',
              topRepositories: {
                edges: [
                  {
                    // totally made up for now to avoid errors in parsing
                    node: {
                      id: 'MDEwOlJlcG9zaXRvcnkyMjEyMzg3MTA=',
                      databaseId: 221238710,
                      name: 'memex',
                      owner: {
                        id: 'a87ff679a2f3e71d9181a67b7542122c',
                        __typename: 'Organization',
                        login: 'github',
                      },
                      isPrivate: true,
                      isArchived: false,
                      slashCommandsEnabled: true,
                      viewerIssueCreationPermissions: {
                        labelable: true,
                        milestoneable: true,
                        assignable: true,
                        triageable: true,
                        typeable: true,
                      },
                    },
                  },
                ],
              },
            },
            repository: {
              id: 'MDEwOlJlcG9zaXRvcnkyMjEyMzg3MTA=',
              databaseId: 221238710,
              name: 'memex',
              nameWithOwner: 'github/memex',
              owner: {
                id: 'a87ff679a2f3e71d9181a67b7542122c',
                __typename: 'Organization',
                login: 'github',
              },
              isBlankIssuesEnabled: true,
              isSecurityPolicyEnabled: false,
              hasIssuesEnabled: true,
            },
          },
        })
      }),
    )

    this.handlers.push(
      http.post<PathParams, {query: string | undefined}>(`${baseUrl}/_graphql`, async ({request}) => {
        const body = await request.json()

        if (!body) {
          return HttpResponse.json({
            errors: {
              message: 'No body provided',
            },
          })
        }

        const queryId = body.query

        // TODO - Figure out how to map the id to the name
        // We cannot use the persisted query approach for mutations
        if (queryId === '2450a4a64f1dc63de57eacac2fcd3f9f') {
          return HttpResponse.json(deleteProjectV2WorkflowByNumberResponse)
        }
      }),
    )
  }

  public sleep(overrideMs?: number) {
    return new Promise(resolve => setTimeout(resolve, overrideMs ?? this.sleepMs))
  }

  /**
   * Theme variables are set based on
   * the dataset properties of the document element.
   */
  #updateDocumentHeadForTheme() {
    document.documentElement.setAttribute('data-color-mode', this.jsonIslandData['theme-preferences']?.mode ?? 'auto')
    document.documentElement.setAttribute(
      'data-light-theme',
      this.jsonIslandData['theme-preferences']?.light ?? 'light',
    )
    document.documentElement.setAttribute('data-dark-theme', this.jsonIslandData['theme-preferences']?.dark ?? 'dark')
  }

  /**
   * Mirror the JSONISland data from
   * gh/gh#app/views/memexes/show.html.erb
   */
  #memexesShowJSONIslandData(urlData?: ServerUrlData) {
    const enabledFeatures = this.jsonIslandData['memex-enabled-features']
    const memexData = this.db.memexes.get()
    seedJSONIsland('memex-data', memexData)
    seedJSONIsland('logged-in-user', this.jsonIslandData['logged-in-user'])
    if (enabledFeatures?.indexOf('memex_table_without_limits') !== -1) {
      seedJSONIsland('memex-paginated-items-data', buildPaginatedItemsJsonIsland(this.db, urlData))
    } else {
      seedJSONIsland('memex-items-data', this.db.memexItems.getActive())
    }
    seedJSONIsland('memex-viewer-privileges', this.jsonIslandData['memex-viewer-privileges'])
    seedJSONIsland('memex-consistency-metrics-data', this.jsonIslandData['memex-consistency-metrics-data'])
    seedJSONIsland('memex-columns-data', this.db.columns.all())
    seedJSONIsland('memex-workflow-configurations-data', this.jsonIslandData['memex-workflow-configurations-data'])
    seedJSONIsland('memex-workflows-data', this.db.workflows.all())
    seedJSONIsland('memex-enabled-features', enabledFeatures)
    seedJSONIsland('memex-feedback', {
      url: 'https://github.com/github/feedback/discussions/categories/issues-feedback',
      issue_viewer_url: 'https://github.com/github/feedback/discussions/categories/issues-feedback',
      pwl_beta_url: 'https://github.com/github/feedback/discussions/categories/issues-feedback',
    })
    seedJSONIsland('archive-alpha-feedback', {
      url: 'https://github.com/github/engineering/discussions/3051',
    })
    seedJSONIsland('reserved-column-names', this.jsonIslandData['reserved-column-names'] ?? ['reserved-column-name'])
    seedJSONIsland('theme-preferences', this.jsonIslandData['theme-preferences'])
    seedJSONIsland('media-urls', {
      projectTemplateDialog: {
        templateDark: '',
        templateLight: '',
        boardDark: '/assets/templates/memex-templates-board-dark.png',
        boardLight: '/assets/templates/memex-templates-board-light.png',
        tableDark: '/assets/templates/memex-templates-table-dark.png',
        tableLight: '/assets/templates/memex-templates-table-light.png',
        featureDark: '/assets/templates/memex-templates-feature-dark.png',
        featureLight: '/assets/templates/memex-templates-feature-light.png',
        backlogDark: '/assets/templates/memex-templates-team-backlog-dark.png',
        backlogLight: '/assets/templates/memex-templates-team-backlog-light.png',
        roadmapDark: '/assets/templates/memex-templates-roadmap-dark.png',
        roadmapLight: '/assets/templates/memex-templates-roadmap-light.png',
      },
      insightsChartLimitDialog: {
        bannerDark: '/assets/insights-chart-limit-dialog/insights-chart-limit-dialog-banner-dark.png',
        bannerLight: '/assets/insights-chart-limit-dialog/insights-chart-limit-dialog-banner-light.png',
      },
      issueTypes: {
        popoverDark: '/assets/issue-types/memex-issue-types-popover-dark.png',
        popoverLight: '/assets/issue-types/memex-issue-types-popover-light.png',
        demoDark: '/assets/issue-types/memex-issue-types-demo.mp4',
        demoLight: '/assets/issue-types/memex-issue-types-demo.mp4',
        announcementDark: '/assets/issue-types/memex-issue-types-announcement-dark.png',
        announcementLight: '/assets/issue-types/memex-issue-types-announcement-light.png',
      },
    })
    if (this.jsonIslandData['memex-creator']) {
      seedJSONIsland('memex-creator', this.jsonIslandData['memex-creator'])
    }
    seedJSONIsland('memex-owner', this.jsonIslandData['memex-owner'])
    seedJSONIsland('github-runtime', this.jsonIslandData['github-runtime'])
    seedJSONIsland('github-billing-enabled', this.jsonIslandData['github-billing-enabled'])
    seedJSONIsland('github-url', this.jsonIslandData['github-url'])
    seedJSONIsland('memex-alive', mockMemexAliveConfig)
    if (enabledFeatures?.indexOf('memex_table_without_limits') !== -1) {
      seedJSONIsland('memex-refresh-events', Object.values(MemexBaseRefreshEvents))
    } else {
      seedJSONIsland('memex-refresh-events', Object.values(MemexRefreshEvents))
    }
    seedJSONIsland('memex-limits', this.jsonIslandData['memex-limits'])
    const views = this.db.views.all()
    seedJSONIsland('memex-relay-ids', {memexProject: 'PVT_1234'})
    seedJSONIsland('memex-views', views)

    seedJSONIsland('memex-charts-data', this.db.charts.all())

    seedJSONIsland('memex-templates', this.jsonIslandData['memex-templates'])

    seedJSONIsland('latest-memex-project-status', this.statuses.getLatestitem())

    if (this.jsonIslandData['memex-system-templates']) {
      seedJSONIsland('memex-system-templates', this.jsonIslandData['memex-system-templates'])
    }

    if (this.jsonIslandData['created-with-template-memex']) {
      seedJSONIsland('created-with-template-memex', this.jsonIslandData['created-with-template-memex'])
    }

    seedJSONIsland('memex-user-notices', this.jsonIslandData['memex-user-notices'])

    seedJSONIsland('memex-service', this.jsonIslandData['memex-service'])

    let key: keyof ApiMetadataJSONIsland

    for (key in mockApiMetadataJsonIsland) {
      const value = mockApiMetadataJsonIsland[key]
      seedJSONIsland(key, value)
    }
  }

  /**
   * The client environment needs to be set in order for non-Memex components to use client side feature flags
   */
  #prepareClientEnvironment() {
    setClientEnvForSsr({locale: 'en', featureFlags: []})
  }

  #updateDocumentHeadForFailbot() {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'browser-errors-url')
    meta.content = this.failbot.errorsUrl.toString()
    document.head.appendChild(meta)
  }

  /**
   * Seed JSON Island Metadata for new or created memex
   *
   * Duplication between these is intentional, as this should
   * 1-1 mirror the files in dotcom
   */
  public seedJSONIslandData(urlData?: ServerUrlData) {
    this.#prepareClientEnvironment()
    this.#updateDocumentHeadForFailbot()
    this.#updateDocumentHeadForTheme()
    return this.#memexesShowJSONIslandData(urlData)
  }
}

function buildPaginatedItemsJsonIsland(db: MockDatabase, urlData?: ServerUrlData): PaginatedMemexItemsData {
  let collationParams: MemexItemCollationParams | undefined = undefined
  let horizontalGroupedColumnId: number | undefined = undefined
  let verticalGroupedColumnId: number | undefined = undefined
  let sliceByColumnId: number | undefined = undefined
  let sliceByValue: string | undefined
  let viewType: ViewTypeParam | undefined = undefined
  if (urlData) {
    collationParams = {
      columns: db.columns.all(),
    }
    const view = db.views.all().find(v => v.number === urlData.viewNumber) || db.views.all()[0]
    if (view) {
      collationParams.q = view.filter || undefined
      collationParams.sortedBy = view.sortBy.map(viewSort => ({columnId: viewSort[0], direction: viewSort[1]}))
      horizontalGroupedColumnId = view.groupBy[0]
      sliceByColumnId = view.sliceBy?.field
      verticalGroupedColumnId = view.verticalGroupBy[0]
      viewType = view.layout
    }
    if (urlData.queryParams) {
      const {
        [FILTER_QUERY_PARAM]: q,
        [SORTED_BY_COLUMN_ID_KEY]: sortedByColumnId,
        [SORTED_BY_COLUMN_DIRECTION_KEY]: sortedByDirection,
        [HORIZONTAL_GROUPED_BY_COLUMN_KEY]: horizontalGroupedColumnIdString,
        [VERTICAL_GROUPED_BY_COLUMN_KEY]: verticalGroupedColumnIdString,
        [SLICE_BY_COLUMN_ID_KEY]: sliceByColumnIdString,
        [SLICE_VALUE_KEY]: sliceByValueQueryParam,
        [VIEW_TYPE_PARAM]: viewTypeString,
      } = urlData.queryParams
      if (q != null) {
        collationParams.q = q
      }
      if (sortedByColumnId.length && sortedByColumnId.length === sortedByDirection.length) {
        const sortedBy: Array<{columnId: number; direction: 'asc' | 'desc'}> | undefined = []
        for (let i = 0; i < sortedByColumnId.length; i++) {
          const columnId = db.columns.bySyntheticIdString(sortedByColumnId[i] || '').databaseId
          // Explicitly narrow down to 'desc' or 'asc'
          const direction = sortedByDirection[i] === 'desc' ? 'desc' : 'asc'
          sortedBy.push({columnId, direction})
        }
        collationParams.sortedBy = sortedBy
      }

      if (horizontalGroupedColumnIdString) {
        horizontalGroupedColumnId = db.columns.bySyntheticIdString(horizontalGroupedColumnIdString).databaseId
      }
      if (verticalGroupedColumnIdString) {
        verticalGroupedColumnId = db.columns.bySyntheticIdString(verticalGroupedColumnIdString).databaseId
      }
      if (sliceByColumnIdString) {
        sliceByColumnId = db.columns.bySyntheticIdString(sliceByColumnIdString).databaseId
      }
      if (sliceByValueQueryParam) {
        sliceByValue = sliceByValueQueryParam
      }
      if (viewTypeString === 'board') {
        viewType = 'board_layout'
      }
    }
  }

  let ungroupedItems = db.memexItems.getActive(collationParams)
  // For slicing, we want to always have access to the presliced set of data,
  // so that we can use it to compute the slices themselves
  const ungroupedItemsPresliced = [...ungroupedItems]

  const sliceByColumn =
    sliceByColumnId != null ? db.columns.all().find(c => c.databaseId === sliceByColumnId) : undefined

  if (sliceByColumn && sliceByValue && collationParams) {
    const normalizedFieldName = normalizeToFilterName(sliceByColumn.name)
    const query = sliceByValue === '_noValue' ? `no:${normalizedFieldName}` : `${normalizedFieldName}:"${sliceByValue}"`
    // refilter the items with a sliceValue included
    ungroupedItems = db.memexItems.collateItems(ungroupedItems, {
      ...collationParams,
      q: query,
    })
  }

  const slices = sliceByColumn ? buildSlices(ungroupedItemsPresliced, sliceByColumn) : undefined

  if (viewType === 'board_layout' && verticalGroupedColumnId == null) {
    verticalGroupedColumnId = db.columns.bySyntheticIdString('Status').databaseId
  }

  const groupFields = getColumnsForPaginatedGroups(db, horizontalGroupedColumnId, verticalGroupedColumnId, viewType)

  if (groupFields) {
    return buildPaginatedGroups({ungroupedItems, slices, ...groupFields})
  }

  const {nodes, pageInfo} = sliceNodesAndBuildPageInfo(ungroupedItems, undefined, undefined, 250)

  return {
    nodes,
    pageInfo,
    totalCount: {
      value: ungroupedItems.length,
      isApproximate: false,
    },
    slices,
  }
}

function getColumnsForPaginatedGroups(
  db: MockDatabase,
  horizontalGroupedColumnId: number | undefined,
  verticalGroupedColumnId: number | undefined,
  viewType: ViewTypeParam | undefined,
): {field: MemexColumn; secondaryField?: MemexColumn} | undefined {
  if (viewType === 'board_layout') {
    // For a board view, the primary column will be vertical
    const field = db.columns.all().find(c => c.databaseId === verticalGroupedColumnId)
    if (field) {
      // For the board view, if we have a primary vertical column, we can attempt to use a
      // horizontal column as the secondary column for swimlanes
      const secondaryField = horizontalGroupedColumnId
        ? db.columns.all().find(c => c.databaseId === horizontalGroupedColumnId)
        : undefined
      return {field, secondaryField}
    }
    return undefined
  }

  // Otherwise, the primary column is horizontal, and we want to ignore a vertical column
  const field = db.columns.all().find(c => c.databaseId === horizontalGroupedColumnId)

  if (field) {
    return {field}
  }
  return undefined
}

/**
 * Seed a JSON island—appending it to the DOM or replacing it if it already
 * exists.
 *
 * @param key The ID of the JSON island
 * @param value The data to place in the JSON island
 */
export function seedJSONIsland<TIslandDataKey extends keyof JSONIslandData>(
  key: TIslandDataKey,
  value: JSONIslandData[TIslandDataKey] | undefined,
): void {
  // eslint-disable-next-line github/no-dynamic-script-tag
  const script = document.createElement('script')
  script.setAttribute('type', 'application/json')
  script.setAttribute('id', key)
  script.textContent = JSON.stringify(value)
  const existingNode = document.getElementById(key)
  if (existingNode) {
    document.body.replaceChild(script, existingNode)
  } else {
    document.body.appendChild(script)
  }
}
