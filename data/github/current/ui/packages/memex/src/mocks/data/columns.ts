import {type MemexColumn, MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {
  iteration0Date,
  iteration1Date,
  iteration2Date,
  iteration3Date,
  iteration4Date,
  iteration5Date,
  iteration6Date,
  threeWeekIteration1Date,
  threeWeekIteration2Date,
  threeWeekIteration3Date,
} from './dates'
import {getNextId} from './mock-ids'
import {aardvarkOptions, stageOptions, statusOptions} from './single-select'

type ColumnCreationParams = Omit<MemexColumn, 'databaseId' | 'position' | 'defaultColumn'> & {
  defaultColumn?: boolean
} & {position?: number}

/**
 * Fill a list of columns with data normally provided by the server/database.
 * This maintains the databaseId if it's already set greater than 0.
 *
 * @param columns The columns to auto-fill server data with
 * @returns The columns with server data filled in
 */
export function autoFillColumnServerProps(columns: Array<MemexColumn>): Array<MemexColumn> {
  return columns.map((col, i) => ({...col, position: i + 1, databaseId: col.databaseId > 0 ? col.databaseId : i + 1}))
}

/**
 * Create a minimum column for use in a demo Memex
 *
 * By default this will not have a position set, so ensure you wrap your array
 * of columns in an autoFillPositions call to populate it for use in the dev environment
 */
export function createColumn({
  dataType,
  id,
  name,
  userDefined,
  defaultColumn = true,
  settings = {},
  position = -1,
}: ColumnCreationParams): MemexColumn {
  return {
    dataType,
    id,
    name,
    position,
    userDefined,
    defaultColumn,
    settings,
    databaseId: getNextId(),
  }
}

export const StageColumnId = 10
export const TeamColumnId = 11
export const ThemeColumnId = 12
export const ImpactColumnId = 13
export const ConfidenceColumnId = 14
export const EffortColumnId = 15
export const CustomTextColumnId = 16
export const CustomNumberColumnId = 17
export const CustomDateColumnId = 18
export const CustomSingleSelectColumnId = 19
export const CustomIterationColumnId = 20
export const CustomReasonColumnId = 21
const XssTestColumnId = 22
export const StartDateColumnId = 23
export const EndDateColumnId = 24
export const SecondaryIterationColumnId = 25
export const MultiWordColumnId = 26

export const titleColumn = createColumn({
  dataType: MemexColumnDataType.Title,
  id: SystemColumnId.Title,
  name: 'Title',
  userDefined: false,
})

export const assigneesColumn = createColumn({
  dataType: MemexColumnDataType.Assignees,
  id: SystemColumnId.Assignees,
  name: 'Assignees',
  userDefined: false,
})

export const statusColumn = createColumn({
  dataType: MemexColumnDataType.SingleSelect,
  id: SystemColumnId.Status,
  name: 'Status',
  userDefined: false,
  settings: {
    options: statusOptions,
  },
})

export const labelsColumn = createColumn({
  dataType: MemexColumnDataType.Labels,
  id: SystemColumnId.Labels,
  name: 'Labels',
  userDefined: false,
})

export const repositoryColumn = createColumn({
  dataType: MemexColumnDataType.Repository,
  id: SystemColumnId.Repository,
  name: 'Repository',
  userDefined: false,
})

export const linkedPullRequestsColumn = createColumn({
  dataType: MemexColumnDataType.LinkedPullRequests,
  id: SystemColumnId.LinkedPullRequests,
  name: 'Linked pull requests',
  userDefined: false,
})

export const tracksColumn = createColumn({
  dataType: MemexColumnDataType.Tracks,
  id: SystemColumnId.Tracks,
  name: 'Tracks',
  userDefined: false,
})

export const trackedByColumn = createColumn({
  dataType: MemexColumnDataType.TrackedBy,
  id: SystemColumnId.TrackedBy,
  name: 'Tracked by',
  userDefined: false,
})

export const issueTypeColumn = createColumn({
  dataType: MemexColumnDataType.IssueType,
  id: SystemColumnId.IssueType,
  name: 'Type',
  userDefined: false,
})

export const parentIssueColumn = createColumn({
  dataType: MemexColumnDataType.ParentIssue,
  id: SystemColumnId.ParentIssue,
  name: 'Parent issue',
  userDefined: false,
})

export const reviewersColumn = createColumn({
  dataType: MemexColumnDataType.Reviewers,
  id: SystemColumnId.Reviewers,
  name: 'Reviewers',
  userDefined: false,
})

export const milestoneColumn = createColumn({
  dataType: MemexColumnDataType.Milestone,
  id: SystemColumnId.Milestone,
  name: 'Milestone',
  userDefined: false,
})

export const stageColumn = createColumn({
  dataType: MemexColumnDataType.SingleSelect,
  id: StageColumnId,
  name: 'Stage',
  userDefined: true,
  settings: {
    options: stageOptions,
  },
})

export const teamColumn = createColumn({
  dataType: MemexColumnDataType.Text,
  id: TeamColumnId,
  name: 'Team',
  userDefined: true,
})

export const themeColumn = createColumn({
  dataType: MemexColumnDataType.Text,
  id: ThemeColumnId,
  name: 'Theme',
  userDefined: true,
  defaultColumn: false,
})

export const impactColumn = createColumn({
  dataType: MemexColumnDataType.Text,
  id: ImpactColumnId,
  name: 'Impact',
  userDefined: true,
  defaultColumn: false,
})

export const confidenceColumn = createColumn({
  dataType: MemexColumnDataType.Text,
  id: ConfidenceColumnId,
  name: 'Confidence',
  userDefined: true,
  defaultColumn: false,
})

export const effortColumn = createColumn({
  dataType: MemexColumnDataType.Text,
  id: EffortColumnId,
  name: 'Effort',
  userDefined: true,
  defaultColumn: false,
})

export const customTextColumn = createColumn({
  dataType: MemexColumnDataType.Text,
  id: CustomTextColumnId,
  name: 'Custom Text',
  userDefined: true,
  defaultColumn: false,
})

export const customNumberColumn = createColumn({
  dataType: MemexColumnDataType.Number,
  id: CustomNumberColumnId,
  name: 'Estimate',
  userDefined: true,
})

export const customDateColumn = createColumn({
  dataType: MemexColumnDataType.Date,
  id: CustomDateColumnId,
  name: 'Due Date',
  userDefined: true,
  defaultColumn: true,
})

export const customSingleSelectColumn = createColumn({
  dataType: MemexColumnDataType.SingleSelect,
  id: CustomSingleSelectColumnId,
  name: 'Aardvarks',
  userDefined: true,
  defaultColumn: false,
  settings: {
    options: aardvarkOptions,
  },
})

export const multiWordSingleSelectColumn = createColumn({
  dataType: MemexColumnDataType.SingleSelect,
  id: MultiWordColumnId,
  name: 'Neon Alpacas',
  userDefined: true,
  defaultColumn: false,
  settings: {
    options: aardvarkOptions,
  },
})

export const createCustomIterationColumn = () =>
  createColumn({
    dataType: MemexColumnDataType.Iteration,
    id: CustomIterationColumnId,
    name: 'Iteration',
    userDefined: true,
    defaultColumn: true,
    settings: {
      configuration: {
        duration: 14,
        startDay: 1,
        iterations: [
          {
            id: 'iteration-4',
            startDate: iteration4Date,
            duration: 14,
            title: 'Iteration 4',
            titleHtml: 'Iteration 4',
          },
          {
            id: 'iteration-5',
            startDate: iteration5Date,
            duration: 14,
            title: 'Iteration 5',
            titleHtml: 'Iteration 5',
          },
          {
            id: 'iteration-6',
            startDate: iteration6Date,
            duration: 14,
            title: 'Iteration 6',
            titleHtml: 'Iteration 6',
          },
        ],
        completedIterations: [
          {
            id: 'iteration-0',
            startDate: iteration0Date,
            duration: 14,
            title: 'Iteration 0',
            titleHtml: 'Iteration 0',
          },

          {
            id: 'iteration-1',
            startDate: iteration1Date,
            duration: 14,
            title: 'Iteration 1',
            titleHtml: 'Iteration 1',
          },
          {
            id: 'iteration-2',
            startDate: iteration2Date,
            duration: 14,
            title: 'Iteration 2',
            titleHtml: 'Iteration 2',
          },
          {
            id: 'iteration-3',
            startDate: iteration3Date,
            duration: 14,
            title: 'Iteration 3',
            titleHtml: 'Iteration 3',
          },
        ],
      },
    },
  })

export const createSecondaryIterationColumn = () =>
  createColumn({
    dataType: MemexColumnDataType.Iteration,
    id: SecondaryIterationColumnId,
    name: '3W Iteration',
    userDefined: true,
    defaultColumn: true,
    settings: {
      configuration: {
        duration: 21,
        startDay: 1,
        iterations: [
          {
            id: '3w-iteration-1',
            startDate: threeWeekIteration1Date,
            duration: 21,
            title: '3W Iteration 1',
            titleHtml: '3W Iteration 1',
          },
          {
            id: '3w-iteration-2',
            startDate: threeWeekIteration2Date,
            duration: 21,
            title: '3W Iteration 2',
            titleHtml: '3W Iteration 2',
          },
          {
            id: '3w-iteration-3',
            startDate: threeWeekIteration3Date,
            duration: 21,
            title: '3W Iteration 3',
            titleHtml: '3W Iteration 3',
          },
        ],
        completedIterations: [],
      },
    },
  })

const createCustomReasonColumn = () =>
  createColumn({
    dataType: MemexColumnDataType.Text,
    id: CustomReasonColumnId,
    name: 'Reason',
    userDefined: true,
    defaultColumn: true,
  })

export const customIterationColumn = createCustomIterationColumn()
export const secondaryIterationColumn = createSecondaryIterationColumn()
export const customReasonColumn = createCustomReasonColumn()

export const xssTextColumn = createColumn({
  dataType: MemexColumnDataType.Text,
  id: XssTestColumnId,
  name: 'Test <img src="asdf" onError="alert(\'Hi!\')" />',
  userDefined: true,
  defaultColumn: false,
})

export const startDateColumn = createColumn({
  dataType: MemexColumnDataType.Date,
  id: StartDateColumnId,
  name: 'Start Date',
  userDefined: true,
  defaultColumn: true,
})

export const endDateColumn = createColumn({
  dataType: MemexColumnDataType.Date,
  id: EndDateColumnId,
  name: 'End Date',
  userDefined: true,
  defaultColumn: true,
})

export const subIssuesProgressColumn = createColumn({
  dataType: MemexColumnDataType.SubIssuesProgress,
  id: SystemColumnId.SubIssuesProgress,
  name: 'Sub-issues progress',
  userDefined: false,
})
