import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import {ItemType} from '../api/memex-items/item-type'

export function bulkColumnImmutable(columnType: MemexColumnDataType) {
  // These column data types are always immutable for bulk actions
  if (
    columnType === MemexColumnDataType.LinkedPullRequests ||
    columnType === MemexColumnDataType.Reviewers ||
    columnType === MemexColumnDataType.Tracks ||
    columnType === MemexColumnDataType.TrackedBy ||
    columnType === MemexColumnDataType.Repository ||
    columnType === MemexColumnDataType.Title
  ) {
    return true
  }
}

export function columnEditable(itemType: ItemType, columnType: MemexColumnDataType) {
  // These column data types are never editable
  if (
    columnType === MemexColumnDataType.LinkedPullRequests ||
    columnType === MemexColumnDataType.Reviewers ||
    columnType === MemexColumnDataType.Tracks ||
    columnType === MemexColumnDataType.TrackedBy ||
    columnType === MemexColumnDataType.SubIssuesProgress
  ) {
    return false
  }

  // Issue type column is not available for pull requests
  if (columnType === MemexColumnDataType.IssueType && itemType === ItemType.PullRequest) {
    return false
  }

  // Sub-issues are only supported by issues
  if (
    columnType === MemexColumnDataType.ParentIssue &&
    (itemType === ItemType.DraftIssue || itemType === ItemType.PullRequest)
  ) {
    return false
  }

  // The rest of the column data types' editability is dependent on their item type
  switch (itemType) {
    case ItemType.RedactedItem:
      return false
    case ItemType.DraftIssue:
      return true
    case ItemType.Issue:
    case ItemType.PullRequest:
      return columnType !== MemexColumnDataType.Repository
  }
}
