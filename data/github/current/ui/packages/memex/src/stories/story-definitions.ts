import {randPhrase} from '@ngneat/falso'
import {subDays} from 'date-fns'
import invariant from 'tiny-invariant'

import {type MemexColumn, MemexColumnDataType, SystemColumnId} from '../client/api/columns/contracts/memex-column'
import {type CustomTemplate, type Privileges, Role} from '../client/api/common-contracts'
import type {CreatedWithTemplateMemex} from '../client/api/created-with-template-memex/api'
import type {Memex, MemexStatus, SystemTemplate} from '../client/api/memex/contracts'
import type {MemexItem} from '../client/api/memex-items/contracts'
import type {SuggestedRepository} from '../client/api/repository/contracts'
import type {UserNotice} from '../client/api/user-notices/contracts'
import {type PageView, RoadmapZoomLevel, ViewTypeParam} from '../client/api/view/contracts'
import type {ThemeProviderPropsOverride} from '../client/helpers/color-modes'
import type {LoggedInUser, Runtime} from '../client/helpers/json-island'
import {not_typesafe_nonNullAssertion} from '../client/helpers/non-null-assertion'
import type {ViewType} from '../client/helpers/view-type'
import {overrideDefaultPrivileges} from '../client/helpers/viewer-privileges'
import {
  PROJECT_ARCHIVE_ROUTE,
  PROJECT_INSIGHTS_ROUTE,
  PROJECT_ROUTE,
  PROJECT_SETTINGS_ACCESS_ROUTE,
  PROJECT_SETTINGS_FIELD_ROUTE,
  PROJECT_SETTINGS_ROUTE,
  PROJECT_VIEW_ROUTE,
  PROJECT_WORKFLOWS_ROUTE,
} from '../client/routes'
import {assigneesColumn, endDateColumn, startDateColumn, titleColumn} from '../mocks/data/columns'
import {generateItems} from '../mocks/data/generated'
import {CustomTemplateMemex, DateMemex, DefaultMemex, EmptyMemex, ReadonlyMemex} from '../mocks/data/memexes'
import {mockUsers} from '../mocks/data/users'
import {autoFillViewServerProps, createView} from '../mocks/data/views'
import {
  DefaultClosedIssue,
  DefaultClosedPullRequest,
  DefaultDraftIssue,
  DefaultDraftPullRequest,
  DefaultMergedPullRequest,
  DefaultOpenIssue,
  DefaultOpenPullRequest,
  DefaultRedactedItem,
} from '../mocks/memex-items'
import {DateDemoColumns, DefaultColumns, RoadmapTestColumns} from '../mocks/mock-data'
import {mockEmitMessageOnChannel} from '../mocks/socket-message'
import {DueDateItems, InitialItems} from './data-source'
import {
  allItemsHaveMilestonesData,
  getMWLData,
  getSavedViewsInitialData,
  P_50_REACT_PROFILER_ID,
  p50Data,
  p99Data,
  withArchivedItemsData,
  withCustomAssigneeData,
  withCustomItemsData,
  withCustomMilestoneData,
  withInsightsData,
  withItemsData,
  withItemsWithoutMilestonesData,
  withIterationFieldData,
  withNewProject,
  withOnlyTitleColumnData,
  withPartialItemsData,
  withReasonFieldData,
  withRoadmapData,
  withStatusUpdateData,
  withSubIssuesData,
  withTitleColumnHidden,
  withTrackedByFieldData,
  withXssTestColumnData,
} from './helpers/test-data'

const inconsistencyThreshold = 0.95

const AllSystemVisibleColumns = DefaultColumns.map(col => {
  return {...col, visible: true}
})

export type StoryDefinition = {
  name: string
  initialMemex?: Memex
  initialItems?: Array<MemexItem>
  initialColumns?: Array<MemexColumn>
  initialViews?: Array<PageView>
  enableErrorMode?: boolean
  viewerPrivileges?: Privileges
  initialViewType?: ViewType
  profilerId?: string
  projectNumber: number | 'new'
  projectLimits?: {
    projectItemLimit?: number
    projectItemArchiveLimit?: number
    singleSelectColumnOptionsLimit?: number
    limitedChartsLimit?: number
    viewsLimit?: number
  }
  ownerType: 'orgs' | 'users'
  ownerIdentifier: string
  generateFullPath?: (
    /** passes through story definition properties that are used in generating a pathname */
    storyPathArgs: Pick<StoryDefinition, 'ownerType' | 'ownerIdentifier' | 'projectNumber'>,
  ) => string
  showDefaultPresence: boolean
  loggedInUser?: LoggedInUser
  /**
   * Any interaction with the dom should
   * ensure the element is rendered first,
   * potentially using {@link import('./helpers/wait-for-element').waitForElement}
   */
  afterPageLoad?: (window: Window) => void
  forceRenderError?: boolean
  themeProps?: Partial<ThemeProviderPropsOverride>
  sleepMs?: number
  memexTemplates?: string
  memexSystemTemplates?: Array<SystemTemplate>
  organizationTemplates?: Array<CustomTemplate>
  suggestedRepositories?: Array<SuggestedRepository>
  enableRedaction?: boolean
  githubRuntime?: Runtime
  githubBillingEnabled?: boolean
  memexAutomationEnabled?: boolean
  createdWithTemplateMemex?: CreatedWithTemplateMemex
  statuses?: Array<MemexStatus>
  userNotices?: Array<UserNotice>
}

/**
 * Stories are identified by their ownerType, ownerIdentifier and projectNumber combination.
 */
export function getStoryId(story: {ownerType?: string; ownerIdentifier?: string; projectNumber?: number | string}) {
  if (!story.ownerType || !story.ownerIdentifier || !story.projectNumber) throw new Error('invalid path params')
  return `${story.ownerType}|${story.ownerIdentifier}|${story.projectNumber}`
}

/**
 * Given a story definition,
 * returns the _full_ pathname, including
 * the base path
 */
export function getStoryFullPathname({
  generateFullPath = PROJECT_ROUTE.generateFullPath,
  ...storyParams
}: StoryDefinition) {
  const searchParams = new URLSearchParams()
  if (storyParams.initialViewType) {
    searchParams.set('layout', storyParams.initialViewType)
  }

  const search = searchParams.toString()

  let pathname = generateFullPath({
    ownerIdentifier: storyParams.ownerIdentifier,
    ownerType: storyParams.ownerType,
    projectNumber: storyParams.projectNumber,
  })

  if (!PROJECT_ROUTE.matchFullPathOrChildPaths(pathname)) {
    throw new Error(
      `Error generating story details for story "${storyParams.name}". Pathname: "${pathname}" should be nested under "${PROJECT_ROUTE.fullPath}". Are you calling generatePath instead of generateFullPath?`,
    )
  }

  if (search) {
    pathname += `?${search}`
  }

  return pathname
}

function convertToMap(storyDefinitions: Array<StoryDefinition>) {
  return storyDefinitions.reduce(
    (map, story) => {
      map[getStoryId(story)] = story
      return map
    },
    {} as {[id: string]: StoryDefinition},
  )
}

export const appStoryDefinitions: Array<StoryDefinition> = [
  {
    name: 'With Items As App',
    initialItems: InitialItems,
    projectNumber: 1,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[17],
    initialMemex: {
      ...DefaultMemex,
      consistency: 96,
      inconsistencyThreshold,
    },
  },

  {
    name: 'User owned',
    initialItems: InitialItems,
    initialMemex: {
      ...DefaultMemex,
      title: 'Monalisa owned memex',
    },

    projectNumber: 1,
    ownerType: 'users',
    ownerIdentifier: 'monalisa',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Board View',
    initialItems: [DefaultDraftIssue, ...InitialItems],
    initialViews: autoFillViewServerProps([
      createView({
        name: 'Project Board',
        filter: '',
        layout: ViewTypeParam.Board,
        groupBy: [],
        verticalGroupBy: [],
        sortBy: [],
        priority: null,
        visibleFields: DefaultColumns.filter(c => c.defaultColumn).map(c => c.databaseId),
        aggregationSettings: {
          hideItemsCount: false,
          sum: [],
        },
        layoutSettings: {},
        sliceBy: {},
        sliceValue: null,
      }),
    ]),

    projectNumber: 2,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Board View With Lots Of Items',
    initialItems: generateItems({count: 1000, columns: DefaultColumns}),
    initialViews: autoFillViewServerProps([
      createView({
        name: 'Project Board',
        filter: '',
        layout: ViewTypeParam.Board,
        groupBy: [],
        verticalGroupBy: [],
        sortBy: [],
        priority: null,
        visibleFields: DefaultColumns.filter(c => c.defaultColumn).map(c => c.databaseId),
        aggregationSettings: {
          hideItemsCount: false,
          sum: [],
        },
        layoutSettings: {},
        sliceBy: {},
        sliceValue: null,
      }),
    ]),

    projectNumber: 3,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Roadmap View',
    initialItems: withRoadmapData.items,
    initialColumns: withRoadmapData.columns,
    initialViews: autoFillViewServerProps([
      createView({
        name: 'Roadmap',
        filter: '',
        layout: ViewTypeParam.Roadmap,
        groupBy: [],
        verticalGroupBy: [],
        sortBy: [],
        priority: null,
        visibleFields: [
          ...RoadmapTestColumns.filter(c => c.defaultColumn).map(c => c.databaseId),
          not_typesafe_nonNullAssertion(RoadmapTestColumns.find(c => c.id === SystemColumnId.Milestone)).databaseId,
        ],
        aggregationSettings: {
          hideItemsCount: false,
          sum: [],
        },
        layoutSettings: {
          roadmap: {
            dateFields: [startDateColumn.databaseId, endDateColumn.databaseId],
            zoomLevel: RoadmapZoomLevel.Month,
          },
        },
        sliceBy: {},
        sliceValue: null,
      }),
    ]),

    projectNumber: 200,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'With Lots Of Items',
    initialItems: generateItems({count: 1000, columns: DefaultColumns}),
    projectNumber: 4,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    initialMemex: {
      ...DefaultMemex,
      consistency: 86,
      inconsistencyThreshold,
    },
  },

  {
    name: 'Date Column',
    initialItems: DueDateItems,
    initialMemex: DateMemex,
    initialColumns: DateDemoColumns,
    projectNumber: 5,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'All System Columns Visible',
    initialItems: [
      DefaultDraftIssue,
      DefaultOpenIssue,
      DefaultClosedIssue,
      DefaultOpenPullRequest,
      DefaultClosedPullRequest,
      DefaultMergedPullRequest,
      DefaultDraftPullRequest,
      DefaultRedactedItem,
    ],

    initialColumns: AllSystemVisibleColumns,
    projectNumber: 6,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Iteration Field Demo',
    initialItems: withIterationFieldData.items,
    initialColumns: withIterationFieldData.columns,
    initialViews: withIterationFieldData.views,
    initialMemex: {
      id: 1,
      number: 1,
      title: 'Iteration Planning',
      public: false,
      closedAt: null,
      isTemplate: false,
    },
    projectNumber: 7,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[17],
  },

  {
    name: 'Reason ambivalent Field Demo',
    initialItems: withReasonFieldData.items,
    initialColumns: withReasonFieldData.columns,
    initialViews: withReasonFieldData.views,
    initialMemex: {
      id: 1,
      number: 1,
      title: 'Reason is a vague field',
      public: false,
      closedAt: null,
      isTemplate: false,
    },
    projectNumber: 8,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Tracked by Field Demo',
    initialItems: withTrackedByFieldData.items,
    initialColumns: withTrackedByFieldData.columns,
    initialViews: withTrackedByFieldData.views,
    initialMemex: {
      id: 1,
      number: 1,
      title: 'Tracked by field',
      public: false,
      closedAt: null,
      isTemplate: false,
    },
    projectNumber: 9,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[0],
  },

  {
    name: 'Empty user owned',
    memexTemplates: 'true',
    initialMemex: EmptyMemex,
    projectNumber: 101,
    ownerType: 'users',
    ownerIdentifier: 'monalisa',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Empty',
    initialMemex: EmptyMemex,
    projectNumber: 100,
    ownerType: 'orgs',
    ownerIdentifier: 'app',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },
]

const savedViewsData = getSavedViewsInitialData()
const mwlData = getMWLData()

export const integrationTestStoryDefinitions: Array<StoryDefinition> = [
  {
    name: 'Empty',
    initialMemex: EmptyMemex,
    projectNumber: 100,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    initialColumns: withNewProject.columns,
    initialItems: withNewProject.items,
    initialViews: withNewProject.views,
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[0],
    memexTemplates: 'true',
  },

  {
    name: 'With Items',
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    projectNumber: 1,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[1],
  },

  {
    name: 'With Custom Items',
    initialItems: withCustomItemsData.items,
    initialColumns: withCustomItemsData.columns,
    initialViews: withCustomItemsData.views,
    projectNumber: 2,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[1],
  },

  {
    name: 'P 50 Experience',
    initialItems: p50Data.items,
    initialColumns: p50Data.columns,
    initialViews: p50Data.views,
    profilerId: P_50_REACT_PROFILER_ID,
    projectNumber: 3,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[1],
  },

  {
    name: 'P 99 Experience',
    initialItems: p99Data.items,
    initialColumns: p99Data.columns,
    initialViews: p99Data.views,
    projectNumber: 4,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Paginated Data',
    initialItems: mwlData.items,
    initialColumns: mwlData.columns,
    initialViews: mwlData.views,
    projectNumber: 400,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'In Error Mode',
    initialItems: withItemsData.items,
    enableErrorMode: true,
    projectNumber: 5,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'With Hidden Title Column',
    initialItems: withTitleColumnHidden.items,
    initialColumns: withTitleColumnHidden.columns,
    initialViews: withTitleColumnHidden.views,
    projectNumber: 6,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'With Only Title Column',
    initialItems: withOnlyTitleColumnData.items,
    initialColumns: withOnlyTitleColumnData.columns,
    initialViews: withOnlyTitleColumnData.views,
    projectNumber: 7,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'With Partial Data',
    initialItems: withPartialItemsData.items,
    initialColumns: withPartialItemsData.columns,
    initialViews: withPartialItemsData.views,
    projectNumber: 8,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    sleepMs: 3000,
  },

  {
    name: 'With Saved Views',
    initialItems: savedViewsData.items,
    initialColumns: savedViewsData.columns,
    initialViews: savedViewsData.views,
    projectNumber: 9,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
  },

  {
    name: 'With custom data for milestone',
    initialItems: withCustomMilestoneData.items,
    initialColumns: withCustomMilestoneData.columns,
    initialViews: withCustomMilestoneData.views,
    projectNumber: 12,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'With custom data for assignees',
    initialItems: withCustomAssigneeData.items,
    initialColumns: withCustomAssigneeData.columns,
    initialViews: withCustomAssigneeData.views,
    projectNumber: 1234,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'With items without milestones',
    initialItems: withItemsWithoutMilestonesData.items,
    initialColumns: withItemsWithoutMilestonesData.columns,
    initialViews: withItemsWithoutMilestonesData.views,
    projectNumber: 19,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    loggedInUser: mockUsers[0],
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'All items have milestones',
    initialItems: allItemsHaveMilestonesData.items,
    initialColumns: allItemsHaveMilestonesData.columns,
    initialViews: allItemsHaveMilestonesData.views,
    projectNumber: 20,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    loggedInUser: mockUsers[0],
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'In Admin Mode',
    initialItems: withItemsData.items,
    initialColumns: withItemsData.columns,
    initialViews: withItemsData.views,
    projectNumber: 13,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
  },

  {
    name: 'In Admin Error Mode',
    initialItems: withItemsData.items,
    initialColumns: withItemsData.columns,
    initialViews: withItemsData.views,
    enableErrorMode: true,
    projectNumber: 18,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
  },

  {
    name: 'In User Owned Mode',
    initialItems: withItemsData.items,
    initialColumns: withItemsData.columns,
    initialViews: withItemsData.views,
    projectNumber: 13,
    ownerType: 'users',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
  },

  {
    name: 'In Readonly Mode',
    initialMemex: ReadonlyMemex,
    initialItems: withItemsData.items,
    initialViews: savedViewsData.views,
    projectNumber: 14,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Read}),
  },

  {
    name: 'Settings page',
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    projectNumber: 15,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath: PROJECT_SETTINGS_ROUTE.generateFullPath,
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Settings field page',
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    projectNumber: 16,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath(storyPathArgs) {
      return PROJECT_SETTINGS_FIELD_ROUTE.generateFullPath({
        ...storyPathArgs,
        fieldId: not_typesafe_nonNullAssertion(withItemsData.columns.find(col => col.name === 'Status')).id,
      })
    },
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Workflows page',
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    projectNumber: 17,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath: PROJECT_WORKFLOWS_ROUTE.generateFullPath,
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Access Settings page',
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    projectNumber: 21,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath: PROJECT_SETTINGS_ACCESS_ROUTE.generateFullPath,
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
  },

  {
    name: 'Archive page',
    initialItems: withArchivedItemsData.items,
    initialViews: withArchivedItemsData.views,
    projectNumber: 40,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath: PROJECT_ARCHIVE_ROUTE.generateFullPath,
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    projectLimits: {
      projectItemLimit: 10,
    },
  },

  {
    name: 'Presence',
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    projectNumber: 22,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath: PROJECT_ROUTE.generateFullPath,
    /**
     * Default false so that we can control
     * from `presence-spec.ts`
     */
    showDefaultPresence: false,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[0],
  },

  {
    name: 'Live Updates',
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    projectNumber: 23,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[0],
  },

  {
    name: 'Error Boundary Test',
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    projectNumber: 500,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    loggedInUser: mockUsers[0],
    forceRenderError: true,
  },

  {
    name: 'View deleted',
    initialItems: savedViewsData.items,
    initialColumns: savedViewsData.columns,
    initialViews: savedViewsData.views,
    projectNumber: 24,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    loggedInUser: mockUsers[0],
    async afterPageLoad(window: Window) {
      const views = window.__memexInMemoryServer.db.views.all()
      const baseView = views[0]
      invariant(baseView, 'Base view must exist')
      await window.__memexInMemoryServer.views.delete({viewNumber: baseView.number})

      mockEmitMessageOnChannel('message', {data: {type: 'mock-socket-refresh-event'}})
    },
  },

  {
    name: 'Insights',
    initialItems: withInsightsData.items,
    projectNumber: 39,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath: PROJECT_INSIGHTS_ROUTE.generateFullPath,
    showDefaultPresence: true,
    loggedInUser: mockUsers[0],
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
  },

  {
    name: 'Insights Error Mode',
    initialItems: withItemsData.items,
    projectNumber: 530,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath: PROJECT_INSIGHTS_ROUTE.generateFullPath,
    showDefaultPresence: true,
    loggedInUser: mockUsers[0],
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    enableErrorMode: true,
  },

  {
    name: 'Insights With Redaction',
    initialItems: withItemsData.items,
    projectNumber: 531,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath: PROJECT_INSIGHTS_ROUTE.generateFullPath,
    showDefaultPresence: true,
    loggedInUser: mockUsers[0],
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    enableRedaction: true,
  },

  {
    name: 'XSS Test',
    initialItems: withXssTestColumnData.items,
    initialViews: withXssTestColumnData.views,
    initialColumns: withXssTestColumnData.columns,
    projectNumber: 31,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    loggedInUser: mockUsers[0],
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },

  {
    name: 'Memex Templates',
    initialItems: [],
    projectNumber: 32,
    initialMemex: {
      ...DefaultMemex,
    },
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: false,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[0],
    memexTemplates: 'true',
    organizationTemplates: [
      {
        projectTitle: 'Team retrospective',
        projectId: 1,
        projectNumber: 1,
        projectUpdatedAt: subDays(new Date(), 1).toISOString(),
        projectViews: [{name: 'Retrospective', viewType: ViewTypeParam.Table}],
        projectFields: [
          {
            name: 'Status',
            dataType: MemexColumnDataType.SingleSelect,
            customField: false,
          },
          {
            name: 'Reason',
            dataType: MemexColumnDataType.Text,
            customField: true,
          },
        ],
        projectShortDescription: "Reflect on what went well, what didn't, and how to improve as a team.",
        projectWorkflows: [],
        projectCharts: [],
      },
      {
        projectTitle: 'Team planning',
        projectId: 2,
        projectNumber: 2,
        projectUpdatedAt: subDays(new Date(), 1).toISOString(),
        projectViews: [
          {name: 'Planning', viewType: ViewTypeParam.Table},
          {name: 'Roadmap', viewType: ViewTypeParam.Roadmap},
        ],
        projectFields: [
          {
            name: 'Status',
            dataType: MemexColumnDataType.SingleSelect,
            customField: false,
          },
          {
            name: 'Feature',
            dataType: MemexColumnDataType.SingleSelect,
            customField: true,
          },
          {
            name: 'Priority',
            dataType: MemexColumnDataType.SingleSelect,
            customField: true,
          },
          {
            name: 'Iteration',
            dataType: MemexColumnDataType.Iteration,
            customField: true,
          },
          {
            name: 'Start Date',
            dataType: MemexColumnDataType.Date,
            customField: true,
          },
          {
            name: 'End Date',
            dataType: MemexColumnDataType.Date,
            customField: true,
          },
        ],
        projectShortDescription: 'Plan and track your team’s work.',
        projectWorkflows: [],
        projectCharts: [],
      },
      {
        projectTitle: 'WIP Template',
        projectId: 3,
        projectNumber: 3,
        projectUpdatedAt: subDays(new Date(), 7).toISOString(),
        projectViews: [],
        projectFields: [],
        projectWorkflows: [],
        projectCharts: [],
      },
      {
        projectTitle: "@monalisa's untitled template",
        projectId: 3,
        projectNumber: 3,
        projectUpdatedAt: subDays(new Date(), 7).toISOString(),
        projectViews: [],
        projectFields: [],
        projectWorkflows: [],
        projectCharts: [],
      },
      {
        projectTitle: 'Template with faked async drafts',
        projectId: 10,
        projectNumber: 10,
        projectUpdatedAt: subDays(new Date(), 7).toISOString(),
        projectViews: [],
        projectFields: [],
        projectWorkflows: [],
        projectCharts: [],
      },
    ],
  },
  {
    name: 'Memex Templates In Error Mode',
    initialItems: [],
    projectNumber: 33,
    enableErrorMode: true,
    initialMemex: {
      ...DefaultMemex,
    },
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: false,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[0],
    memexTemplates: 'true',
  },
  {
    name: 'Custom Templates',
    initialItems: [],
    projectNumber: 60,
    initialMemex: {
      ...CustomTemplateMemex,
    },
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: false,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin, canCopyAsTemplate: false}),
    loggedInUser: mockUsers[0],
  },
  {
    name: 'Custom Templates CanCopyAsTemplate',
    initialItems: [],
    projectNumber: 61,
    initialMemex: {
      ...CustomTemplateMemex,
    },
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: false,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin, canCopyAsTemplate: true}),
    loggedInUser: mockUsers[0],
  },
  {
    name: 'Created from template',
    initialItems: [],
    projectNumber: 62,
    initialMemex: {
      ...CustomTemplateMemex,
      isTemplate: false,
    },
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: false,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[0],
    createdWithTemplateMemex: {
      titleHtml: 'Custom Templates',
      url: '/orgs/integration/projects/60',
      id: 1,
    },
  },
  {
    name: '42 views',
    initialItems: withItemsData.items,
    initialColumns: withItemsData.columns,
    initialViews: Array.from({length: 42}, (_, i) => {
      const baseView = withItemsData.views[0]
      invariant(baseView, 'Base view must exist')
      return {
        ...baseView,
        number: i + 1,
        name: randPhrase(),
        id: i + 101,
      }
    }),
    projectNumber: 442,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    generateFullPath(args) {
      return PROJECT_VIEW_ROUTE.generateFullPath({...args, viewNumber: 42})
    },
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  },
  {
    name: 'No suggested repos',
    initialItems: [],
    projectNumber: 34,
    enableErrorMode: false,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: false,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[0],
    suggestedRepositories: [],
  },
  {
    name: 'No items in repo',
    initialItems: [],
    projectNumber: 35,
    enableErrorMode: false,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: false,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[0],
  },
  {
    name: 'In Enterprise Mode',
    initialItems: InitialItems,
    initialViews: withItemsData.views,
    projectNumber: 36,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[1],
    githubRuntime: 'enterprise',
    githubBillingEnabled: false,
  },
  {
    name: 'Closed',
    projectNumber: 37,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    initialItems: withItemsData.items,
    initialViews: withItemsData.views,
    initialMemex: {
      ...DefaultMemex,
      closedAt: new Date().toISOString(),
    },
  },
  {
    name: 'Sorted by Multiple',
    initialItems: withItemsData.items,
    initialViews: autoFillViewServerProps([
      createView({
        name: 'View 1',
        filter: '',
        layout: ViewTypeParam.Table,
        groupBy: [],
        verticalGroupBy: [],
        sortBy: [
          [titleColumn.databaseId, 'asc'],
          [assigneesColumn.databaseId, 'desc'],
        ],
        priority: null,
        visibleFields: DefaultColumns.filter(c => c.defaultColumn).map(c => c.databaseId),
        aggregationSettings: {
          hideItemsCount: false,
          sum: [],
        },
        layoutSettings: {},
        sliceBy: {},
        sliceValue: null,
      }),
    ]),
    projectNumber: 38,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[1],
  },
  {
    name: 'With sub issues',
    initialItems: InitialItems,
    initialColumns: withSubIssuesData.columns,
    initialViews: withSubIssuesData.views,
    projectNumber: 44,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[17],
  },
  {
    name: 'With status updates',
    initialItems: InitialItems,
    projectNumber: 39,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    loggedInUser: mockUsers[17],
    statuses: withStatusUpdateData.statuses,
  },
  {
    name: 'With Issue Types Rename Prompt',
    initialItems: InitialItems,
    initialColumns: withItemsData.columns.map(col => {
      if (col.dataType === MemexColumnDataType.IssueType) {
        return {
          ...col,
          userDefined: true,
          dataType: MemexColumnDataType.Text,
        }
      }
      return col
    }),
    projectNumber: 43,
    ownerType: 'orgs',
    ownerIdentifier: 'integration',
    showDefaultPresence: true,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Admin}),
    loggedInUser: mockUsers[17],
    userNotices: ['memex_issue_types_rename_prompt'],
  },
]

const appStoriesById = convertToMap(appStoryDefinitions)
const integrationTestStoriesById = convertToMap(integrationTestStoryDefinitions)
export const storiesById = {...appStoriesById, ...integrationTestStoriesById}
const allAppStories = Object.values(storiesById)

const uniqueProjectPathnames = new Set(allAppStories.map(getStoryId))

if (allAppStories.length !== uniqueProjectPathnames.size) {
  throw new Error('More than one story is defined for a single projectNumber')
}

const _initialStory = appStoryDefinitions[0]
invariant(_initialStory, 'App stories must be defined')
export const initialStory = _initialStory
export const defaultStoryId = getStoryId(initialStory)
