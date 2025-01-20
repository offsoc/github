import {MemexColumnDataType} from '../api/columns/contracts/memex-column'

const supportedServerSortByColumnDataTypes = [
  MemexColumnDataType.Assignees,
  MemexColumnDataType.Date,
  MemexColumnDataType.Labels,
  MemexColumnDataType.Iteration,
  MemexColumnDataType.LinkedPullRequests,
  MemexColumnDataType.Milestone,
  MemexColumnDataType.Number,
  MemexColumnDataType.SingleSelect,
  MemexColumnDataType.Text,
  MemexColumnDataType.Title,
  MemexColumnDataType.Labels,
  MemexColumnDataType.Repository,
  MemexColumnDataType.Reviewers,
  MemexColumnDataType.IssueType,
  MemexColumnDataType.ParentIssue,
  MemexColumnDataType.SubIssuesProgress,
] as Array<MemexColumnDataType>

export function canServerSortByColumnType(columnDataType: MemexColumnDataType) {
  return supportedServerSortByColumnDataTypes.includes(columnDataType)
}

const supportedServerFilterByColumnDataTypes = [
  MemexColumnDataType.Assignees,
  MemexColumnDataType.Date,
  MemexColumnDataType.Iteration,
  MemexColumnDataType.Labels,
  MemexColumnDataType.LinkedPullRequests,
  MemexColumnDataType.Milestone,
  MemexColumnDataType.Number,
  MemexColumnDataType.SingleSelect,
  MemexColumnDataType.Text,
  MemexColumnDataType.Title,
  MemexColumnDataType.Repository,
  MemexColumnDataType.Reviewers,
  MemexColumnDataType.IssueType,
  MemexColumnDataType.ParentIssue,
] as Array<MemexColumnDataType>

export function canServerFilterByColumnType(columnDataType: MemexColumnDataType) {
  return supportedServerFilterByColumnDataTypes.includes(columnDataType)
}

const supportedServerGroupByColumnDataTypes = [
  MemexColumnDataType.Assignees,
  MemexColumnDataType.Date,
  MemexColumnDataType.Iteration,
  // MemexColumnDataType.Labels, // Grouping by Label name (regardless of repo) is supported on the server
  MemexColumnDataType.Milestone,
  MemexColumnDataType.Number,
  MemexColumnDataType.SingleSelect,
  MemexColumnDataType.Text,
  MemexColumnDataType.Repository,
  MemexColumnDataType.IssueType,
  MemexColumnDataType.ParentIssue,
] as Array<MemexColumnDataType>

export function canServerGroupByColumnType(columnDataType: MemexColumnDataType) {
  return supportedServerGroupByColumnDataTypes.includes(columnDataType)
}

// Slicing requires fields be groupable in Elasticsearch (supportedServerGroupByColumnDataTypes) for group value counts.
// We'll need to implement the ES query for fetching empty slice values from the project for all fields
// that don't have known values like single-select fields, and we can uncomment these when we do.
const supportedServerSliceByColumnDataTypes = [
  MemexColumnDataType.Assignees,
  MemexColumnDataType.Date,
  MemexColumnDataType.IssueType,
  MemexColumnDataType.Iteration,
  MemexColumnDataType.Labels,
  MemexColumnDataType.Milestone,
  MemexColumnDataType.Number,
  MemexColumnDataType.SingleSelect,
  MemexColumnDataType.Text,
  MemexColumnDataType.Repository,
  MemexColumnDataType.ParentIssue,
] as Array<MemexColumnDataType>

export function canServerSliceByColumnType(columnDataType: MemexColumnDataType) {
  return supportedServerSliceByColumnDataTypes.includes(columnDataType)
}
