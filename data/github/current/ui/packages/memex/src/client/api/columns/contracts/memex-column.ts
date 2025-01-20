import type {IterationConfiguration} from './iteration'
import type {ProgressConfiguration} from './progress'
import type {PersistedOption} from './single-select'

export const MemexColumnDataType = {
  // Special column types
  Assignees: 'assignees',
  Labels: 'labels',
  LinkedPullRequests: 'linkedPullRequests',
  Milestone: 'milestone',
  ParentIssue: 'parentIssue',
  Repository: 'repository',
  Reviewers: 'reviewers',
  SubIssuesProgress: 'subIssuesProgress',
  Title: 'title',
  Tracks: 'tracks',
  TrackedBy: 'trackedBy',
  // Generic column types
  Text: 'text',
  Number: 'number',
  Date: 'date',
  SingleSelect: 'singleSelect',
  Iteration: 'iteration',
  IssueType: 'issueType',
} as const
export type MemexColumnDataType = ObjectValues<typeof MemexColumnDataType>

export const SystemColumnId = {
  Assignees: 'Assignees',
  Labels: 'Labels',
  LinkedPullRequests: 'Linked pull requests',
  Milestone: 'Milestone',
  ParentIssue: 'Parent issue',
  Repository: 'Repository',
  Reviewers: 'Reviewers',
  Status: 'Status',
  SubIssuesProgress: 'Sub-issues progress',
  Title: 'Title',
  Tracks: 'Tracks',
  TrackedBy: 'Tracked by',
  // The user-facing name (which translates to system column id) of the IssueType column is "Type", but we refer to it in code as Issue Type
  // IssueType maps to an underlying issue_type entity and helps us to avoid overly generic variable names
  IssueType: 'Type',
} as const
export type SystemColumnId = ObjectValues<typeof SystemColumnId>

export interface ColumnSettings {
  width?: number
  options?: Array<PersistedOption>
  configuration?: IterationConfiguration
  progressConfiguration?: ProgressConfiguration
}

export interface MemexColumn {
  id: SystemColumnId | number
  databaseId: number
  name: string
  userDefined: boolean
  defaultColumn: boolean
  position?: number
  dataType: MemexColumnDataType
  settings?: ColumnSettings
  partialFailures?: PartialFailure
}

export type MemexProjectColumnId = number | SystemColumnId

/** A user indication that a memex column did not load fully */
export interface PartialFailure {
  message: string
}
