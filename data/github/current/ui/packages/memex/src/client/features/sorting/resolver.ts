import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {assertNever} from '../../helpers/assert-never'
import type {LocalSort} from '../../hooks/use-view-state-reducer/types'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'
import {compareAssigneesField} from './comparers/assignees-field'
import {compareDateField} from './comparers/date-field'
import {compareIssueTypeField} from './comparers/issue-type-field'
import {compareIterationField} from './comparers/iteration-field'
import {compareLabelsField} from './comparers/labels-field'
import {compareLinkedPullRequestsField} from './comparers/linked-pull-requests-field'
import {compareMilestoneField} from './comparers/milestone-field'
import {compareNumberField} from './comparers/number-field'
import {compareParentIssueField} from './comparers/parent-issue-field'
import {compareRepositoryField} from './comparers/repository-field'
import {compareReviewersField} from './comparers/reviewers-field'
import {compareSingleSelectField} from './comparers/single-select-field'
import {compareSubIssuesProgressField} from './comparers/sub-issues-progress-field'
import {compareTextField} from './comparers/text-field'
import {compareTitleField} from './comparers/title-field'
import {compareTrackedByField} from './comparers/tracked-by-field'
import {compareTracksField} from './comparers/tracks-field'
import {stableSortFn} from './stable-sort-order'

type SortFn<T> = (a: T, b: T, desc?: boolean, isUnstableSort?: boolean) => number

/**
 * Resolve a sort function for the provided column type
 *
 * @param column column type to use for comparisons
 *
 * @returns sort function to compare project items
 */
export function resolveSortFunction(column: ColumnModel): SortFn<MemexItemModel> {
  switch (column.dataType) {
    case MemexColumnDataType.Title:
      return compareTitleField
    case MemexColumnDataType.Assignees:
      return compareAssigneesField
    case MemexColumnDataType.Labels:
      return compareLabelsField
    case MemexColumnDataType.LinkedPullRequests:
      return compareLinkedPullRequestsField
    case MemexColumnDataType.Reviewers:
      return compareReviewersField
    case MemexColumnDataType.Milestone:
      return compareMilestoneField
    case MemexColumnDataType.Repository:
      return compareRepositoryField
    case MemexColumnDataType.Tracks:
      return compareTracksField
    case MemexColumnDataType.TrackedBy:
      return compareTrackedByField
    case MemexColumnDataType.IssueType:
      return compareIssueTypeField
    case MemexColumnDataType.ParentIssue:
      return compareParentIssueField
    case MemexColumnDataType.SubIssuesProgress:
      return compareSubIssuesProgressField
    case MemexColumnDataType.Text:
      return (rowA, rowB, desc, isUnstableSort) => compareTextField(rowA, rowB, column, desc, isUnstableSort)
    case MemexColumnDataType.Number:
      return (rowA, rowB, desc, isUnstableSort) => compareNumberField(rowA, rowB, column, desc, isUnstableSort)
    case MemexColumnDataType.Date:
      return (rowA, rowB, desc, isUnstableSort) => compareDateField(rowA, rowB, column, desc, isUnstableSort)
    case MemexColumnDataType.SingleSelect:
      return (rowA, rowB, desc, isUnstableSort) => compareSingleSelectField(rowA, rowB, column, desc, isUnstableSort)
    case MemexColumnDataType.Iteration:
      return (rowA, rowB, desc, isUnstableSort) => compareIterationField(rowA, rowB, column, desc, isUnstableSort)
    default: {
      assertNever(column)
    }
  }
}

/**
 * Resolve a sort function for use across multiple sorted columns in priority order.
 */
export const resolveCombinedSortFunction =
  (sorts: ReadonlyArray<LocalSort>) => (a: MemexItemModel, b: MemexItemModel) => {
    // A more intuitive way would be to sort the whole input array by the sorts in reverse order (ie, sort secondary
    // then sort primary) but this way skips unecessary secondary sort checks when the primary sort values are different
    for (const {column, direction} of sorts) {
      const isDescending = direction === 'desc'
      const sortFunction = resolveSortFunction(column)

      // Stable sorting provides a tie-breaker when items apppear to have
      // the same value. Always use unstable sorting here to ensure we don't
      // incorrectly skip a secondary+ sort.
      let result = sortFunction(a, b, isDescending, true)

      // The individual column resolvers don't actually respect the sort direction, even though they take a `desc`
      // argument. We can't update them to do that, because `react-table` expects them to work the way they do. But
      // in this combined resolver, we must respect sort direction because it can be different for each column.

      // `result` is sort-ascending by default, so we multiply by `-1` to invert it) (because sorting logic only
      // depends on the sign of the result of the comparison, and -1 inverts a number's sign)
      if (isDescending) result *= -1

      if (result !== 0) return result // if the result is 0, continue into secondary+ sorts
    }

    // After all sorts have been applied, fall back to the item id when two items
    // appear to have the same value to ensure more stable sorting.
    // If no sorts are present, do not change original order.
    return sorts.length === 0 ? 0 : stableSortFn(a, b)
  }
