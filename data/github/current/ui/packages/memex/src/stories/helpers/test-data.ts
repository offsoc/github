import {
  addDays,
  addQuarters,
  getDaysInMonth,
  lastDayOfMonth,
  lastDayOfQuarter,
  lastDayOfYear,
  startOfMonth,
  startOfToday,
  startOfYear,
  subDays,
  subSeconds,
} from 'date-fns'
import invariant from 'tiny-invariant'

import {type MemexColumn, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {MemexColumnData, TitleColumnData} from '../../client/api/columns/contracts/storage'
import {IssueStateReason, type User} from '../../client/api/common-contracts'
import type {MemexStatus} from '../../client/api/memex/contracts'
import type {MemexItem} from '../../client/api/memex-items/contracts'
import {type PageView, ViewTypeParam} from '../../client/api/view/contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {
  CustomIterationColumnId,
  CustomReasonColumnId,
  EndDateColumnId,
  parentIssueColumn,
  SecondaryIterationColumnId,
  StartDateColumnId,
} from '../../mocks/data/columns'
import {generateItems, generateLeanHistoricalInsightsData} from '../../mocks/data/generated'
import {createMockIssue, createMockRoadmapIssue} from '../../mocks/data/issues'
import {getNextId} from '../../mocks/data/mock-ids'
import {createMockPullRequest} from '../../mocks/data/pull-requests'
import {getUser} from '../../mocks/data/users'
import {autoFillViewServerProps, createView} from '../../mocks/data/views'
import {deepCopy} from '../../mocks/in-memory-database/utils'
import {
  ClosedTrackedByIssue,
  DefaultClosedIssue,
  DefaultClosedPullRequest,
  DefaultDraftIssue,
  DefaultOpenIssue,
  DefaultOpenPullRequest,
  DefaultPullRequestFromMilestonelessRepository,
  DefaultRedactedItem,
  DefaultTrackedByIssue,
  DraftIssueLink,
  DraftIssueWithPartialColumns,
  IssueInPublicRepositoryWithCustomColumns,
  IssueInPublicRepositoryWithPartialColumns,
  SecondIssueInPublicRepositoryWithCustomColumns,
  ThirdIssueInPublicRepositoryWithCustomColumns,
} from '../../mocks/memex-items'
import {
  DefaultColumns,
  IterationDemoColumns,
  OnlyTitleVisibleColumns,
  P50Columns,
  P99Columns,
  PartialDataColumns,
  ReasonDemoColumns,
  RoadmapTestColumns,
  SingleSelectDemoColumns,
  SubIssueDemoColumns,
  TitleColumnHiddenDefaultColumns,
  TrackedByDemoColumns,
  XssTestColumns,
} from '../../mocks/mock-data'

type IntegrationTestStoryData = {
  items: Array<MemexItem>
  columns: Array<MemexColumn>
  views: Array<PageView>
}

const closedIssueWithAllData = createMockIssue({
  isOpen: false,
  issueNumber: 101,
  title: 'This is a closed issue for testing',
  priority: 1,
  assignees: ['lerebear'],
  status: 'Done',
  stage: 'Complete',
  impact: 'High',
  repositoryId: 1,
  milestoneId: 2,
  teamId: 2,
  subIssuesProgress: {id: 1, total: 6, completed: 2, percentCompleted: 33},
  parentIssue: {
    id: 1,
    globalRelayId: 'I_kwARTg',
    number: 10,
    title: 'Parent One',
    state: 'open',
    nwoReference: 'github/sriracha-4#10',
    url: 'http://github.localhost:80/github/sriracha-4/issues/14',
    owner: 'github',
    repository: 'sriracha-4',
    subIssueList: {
      completed: 1,
      percentCompleted: 10,
      total: 10,
    },
  },
})

const closedIssueAsNotPlanned = createMockIssue({
  isOpen: false,
  issueNumber: 101,
  title: 'This issue is for the unforeseeable future',
  priority: 1,
  assignees: [],
  status: 'Done',
  stage: 'Complete',
  impact: 'High',
  repositoryId: 1,
  milestoneId: 2,
  teamId: 2,
  labelIds: [],
  estimate: 0,
  dueDate: undefined,
  stateReason: IssueStateReason.NotPlanned,
})

const issueWithDifferentMilestone = createMockIssue({
  isOpen: true,
  issueNumber: 1234,
  title: 'Mock issue with different milestone for testing',
  priority: 1,
  assignees: ['maxbeizer'],
  status: 'Done',
  stage: 'Complete',
  impact: 'High',
  repositoryId: 3,
  milestoneId: 9,
  parentIssue: {
    id: 2,
    globalRelayId: 'I_kwARSw',
    number: 11,
    title: 'Parent Two',
    state: 'closed',
    stateReason: 'completed',
    nwoReference: 'github/sriracha-4#11',
    url: 'http://github.localhost:80/github/sriracha-4/issues/15',
    owner: 'github',
    repository: 'sriracha-4',
    subIssueList: {
      completed: 1,
      percentCompleted: 50,
      total: 2,
    },
  },
})

const pullRequestWithDifferentMilestone = createMockPullRequest({
  isOpen: true,
  issueNumber: 1235,
  title: 'Mock pull request with different milestone for testing',
  priority: 1,
  assignees: ['shiftkey'],
  status: 'Done',
  stage: 'Complete',
  impact: 'High',
  repositoryId: 3,
  milestoneId: 9,
})

const issueWithTwoAssignees = createMockIssue({
  isOpen: true,
  issueNumber: 2765,
  title: 'Mock issue with two assignees for testing',
  priority: 1,
  assignees: ['shiftkey', 'lerebear'],
  status: 'Done',
  stage: 'Complete',
  impact: 'High',
  repositoryId: 3,
  milestoneId: 9,
})

const createStoryDataFromColumns = (columns: Array<MemexColumn>) => ({
  columns,
  views: autoFillViewServerProps([
    createView({
      name: '',
      filter: '',
      layout: ViewTypeParam.Table,
      groupBy: [],
      verticalGroupBy: [],
      sortBy: [],
      priority: null,
      visibleFields: columns.filter(c => c.defaultColumn).map(c => c.databaseId),
      aggregationSettings: {hideItemsCount: false, sum: []},
      layoutSettings: {},
      sliceBy: {},
      sliceValue: null,
    }),
  ]),
})

export const withItemsData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(DefaultColumns),
  items: [
    DefaultClosedIssue,
    DefaultClosedPullRequest,
    DefaultDraftIssue,
    closedIssueWithAllData,
    DefaultRedactedItem,
    DefaultOpenIssue,
    DefaultOpenPullRequest,
    DraftIssueLink,
  ],
}

export const withCustomMilestoneData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns([...DefaultColumns, parentIssueColumn]),
  items: [
    DefaultClosedIssue,
    DefaultClosedPullRequest,
    DefaultDraftIssue,
    closedIssueWithAllData,
    DefaultRedactedItem,
    DefaultOpenIssue,
    DefaultOpenPullRequest,
    DraftIssueLink,
    issueWithDifferentMilestone,
    pullRequestWithDifferentMilestone,
  ],
}

export const withCustomAssigneeData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(DefaultColumns),
  items: [
    closedIssueWithAllData,
    issueWithDifferentMilestone,
    pullRequestWithDifferentMilestone,
    issueWithTwoAssignees,
    DefaultOpenPullRequest,
  ],
}

export const withItemsWithoutMilestonesData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(DefaultColumns),
  items: [DefaultPullRequestFromMilestonelessRepository],
}

export const allItemsHaveMilestonesData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(DefaultColumns),
  items: [DefaultOpenIssue, DefaultClosedIssue, DefaultOpenPullRequest],
}

export const withCustomItemsData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(SingleSelectDemoColumns),
  items: [
    IssueInPublicRepositoryWithCustomColumns,
    SecondIssueInPublicRepositoryWithCustomColumns,
    ThirdIssueInPublicRepositoryWithCustomColumns,
  ],
}

export const withPartialItemsData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(PartialDataColumns),
  items: [IssueInPublicRepositoryWithPartialColumns, DraftIssueWithPartialColumns],
}

export const withTitleColumnHidden: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(TitleColumnHiddenDefaultColumns),
  items: [
    DefaultClosedIssue,
    DefaultClosedPullRequest,
    DefaultDraftIssue,
    closedIssueWithAllData,
    DefaultRedactedItem,
    DefaultOpenIssue,
    DefaultOpenPullRequest,
    DraftIssueLink,
  ],
}

export const withOnlyTitleColumnData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(OnlyTitleVisibleColumns),
  items: [
    DefaultClosedIssue,
    DefaultClosedPullRequest,
    DefaultDraftIssue,
    closedIssueWithAllData,
    DefaultRedactedItem,
    DefaultOpenIssue,
    DefaultOpenPullRequest,
    DraftIssueLink,
  ],
}

export const P_50_REACT_PROFILER_ID = 'p50'
const FIXED_RANDOM_NUMBER_SEED = 1616548276

export const p50Data: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(P50Columns),
  items: generateItems({count: 100, columns: P50Columns, seed: FIXED_RANDOM_NUMBER_SEED}),
}

export const p99Data: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(P99Columns),
  items: generateItems({count: 1000, columns: P99Columns, seed: FIXED_RANDOM_NUMBER_SEED}),
}
export const getMWLData: () => IntegrationTestStoryData = () => {
  const data = {
    ...createStoryDataFromColumns(DefaultColumns),
    items: generateItems({count: 1000, columns: DefaultColumns, seed: FIXED_RANDOM_NUMBER_SEED, includeEmpty: true}),
  }
  const baseView = data.views[0]
  invariant(baseView, 'Base view must exist')
  data.views = [
    ...data.views,
    {
      ...baseView,
      id: 2,
      name: 'Issues only',
      number: 2,
      groupBy: [],
      verticalGroupBy: [],
      sortBy: [],
      sliceBy: {},
      filter: 'is:issue',
    },
    {
      ...baseView,
      id: 3,
      name: 'Sorted by Status',
      number: 3,
      groupBy: [],
      verticalGroupBy: [],
      sortBy: [
        [not_typesafe_nonNullAssertion(DefaultColumns.find(column => column.id === 'Status')).databaseId, 'asc'],
      ],
      sliceBy: {},
      filter: '',
    },
    {
      ...baseView,
      id: 4,
      name: 'Grouped by Status',
      number: 4,
      groupBy: [not_typesafe_nonNullAssertion(DefaultColumns.find(column => column.id === 'Status')).databaseId],
      verticalGroupBy: [],
      sortBy: [],
      sliceBy: {},
      filter: '',
    },
    {
      ...baseView,
      id: 5,
      name: 'Grouped by Team',
      number: 5,
      groupBy: [not_typesafe_nonNullAssertion(DefaultColumns.find(column => column.name === 'Team')).databaseId],
      verticalGroupBy: [],
      sortBy: [],
      sliceBy: {},
      filter: '',
    },
  ]

  return data
}

export const getSavedViewsInitialData = () => {
  const data = {
    ...createStoryDataFromColumns(DefaultColumns),
    items: generateItems({count: 100, columns: P50Columns, seed: FIXED_RANDOM_NUMBER_SEED}),
  }

  const baseView = data.views[0]
  invariant(baseView, 'Base view must exist')
  data.views = [
    ...data.views,
    {
      id: 2,
      name: 'View 2',
      layout: ViewTypeParam.Table,
      number: 2,
      groupBy: [not_typesafe_nonNullAssertion(DefaultColumns.find(column => column.id === 'Status')).databaseId],
      verticalGroupBy: [],
      sortBy: [
        [not_typesafe_nonNullAssertion(DefaultColumns.find(column => column.id === 'Status')).databaseId, 'desc'],
      ],
      visibleFields: [
        ...baseView.visibleFields.slice(1, 2),
        ...baseView.visibleFields.slice(0, 1),
        ...baseView.visibleFields.slice(2),
      ],

      filter: '',
      priority: null,
      aggregationSettings: {hideItemsCount: false, sum: []},
      createdAt: new Date(2021, 5, 15).toISOString(),
      updatedAt: new Date(2021, 5, 15).toISOString(),
      layoutSettings: {},
      sliceBy: {},
      sliceValue: null,
    },

    {
      id: 3,
      name: 'View 3',
      layout: ViewTypeParam.Board,
      number: 3,
      groupBy: [not_typesafe_nonNullAssertion(DefaultColumns.find(column => column.id === 'Status')).databaseId],
      verticalGroupBy: [],
      sortBy: [],
      visibleFields: baseView.visibleFields,
      filter: '',
      priority: null,
      aggregationSettings: {
        hideItemsCount: false,
        sum: [],
      },
      createdAt: new Date(2021, 5, 15).toISOString(),
      updatedAt: new Date(2021, 5, 15).toISOString(),
      layoutSettings: {},
      sliceBy: {},
      sliceValue: null,
    },
  ]

  return data
}

/** Helper function to merge additional values into a given project item */
function addColumnValues(item: MemexItem, values: Array<MemexColumnData>): MemexItem {
  const newItem = item
  newItem.memexProjectColumnValues.push(...values)
  return newItem
}

export const withIterationFieldData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(IterationDemoColumns),
  items: [
    addColumnValues(DefaultClosedIssue, [{memexProjectColumnId: CustomIterationColumnId, value: {id: 'iteration-4'}}]),
    DefaultClosedPullRequest,
    addColumnValues(DefaultDraftIssue, [{memexProjectColumnId: CustomIterationColumnId, value: {id: 'iteration-4'}}]),
    closedIssueWithAllData,
    DefaultRedactedItem,
    addColumnValues(DefaultOpenIssue, [{memexProjectColumnId: CustomIterationColumnId, value: {id: 'iteration-5'}}]),
    DefaultOpenPullRequest,
    addColumnValues(DraftIssueLink, [{memexProjectColumnId: CustomIterationColumnId, value: {id: 'iteration-4'}}]),
    addColumnValues(DefaultTrackedByIssue, [
      {memexProjectColumnId: CustomIterationColumnId, value: {id: 'iteration-0'}},
    ]),
  ],
}

export const withSubIssuesData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(SubIssueDemoColumns),
  items: [],
}

export const withReasonFieldData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(ReasonDemoColumns),
  items: [
    addColumnValues(DefaultClosedIssue, [
      {memexProjectColumnId: CustomReasonColumnId, value: {raw: 'customer-request', html: 'customer-request'}},
    ]),

    DefaultClosedPullRequest,
    addColumnValues(DefaultDraftIssue, [
      {memexProjectColumnId: CustomReasonColumnId, value: {raw: 'customer-request', html: 'customer-request'}},
    ]),

    closedIssueWithAllData,
    closedIssueAsNotPlanned,
    DefaultRedactedItem,
    addColumnValues(DefaultOpenIssue, [
      {memexProjectColumnId: CustomReasonColumnId, value: {raw: 'tech-debt', html: 'tech-debt'}},
    ]),

    DefaultOpenPullRequest,
    addColumnValues(DraftIssueLink, [
      {memexProjectColumnId: CustomReasonColumnId, value: {raw: 'tech-debt', html: 'tech-debt'}},
    ]),
  ],
}

export const withTrackedByFieldData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(TrackedByDemoColumns),
  items: [
    DefaultTrackedByIssue,
    DefaultClosedIssue,
    ClosedTrackedByIssue,
    DefaultClosedPullRequest,
    DefaultDraftIssue,
    closedIssueWithAllData,
    DefaultRedactedItem,
    DefaultOpenIssue,
    DefaultOpenPullRequest,
    DraftIssueLink,
  ],
}

export const withXssTestColumnData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(XssTestColumns),
  items: [
    DefaultClosedIssue,
    DefaultClosedPullRequest,
    DefaultDraftIssue,
    closedIssueWithAllData,
    DefaultRedactedItem,
    DefaultOpenIssue,
    DefaultOpenPullRequest,
    DraftIssueLink,
  ],
}

export const withNewProject: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(DefaultColumns),
  items: [],
}

/** Turns the given project item into an archived item */
const itemWithArchived = (
  item: MemexItem,
  {
    archivedAt,
    archivedBy,
  }: {
    /**
     * When the value is explicitly null, no user will be set,
     * otherwise a default user will be given if none is provided
     */
    archivedBy?: User | null
    archivedAt?: string
  } = {},
): MemexItem => {
  const archivedOpts: MemexItem['archived'] = {
    archivedAt: archivedAt ?? new Date().toISOString(),
  }

  if (archivedBy !== null) {
    archivedOpts.archivedBy = getUser('dmarcey')
  }

  return {
    ...item,
    archived: archivedOpts,
  }
}

type DuplicateItemOptions = {title?: string; id?: number}
/**
 * Duplicates an existing memex item, and allows some properties to be changed
 * in the newly duplicated item.
 */
const duplicateItem = <Item extends MemexItem = MemexItem>(
  item: Item,
  {title, id}: DuplicateItemOptions = {},
): Item => {
  const newId = id ?? getNextId()
  const clonedItem = deepCopy(item)
  const newItem: Item = {
    ...clonedItem,
    id: newId,
    content: {
      ...clonedItem.content,
    },
  }

  if (title) {
    const {value} = newItem.memexProjectColumnValues.find(
      col => col.memexProjectColumnId === SystemColumnId.Title,
    ) as TitleColumnData
    value.title = {raw: title, html: title}
  }

  return newItem
}

const itemsWithArchivedVersions = (
  item: MemexItem,
  opts: DuplicateItemOptions,
  archiveOpts: Parameters<typeof itemWithArchived>[1] = {},
): Array<MemexItem> => {
  return [
    duplicateItem(item, opts),
    itemWithArchived(
      duplicateItem(item, {
        ...opts,
        ...(opts.title && {title: `${opts.title} (ARCHIVE)`}),
      }),

      archiveOpts,
    ),
  ]
}

export const withArchivedItemsData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(DefaultColumns),
  items: [
    ...generateItems({count: 4000, columns: DefaultColumns}).map((item, index) =>
      itemWithArchived(duplicateItem(item, {title: `Archived item ${item.id}`}), {
        archivedAt: subSeconds(subDays(new Date(), 10), index * 10).toISOString(),
      }),
    ),

    ...itemsWithArchivedVersions(
      DefaultClosedIssue,
      {
        title: 'Closed issue with some long text to make the title text longer and eventually wrap',
      },

      {archivedAt: subSeconds(new Date(), 1).toISOString()},
    ),

    ...itemsWithArchivedVersions(
      DefaultClosedPullRequest,
      {title: 'Improve the archived items page'},
      {archivedAt: subSeconds(new Date(), 2).toISOString()},
    ),

    ...itemsWithArchivedVersions(
      DefaultDraftIssue,
      {title: 'This is a draft issue'},
      {archivedAt: subSeconds(new Date(), 3).toISOString()},
    ),

    ...itemsWithArchivedVersions(
      DefaultOpenIssue,
      {title: 'Issues with loading archived items'},
      {archivedAt: subSeconds(new Date(), 4).toISOString()},
    ),

    ...itemsWithArchivedVersions(
      DefaultOpenPullRequest,
      {title: '[experiment] improve performance of archiving'},
      {archivedAt: subSeconds(new Date(), 5).toISOString()},
    ),

    ...itemsWithArchivedVersions(
      DraftIssueLink,
      {title: 'Idea to improve archive page'},
      {archivedAt: subSeconds(new Date(), 6).toISOString()},
    ),

    ...itemsWithArchivedVersions(
      closedIssueWithAllData,
      {title: 'Closed issue with all data'},
      {archivedAt: subSeconds(new Date(), 7).toISOString()},
    ),

    ...itemsWithArchivedVersions(
      closedIssueAsNotPlanned,
      {title: 'Closed issue as not planned'},
      {archivedAt: subSeconds(new Date(), 8).toISOString()},
    ),

    itemWithArchived(duplicateItem(DefaultRedactedItem), {
      archivedBy: null,
      archivedAt: subSeconds(new Date(), 9).toISOString(),
    }),

    itemWithArchived(duplicateItem(DefaultRedactedItem), {archivedAt: subSeconds(new Date(), 10).toISOString()}),
    itemWithArchived(duplicateItem(DefaultOpenIssue, {title: 'This was archived without an actor'}), {
      archivedBy: null,
      archivedAt: subSeconds(new Date(), 11).toISOString(),
    }),
  ],
}

const today = startOfToday()
const firstDay = startOfMonth(today)
const lastDay = lastDayOfMonth(today)
const firstDayYear = startOfYear(today)
const lastDayYear = lastDayOfYear(today)
const daysInMonth = getDaysInMonth(today)

/** Turns the given project item into an archived item */
const itemWithStartAndEndDate = (
  item: MemexItem,
  {
    startDate,
    endDate,
  }: {
    startDate?: string | Date
    endDate?: string | Date
  } = {},
): MemexItem => {
  const {memexProjectColumnValues, ...rest} = item
  const projectColumnValues = memexProjectColumnValues.filter(
    columnData =>
      !new Array<number | SystemColumnId>(StartDateColumnId, EndDateColumnId).includes(columnData.memexProjectColumnId),
  )

  if (startDate) {
    projectColumnValues.push({
      memexProjectColumnId: StartDateColumnId,
      value: {
        value: typeof startDate === 'string' ? startDate : startDate.toISOString(),
      },
    })
  }

  if (endDate) {
    projectColumnValues.push({
      memexProjectColumnId: EndDateColumnId,
      value: {
        value: typeof endDate === 'string' ? endDate : endDate.toISOString(),
      },
    })
  }

  return {
    ...rest,
    memexProjectColumnValues: projectColumnValues,
  }
}

export const withRoadmapData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(RoadmapTestColumns),
  items: [
    createMockRoadmapIssue({
      issueNumber: 1341,
      priority: 100,
      title: 'Whole year',
      startDate: firstDayYear,
      endDate: lastDayYear,
    }),
    createMockRoadmapIssue({
      issueNumber: 1341,
      priority: 100,
      title: 'Q1',
      startDate: firstDayYear,
      endDate: lastDayOfQuarter(firstDayYear),
    }),
    createMockRoadmapIssue({
      issueNumber: 1341,
      priority: 100,
      title: 'Q2',
      startDate: addQuarters(firstDayYear, 1),
      endDate: lastDayOfQuarter(addQuarters(firstDayYear, 1)),
    }),
    createMockRoadmapIssue({
      issueNumber: 1341,
      priority: 100,
      title: 'Q3',
      startDate: addQuarters(firstDayYear, 2),
      endDate: lastDayOfQuarter(addQuarters(firstDayYear, 2)),
    }),
    createMockRoadmapIssue({
      issueNumber: 1341,
      priority: 100,
      title: 'Q4',
      startDate: addQuarters(firstDayYear, 3),
      endDate: lastDayOfQuarter(addQuarters(firstDayYear, 3)),
    }),
    createMockRoadmapIssue({
      issueNumber: 1340,
      priority: 100,
      title: 'Whole month',
      startDate: firstDay,
      endDate: lastDay,
    }),
    createMockRoadmapIssue({
      issueNumber: 8342,
      priority: 102,
      title: 'Today',
      startDate: today,
    }),
    createMockRoadmapIssue({
      issueNumber: 2453,
      priority: 101,
      title: 'First day',
      startDate: firstDay,
    }),
    createMockRoadmapIssue({
      issueNumber: 8342,
      priority: 102,
      title: 'Last day',
      startDate: lastDay,
    }),
    createMockRoadmapIssue({
      issueNumber: 8342,
      priority: 102,
      title: 'Target day',
      endDate: addDays(today, 7),
      dueDate: addDays(today, 7),
    }),
    createMockRoadmapIssue({
      issueNumber: 8342,
      priority: 102,
      title: 'Same day',
      startDate: today,
      endDate: today,
    }),
    createMockRoadmapIssue({
      issueNumber: 9932,
      priority: 103,
      title: 'Week 1',
      startDate: firstDay,
      endDate: addDays(firstDay, 7),
    }),
    createMockRoadmapIssue({
      issueNumber: 7745,
      priority: 104,
      title: 'Week 2',
      startDate: addDays(firstDay, 7),
      endDate: addDays(firstDay, 14),
    }),
    createMockRoadmapIssue({
      issueNumber: 2352,
      priority: 105,
      title: 'Week 3',
      startDate: addDays(firstDay, 14),
      endDate: addDays(firstDay, 21),
    }),
    createMockRoadmapIssue({
      issueNumber: 9345,
      priority: 106,
      title: 'Week 4',
      startDate: addDays(firstDay, 21),
      endDate: addDays(firstDay, 28),
    }),
    createMockRoadmapIssue({
      issueNumber: 9933,
      priority: 103,
      title: 'This Week',
      startDate: today,
      endDate: addDays(today, 7),
    }),
    createMockRoadmapIssue({
      issueNumber: 9933,
      priority: 103,
      title: 'Reversed',
      startDate: addDays(today, 7),
      endDate: today,
    }),
    createMockRoadmapIssue({
      issueNumber: 9345,
      priority: 110,
      title: 'First half',
      startDate: firstDay,
      endDate: addDays(firstDay, Math.floor(daysInMonth / 2)),
    }),
    createMockRoadmapIssue({
      issueNumber: 9345,
      priority: 111,
      title: 'Second half',
      startDate: addDays(firstDay, Math.floor(daysInMonth / 2) + 1),
      endDate: lastDay,
    }),
    ...generateItems({
      count: 28,
      columns: RoadmapTestColumns.filter(c => c.id !== CustomIterationColumnId && c.id !== SecondaryIterationColumnId),
    }).map((item, index) =>
      itemWithStartAndEndDate(item, {
        startDate: addDays(firstDay, index),
        endDate: addDays(firstDay, index),
      }),
    ),
    ...generateItems({
      count: 28,
      columns: RoadmapTestColumns.filter(c => c.id !== CustomIterationColumnId && c.id !== SecondaryIterationColumnId),
    }).map((item, index) =>
      itemWithStartAndEndDate(item, {
        startDate: firstDay,
        endDate: addDays(firstDay, index),
      }),
    ),
    ...generateItems({
      count: 28,
      columns: RoadmapTestColumns.filter(c => c.id !== CustomIterationColumnId && c.id !== SecondaryIterationColumnId),
    }).map((item, index) =>
      itemWithStartAndEndDate(item, {
        startDate: addDays(firstDay, index),
        endDate: lastDay,
      }),
    ),
  ],
}

export const withInsightsData: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(DefaultColumns),
  items: generateLeanHistoricalInsightsData({columns: DefaultColumns}),
}

export const withStatusUpdateData: {
  statuses: Array<MemexStatus>
} = {
  statuses: [
    {
      id: 10,
      creator: getUser('dmarcey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: 'c77b75a3',
          name: 'Complete',
          nameHtml: 'Complete',
          color: 'PURPLE',
          description: 'This project is complete.',
          descriptionHtml: 'This project is complete.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Mission accomplished! Project successfully completed!',
      bodyHtml: 'Mission accomplished! Project successfully completed!',
      userHidden: false,
    },
    {
      id: 9,
      creator: getUser('dmarcey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: '459eafad',
          name: 'On track',
          nameHtml: 'On track',
          color: 'GREEN',
          description: 'This project is on track with no risks.',
          descriptionHtml: 'This project is on track with no risks.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Making steady progress and staying on track!',
      bodyHtml: 'Making steady progress and staying on track!',
      userHidden: false,
    },
    {
      id: 8,
      creator: getUser('dmarcey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: '04201a9a',
          name: 'Off track',
          nameHtml: 'Off track',
          color: 'RED',
          description: 'This project is off track and needs attention.',
          descriptionHtml: 'This project is off track and needs attention.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Taking a detour, but working hard to get back on track.',
      bodyHtml: 'Taking a detour, but working hard to get back on track.',
      userHidden: false,
    },
    {
      id: 7,
      creator: getUser('dmarcey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: '366655d6',
          name: 'At risk',
          nameHtml: 'At risk',
          color: 'YELLOW',
          description: 'This project is at risk and encountering some challenges.',
          descriptionHtml: 'This project is at risk and encountering some challenges.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Facing uncertainty, but staying strong and determined in the face of challenges.',
      bodyHtml: 'Facing uncertainty, but staying strong and determined in the face of challenges.',
      userHidden: false,
    },
    {
      id: 6,
      creator: getUser('dmarcey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: '459eafad',
          name: 'On track',
          nameHtml: 'On track',
          color: 'GREEN',
          description: 'This project is on track with no risks.',
          descriptionHtml: 'This project is on track with no risks.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Hello World!',
      bodyHtml: 'Hello World!',
      userHidden: false,
    },
    {
      id: 5,
      creator: getUser('shiftkey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: 'c77b75a3',
          name: 'Complete',
          nameHtml: 'Complete',
          color: 'PURPLE',
          description: 'This project is complete.',
          descriptionHtml: 'This project is complete.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Mission accomplished! Project successfully completed!',
      bodyHtml: 'Mission accomplished! Project successfully completed!',
      userHidden: false,
    },
    {
      id: 4,
      creator: getUser('shiftkey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: '459eafad',
          name: 'On track',
          nameHtml: 'On track',
          color: 'GREEN',
          description: 'This project is on track with no risks.',
          descriptionHtml: 'This project is on track with no risks.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Making steady progress and staying on track!',
      bodyHtml: 'Making steady progress and staying on track!',
      userHidden: false,
    },
    {
      id: 3,
      creator: getUser('shiftkey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: '04201a9a',
          name: 'Off track',
          nameHtml: 'Off track',
          color: 'RED',
          description: 'This project is off track and needs attention.',
          descriptionHtml: 'This project is off track and needs attention.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Taking a detour, but working hard to get back on track.',
      bodyHtml: 'Taking a detour, but working hard to get back on track.',
      userHidden: false,
    },
    {
      id: 2,
      creator: getUser('shiftkey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: '366655d6',
          name: 'At risk',
          nameHtml: 'At risk',
          color: 'YELLOW',
          description: 'This project is at risk and encountering some challenges.',
          descriptionHtml: 'This project is at risk and encountering some challenges.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Facing uncertainty, but staying strong and determined in the face of challenges.',
      bodyHtml: 'Facing uncertainty, but staying strong and determined in the face of challenges.',
      userHidden: false,
    },
    {
      id: 1,
      creator: getUser('shiftkey'),
      updatedAt: '2023-10-31',
      statusValue: {
        status: {
          id: '459eafad',
          name: 'On track',
          nameHtml: 'On track',
          color: 'GREEN',
          description: 'This project is on track with no risks.',
          descriptionHtml: 'This project is on track with no risks.',
        },
        statusId: '459eafad',
        startDate: '2023-10-31',
        targetDate: '2023-11-14',
      },
      body: 'Hello World!',
      bodyHtml: 'Hello World!',
      userHidden: false,
    },
  ],
}
