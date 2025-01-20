import type {MemexColumn} from '../../client/api/columns/contracts/memex-column'
import type {MemexItem} from '../../client/api/memex-items/contracts'
import type {PageView} from '../../client/api/view/contracts'
import {
  DefaultClosedIssue,
  DefaultClosedPullRequest,
  DefaultDraftIssue,
  DefaultOpenIssue,
  DefaultOpenPullRequest,
  DefaultRedactedItem,
  DraftIssueLink,
} from '../memex-items'
import {DefaultColumns, P50Columns} from '../mock-data'
import {generateItems} from './generated'
import {createMockIssue} from './issues'
import {autoFillViewServerProps, createView} from './views'

type IntegrationTestStoryData = {
  items: Array<MemexItem>
  columns: Array<MemexColumn>
  views: Array<PageView>
}
export const P_50_REACT_PROFILER_ID = 'p50'

const FIXED_RANDOM_NUMBER_SEED = 1616548276
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
})

const createStoryDataFromColumns = (columns: Array<MemexColumn>) => ({
  columns,
  views: autoFillViewServerProps([
    createView({
      name: '',
      filter: '',
      layout: 'table_layout',
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

export const p50Data: IntegrationTestStoryData = {
  ...createStoryDataFromColumns(P50Columns),
  items: generateItems({count: 100, columns: P50Columns, seed: FIXED_RANDOM_NUMBER_SEED}),
}

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
