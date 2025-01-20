import {expect, type Locator, type Page, type Response} from '@playwright/test'
import type {theme} from '@primer/react'

import type {SortDirection} from '../../client/api/view/contracts'
import {STATUS_UPDATE_ID_PARAM} from '../../client/platform/url'
import type {EnabledFeatures} from '../../mocks/generate-enabled-features-from-url'
import {test} from '../fixtures/test-extended'
import {_} from '../helpers/dom/selectors'
import {getTestEnvironment, getUrl, type StagingPages, TestEnvironment} from '../helpers/environment'
import {CLIENT_FEATURES_URL_PARAM, type ClientFeature} from '../types/enabled-features'
import type {MemexChartConfiguration} from '../types/memex-chart'
import {
  FILTER_QUERY_PARAM,
  HORIZONTAL_GROUPED_BY_COLUMN_KEY,
  ITEM_ID_PARAM,
  PANE_PARAM,
  SLICE_BY_COLUMN_ID_KEY,
  SLICE_VALUE_KEY,
  SORTED_BY_COLUMN_DIRECTION_KEY,
  SORTED_BY_COLUMN_ID_KEY,
  VERTICAL_GROUPED_BY_COLUMN_KEY,
  VIEW_TYPE_PARAM,
  X_AXIS_DATASOURCE_COLUMN_PARAM,
  X_AXIS_GROUP_BY_PARAM,
  Y_AXIS_AGGREGATE_COLUMNS_PARAM,
  Y_AXIS_AGGREGATE_OPERATION_PARAM,
} from '../types/url'
import type {User} from '../types/user'
import type {ViewType} from '../types/view-type'
import {ArchivePage} from './archive-page'
import {AutomationPage} from './automation-page'
import {BasePageView} from './base-page-view'
import {BoardView} from './board-page-view'
import {CommandMenu} from './command-menu'
import {EditOptionDialog} from './edit-option-dialog'
import {Filter} from './filter'
import {InsightsPage} from './insights-page'
import {ManageAccessPage} from './manage-access-page'
import {Omnibar} from './omnibar'
import {Presence} from './presence'
import {ProjectSettingsPage} from './project-settings-page'
import {RoadmapPage} from './roadmap-page'
import {SharedInteractions} from './shared-interactions'
import {SidePanel} from './side-panel'
import {SlicerPanel} from './slicer-panel'
import {Stats} from './stats'
import {StatusUpdates} from './status-updates'
import {TableView} from './table-page-view'
import {Template} from './template'
import {TemplateDialog} from './template-dialog'
import {Theme} from './themes'
import {Toasts} from './toasts'
import {TopBarNavigation} from './top-bar-navigation'
import {ViewOptionsMenu} from './view-options-menu'
import {Views} from './views'

export type NavigateToStoryOptions = {
  features?: Array<ClientFeature>
  serverFeatures?: Partial<{
    [key in EnabledFeatures]: boolean
  }>
  viewerPrivileges?: Partial<{viewerRole: 'write' | 'read' | 'admin'} & {viewerCanChangeProjectVisibility: boolean}>
  viewType?: ViewType
  sortedBy?: {columnId: string | number; direction: SortDirection}
  secondarySortedBy?: {columnId: string | number; direction: SortDirection}
  groupedBy?: {columnId: string | number}
  sliceBy?: {columnId: string | number}
  sliceValue?: string
  verticalGroupedBy?: {columnId: string | number}
  filterQuery?: string
  testIdToAwait?: string
  chartConfiguration?: Partial<MemexChartConfiguration>
  liveUpdatesEnabled?: boolean
  paneState?:
    | {
        pane: 'info' | 'bulk-add'
        statusUpdateId?: number
      }
    | {
        pane: 'item' | 'issue'
        itemId: number
      }
  colorScheme?: keyof typeof theme.colorSchemes
  forceErrorMode?: boolean
  loggedOut?: boolean
}
function ensureValidOptions(options: NavigateToStoryOptions) {
  const hasViewOptions =
    options.viewType || options.sortedBy || options.groupedBy || options.verticalGroupedBy || options.filterQuery

  if (options.chartConfiguration && hasViewOptions) {
    throw new Error('Cannot specify both chartConfiguration and viewOptions')
  }
}
export class MemexApp extends BasePageView {
  tableView: TableView
  boardView: BoardView
  themes: Theme
  template: Template
  presence: Presence
  toasts: Toasts
  viewOptionsMenu: ViewOptionsMenu
  topBarNavigation: TopBarNavigation
  automationPage: AutomationPage
  projectSettingsPage: ProjectSettingsPage
  manageAccessPage: ManageAccessPage
  insightsPage: InsightsPage
  filter: Filter
  omnibar: Omnibar
  sidePanel: SidePanel
  archivePage: ArchivePage
  stats: Stats
  commandMenu: CommandMenu
  templateDialog: TemplateDialog
  views: Views
  roadmapPage: RoadmapPage
  editOptionDialog: EditOptionDialog
  sharedInteractions: SharedInteractions
  slicerPanel: SlicerPanel
  statusUpdates: StatusUpdates

  LOGGED_IN_USER_LOCATOR = this.page.locator('#logged-in-user')
  APP_ROOT = this.page.getByTestId('app-root')

  constructor(page: Page) {
    super(page)
    this.tableView = new TableView(page, this)
    this.boardView = new BoardView(page, this)
    this.themes = new Theme(page, this)
    this.template = new Template(page, this)
    this.presence = new Presence(page, this)
    this.toasts = new Toasts(page, this)
    this.viewOptionsMenu = new ViewOptionsMenu(page, this)
    this.topBarNavigation = new TopBarNavigation(page, this)
    this.automationPage = new AutomationPage(page, this)
    this.projectSettingsPage = new ProjectSettingsPage(page, this)
    this.manageAccessPage = new ManageAccessPage(page, this)
    this.insightsPage = new InsightsPage(page, this)
    this.filter = new Filter(page, this)
    this.omnibar = new Omnibar(page, this)
    this.sidePanel = new SidePanel(page, this)
    this.archivePage = new ArchivePage(page, this)
    this.stats = new Stats(page, this)
    this.commandMenu = new CommandMenu(page, this)
    this.templateDialog = new TemplateDialog(page, this)
    this.views = new Views(page, this)
    this.roadmapPage = new RoadmapPage(page, this)
    this.editOptionDialog = new EditOptionDialog(page, this)
    this.sharedInteractions = new SharedInteractions(page, this)
    this.slicerPanel = new SlicerPanel(page, this)
    this.statusUpdates = new StatusUpdates(page, this)
  }

  /**
   * Navigate the current page to a story for use under tests
   *
   * @param name the story identifier
   * @param options additional application-specific options to setup the page
   */

  async navigateToStory(name: StagingPages, options: NavigateToStoryOptions = {}) {
    ensureValidOptions(options)
    const {
      features = [],
      serverFeatures = {},
      viewerPrivileges = {},
      viewType,
      sortedBy,
      secondarySortedBy,
      groupedBy,
      verticalGroupedBy,
      filterQuery,
      chartConfiguration = {},
      liveUpdatesEnabled = true,
      paneState,
      colorScheme,
      sliceBy,
      sliceValue,
      forceErrorMode,
      loggedOut,
    } = options

    const url = getUrl(name)
    const parsed = new URL(url)
    if (features.length > 0) {
      parsed.searchParams.set(CLIENT_FEATURES_URL_PARAM, features.join(','))
    }
    const overriddenServerFeatures = Object.keys(serverFeatures)
    if (overriddenServerFeatures.length > 0) {
      parsed.searchParams.set(
        '_memex_server_features',
        overriddenServerFeatures.map(feature => `${feature}:${serverFeatures[feature]}`).join(','),
      )
    }

    const overriddenViewerPrivileges = Object.keys(viewerPrivileges)
    if (overriddenViewerPrivileges.length > 0) {
      parsed.searchParams.set(
        '_memex_viewer_privileges',
        overriddenViewerPrivileges.map(privilege => `${privilege}:${viewerPrivileges[privilege]}`).join(','),
      )
    }

    if (forceErrorMode) {
      parsed.searchParams.set('_force_error_mode', '1')
    }

    if (loggedOut) {
      parsed.searchParams.set('_logged_out', '1')
    }

    if (viewType)
      if (viewType) {
        parsed.searchParams.set('layout', viewType)
      }

    if (sortedBy) {
      parsed.searchParams.append(SORTED_BY_COLUMN_ID_KEY, String(sortedBy.columnId))
      parsed.searchParams.append(SORTED_BY_COLUMN_DIRECTION_KEY, sortedBy.direction)

      if (secondarySortedBy) {
        parsed.searchParams.append(SORTED_BY_COLUMN_ID_KEY, String(secondarySortedBy.columnId))
        parsed.searchParams.append(SORTED_BY_COLUMN_DIRECTION_KEY, secondarySortedBy.direction)
      }
    }

    if (groupedBy) {
      parsed.searchParams.append(HORIZONTAL_GROUPED_BY_COLUMN_KEY, String(groupedBy.columnId))
    }

    if (verticalGroupedBy) {
      parsed.searchParams.append(VERTICAL_GROUPED_BY_COLUMN_KEY, String(verticalGroupedBy.columnId))
    }

    if (filterQuery) {
      parsed.searchParams.set('filterQuery', filterQuery)
    }

    if (sliceBy) {
      parsed.searchParams.set(SLICE_BY_COLUMN_ID_KEY, String(sliceBy.columnId))
    }

    if (sliceValue) {
      parsed.searchParams.set(SLICE_VALUE_KEY, sliceValue)
    }

    if (chartConfiguration) {
      if (chartConfiguration.type) {
        parsed.searchParams.set(VIEW_TYPE_PARAM, chartConfiguration.type)
      }
      if (chartConfiguration.filter) {
        parsed.searchParams.set(FILTER_QUERY_PARAM, chartConfiguration.filter)
      }
      if (chartConfiguration.xAxis) {
        parsed.searchParams.set(X_AXIS_DATASOURCE_COLUMN_PARAM, `${chartConfiguration.xAxis.dataSource.column}`)
        if (chartConfiguration.xAxis.groupBy) {
          parsed.searchParams.set(X_AXIS_GROUP_BY_PARAM, `${chartConfiguration.xAxis.groupBy.column}`)
        }
      }
      if (chartConfiguration.yAxis) {
        parsed.searchParams.set(Y_AXIS_AGGREGATE_OPERATION_PARAM, chartConfiguration.yAxis.aggregate.operation)
        if (chartConfiguration.yAxis.aggregate.columns) {
          parsed.searchParams.set(
            Y_AXIS_AGGREGATE_COLUMNS_PARAM,
            JSON.stringify(chartConfiguration.yAxis.aggregate.columns),
          )
        }
      }
    }

    if (paneState) {
      parsed.searchParams.set(PANE_PARAM, paneState.pane)
      if (paneState.pane === 'item' || paneState.pane === 'issue') {
        parsed.searchParams.set(ITEM_ID_PARAM, `${paneState.itemId}`)
      } else if (paneState.pane === 'info' && paneState.statusUpdateId !== undefined) {
        parsed.searchParams.set(STATUS_UPDATE_ID_PARAM, `${paneState.statusUpdateId}`)
      }
    }

    await navigateToGitHubPage(this.page, parsed.toString(), [], options?.testIdToAwait)
    await this.page.emulateMedia({reducedMotion: 'reduce'})
    await this.page.addStyleTag({
      content: `* {
                  -webkit-transition: none !important;
                  -moz-transition: none !important;
                  -o-transition: none !important;
                  -ms-transition: none !important;
                  transition: none !important;
                }`,
    })

    if (colorScheme) {
      await this.page.evaluate(
        opts => {
          document.documentElement.setAttribute('data-color-mode', 'auto')
          document.documentElement.setAttribute('data-light-theme', opts.colorScheme)
          document.documentElement.setAttribute('data-dark-theme', opts.colorScheme)
        },
        {colorScheme},
      )
    }

    await this.#setLiveUpdates({enabled: liveUpdatesEnabled})
  }

  async #setLiveUpdates({enabled}: {enabled: boolean}) {
    await this.page.evaluate(
      ([isEnabled]) => {
        /** 404 page, since it's not "in memex" has no server */
        if (!window.__memexInMemoryServer) return
        window.__memexInMemoryServer.liveUpdatesEnabled = isEnabled
      },
      [enabled],
    )
  }

  async enableLiveUpdates() {
    return this.#setLiveUpdates({enabled: true})
  }

  async disableLiveUpdates() {
    return this.#setLiveUpdates({enabled: false})
  }

  async expectLocatorNotToBeFound(locator: Locator) {
    return expect(locator).toHaveCount(0)
  }

  expectQueryParams(expectedParameters: Array<{name: string; expectedValue: string | null}>) {
    const url = new URL(this.page.url())

    for (const expectedParameter of expectedParameters) {
      const parameterValue = url.searchParams.get(expectedParameter.name)
      expect(parameterValue).toEqual(expectedParameter.expectedValue)
    }
  }

  async getLoggedInUserId(): Promise<number> {
    const loggedInUserId = await this.LOGGED_IN_USER_LOCATOR.textContent()
    const loggedInUser = JSON.parse(loggedInUserId) as Pick<User, 'id' | 'login'>
    return loggedInUser.id
  }
}

function checkStatusCode(response: Response, allowedErrorStatusCodes: Array<number> = []) {
  if (!response) {
    throw new Error('Playwright did not return a response for the page navigation.')
  }
  const responseStatusCode = response?.status() ?? 500
  if (Math.floor(responseStatusCode / 100) >= 4 && allowedErrorStatusCodes.indexOf(responseStatusCode) === -1) {
    switch (responseStatusCode) {
      case 404:
        throw new Error(`Unexpected 404 response. Check the URL: ${response.url()}`)
      case 500:
        throw new Error('Unexpected 500 response. Is the Memex server running?')
      case 502:
        throw new Error('Unexpected 502 response. Is your GitHub server running?')
      default:
        throw new Error(
          `Unexpected status code (${responseStatusCode} loading page. If this was intended, pass [${responseStatusCode}] as the 3rd parameter to checkStatusCode().`,
        )
    }
  }
}

const username = 'monalisa'

async function navigateToGitHubPage(
  page: Page,
  url: string,
  allowedErrorStatusCodes: Array<number> = [],
  testIdToAwait = 'app-root',
) {
  if (page.url() !== 'about:blank') {
    test.fail(true, 'Attempted to navigate to a second story within the same test.')
  }
  checkStatusCode(await page.goto(url), allowedErrorStatusCodes)
  const testEnv = getTestEnvironment()
  if (testEnv === TestEnvironment.Dotcom && page.url().startsWith('http://github.localhost/login')) {
    // We got redirected to a login page. Go ahead and log in.
    await page.keyboard.type(username)
    await page.keyboard.press('Enter')
    await page.waitForNavigation()
    checkStatusCode(await page.goto(url), allowedErrorStatusCodes)
  }

  await page.waitForSelector(_(testIdToAwait))
}
