import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'

/** Returns true if the provided field type is supported by the 'Slice by' feature */
export const isSliceableField = (fieldType: MemexColumnDataType) => sliceByFieldTypes.has(fieldType)

/** Supported field data types for slicing */
const sliceByFieldTypes = new Set<MemexColumnDataType>([
  MemexColumnDataType.TrackedBy,
  MemexColumnDataType.Iteration,
  MemexColumnDataType.SingleSelect,
  MemexColumnDataType.Assignees,
  MemexColumnDataType.Labels,
  MemexColumnDataType.Milestone,
  MemexColumnDataType.Repository,
  MemexColumnDataType.Text,
  MemexColumnDataType.Number,
  MemexColumnDataType.Date,
  MemexColumnDataType.IssueType,
  MemexColumnDataType.ParentIssue,
])
