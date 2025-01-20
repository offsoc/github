import type {Row} from 'react-table'

import {MemexColumnDataType, SystemColumnId} from '../api/columns/contracts/memex-column'
import type {TableDataType} from '../components/react_table/table-data-type'
import type {
  AssigneesGrouping,
  DateGrouping,
  FieldGrouping,
  IterationGrouping,
  RepositoryGrouping,
  TrackedByGrouping,
} from '../features/grouping/types'
import {Resources} from '../strings'
import {assertNever} from './assert-never'
import {joinOxford} from './join-oxford'
import {formatDateString, formatISODateString} from './parsing'
import {fullDisplayName} from './tracked-by-formatter'

/**
 * Check whether the "Add Item" input for a group should be enabled
 */
export function shouldDisableGroupFooter(context: FieldGrouping) {
  if (context.kind === 'empty') {
    // items can always be added to an empty group
    return false
  }

  // otherwise other groups can receive items
  return false
}

export function addNoGroupWhenGroupsDisabled(groups: Array<Row<TableDataType>>): Array<Row<TableDataType>> {
  const tableGroups = groups.filter(g => g.subRows.length > 0)
  if (
    tableGroups &&
    tableGroups.length > 0 &&
    tableGroups.every(g => shouldDisableGroupFooter(g.groupedSourceObject))
  ) {
    // If all the groups would have disabled footers, add the first group that doesn't (will always be the no-group group)
    const noGroupGroup = groups.find(group => !shouldDisableGroupFooter(group.groupedSourceObject))
    if (noGroupGroup) tableGroups.push(noGroupGroup)
  }
  return tableGroups
}

export const getGroupFooterPlaceholder = (group: Row<TableDataType>): string => {
  if (!shouldDisableGroupFooter(group.groupedSourceObject)) {
    return Resources.addItem
  }

  switch (group.groupedColumnId) {
    case SystemColumnId.Milestone:
      return Resources.cannotAddItemsWhenGroupByMilestone
    case SystemColumnId.IssueType:
      return Resources.cannotAddItemsWhenGroupByIssueType
    default:
      return Resources.addItem
  }
}

/** Temporary function to smooth transition between old format and new */
export function resolveRawTitleForGroupingContext(context: FieldGrouping): string {
  if (context.kind === 'empty') {
    return context.value.titleHtml
  }

  switch (context.dataType) {
    case MemexColumnDataType.Assignees:
      return joinOxford(context.value.map(u => u.login))
    case MemexColumnDataType.Date:
      return formatISODateString(context.value.date.value)
    case MemexColumnDataType.Iteration:
      return context.value.iteration.title
    case MemexColumnDataType.Milestone:
      return context.value.title
    case MemexColumnDataType.IssueType:
      return context.value.name
    case MemexColumnDataType.ParentIssue:
      return context.value.nwoReference
    case MemexColumnDataType.Number:
      return `${context.value.number.value}`
    case MemexColumnDataType.Repository:
      return context.value.nameWithOwner
    case MemexColumnDataType.SingleSelect:
      return context.value.option.name
    case MemexColumnDataType.Text:
      return context.value.text.raw
    case MemexColumnDataType.TrackedBy:
      return fullDisplayName(context.value)
    case MemexColumnDataType.Labels:
      return context.value.name
    default: {
      assertNever(context)
    }
  }
}

/**
 * This type is used to indicate when a grouping does not need to be handled by
 * `resolvePlaceholdersForDefaultHeader` below.
 *
 * You should add a type to this union type only after it is being rendered
 * elsewhere, otherwise you will get a typechecker error about this case not
 * being handled by the app.
 */
type GroupsRequiringDefaultHeader = Exclude<
  FieldGrouping,
  AssigneesGrouping | RepositoryGrouping | IterationGrouping | DateGrouping | TrackedByGrouping
>

/** Temporary function to smooth transition between old format and new */
export function resolveTitleForDefaultHeader(context: GroupsRequiringDefaultHeader): string {
  if (context.kind === 'empty') {
    return context.value.titleHtml
  }

  switch (context.dataType) {
    case MemexColumnDataType.SingleSelect:
      return context.value.option.nameHtml
    case MemexColumnDataType.Milestone:
      return context.value.title
    case MemexColumnDataType.IssueType:
      return context.value.name
    case MemexColumnDataType.ParentIssue:
      return context.value.nwoReference
    case MemexColumnDataType.Number:
      return `${context.value.number.value}`
    case MemexColumnDataType.Text:
      return context.value.text.html
    case MemexColumnDataType.Labels:
      return context.value.nameHtml
    default: {
      assertNever(context)
    }
  }
}

export function getGroupTestId(context: FieldGrouping) {
  if (context.kind === 'empty') {
    return context.value.titleHtml
  }

  switch (context.dataType) {
    case MemexColumnDataType.Assignees:
      return context.value.map(u => u.login).join('_')
    case MemexColumnDataType.Date:
      return formatDateString(context.value.date.value)
    case MemexColumnDataType.Iteration:
      return context.value.iteration.title
    case MemexColumnDataType.Milestone:
      return context.value.title
    case MemexColumnDataType.IssueType:
      return context.value.name
    case MemexColumnDataType.Number:
      return `${context.value.number.value}`
    case MemexColumnDataType.Repository:
      return context.value.nameWithOwner
    case MemexColumnDataType.SingleSelect:
      return context.value.option.name
    case MemexColumnDataType.Text:
      return context.value.text.raw
    case MemexColumnDataType.TrackedBy:
    case MemexColumnDataType.ParentIssue:
      return context.value.title
  }
}
