import type {Iteration} from '../../api/columns/contracts/iteration'
import type {MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {NumericValue} from '../../api/columns/contracts/number'
import type {PersistedOption} from '../../api/columns/contracts/single-select'
import type {DateValue} from '../../api/columns/contracts/storage'
import type {EnrichedText} from '../../api/columns/contracts/text'
import type {ExtendedRepository, IssueType, Label, Milestone, ParentIssue, User} from '../../api/common-contracts'
import type {TrackedByItem} from '../../api/issues-graph/contracts'

export type Group<TValue> = {
  kind: 'group'
  value: TValue
}

export type EmptySystemGroup = {
  kind: 'empty'
  value: {
    titleHtml: string
  }
}

export type EmptyCustomGroup<TColumnId = number> = {
  kind: 'empty'
  value: {
    titleHtml: string
    columnId: TColumnId
  }
}

export type AssigneesGrouping = {
  dataType: typeof MemexColumnDataType.Assignees
} & (Group<Array<User>> | EmptySystemGroup)

export type DateGrouping = {
  dataType: typeof MemexColumnDataType.Date
} & (Group<{date: DateValue; columnId: number}> | EmptyCustomGroup)

export type IterationGrouping = {
  dataType: typeof MemexColumnDataType.Iteration
} & (Group<{iteration: Iteration; columnId: number}> | EmptyCustomGroup)

export type LabelsGrouping = {
  dataType: typeof MemexColumnDataType.Labels
} & (Group<Label> | EmptySystemGroup)

export type MilestoneGrouping = {
  dataType: typeof MemexColumnDataType.Milestone
} & (Group<Milestone> | EmptySystemGroup)

export type IssueTypeGrouping = {
  dataType: typeof MemexColumnDataType.IssueType
} & (Group<IssueType> | EmptySystemGroup)

export type ParentIssueGrouping = {
  dataType: typeof MemexColumnDataType.ParentIssue
} & (Group<ParentIssue> | EmptySystemGroup)

export type NumberGrouping = {
  dataType: typeof MemexColumnDataType.Number
} & (Group<{number: NumericValue; columnId: number}> | EmptyCustomGroup)

export type RepositoryGrouping = {
  dataType: typeof MemexColumnDataType.Repository
} & (Group<ExtendedRepository> | EmptySystemGroup)

export type SingleSelectColumnId = number | typeof SystemColumnId.Status

type SingleSelectGroup =
  | Group<{option: PersistedOption; columnId: SingleSelectColumnId}>
  | EmptyCustomGroup<SingleSelectColumnId>

export type SingleSelectGrouping = {
  dataType: typeof MemexColumnDataType.SingleSelect
} & SingleSelectGroup

export type TextGrouping = {
  dataType: typeof MemexColumnDataType.Text
} & (Group<{text: EnrichedText; columnId: number}> | EmptyCustomGroup)

export type TrackedByGrouping = {
  dataType: typeof MemexColumnDataType.TrackedBy
} & (Group<TrackedByItem> | EmptySystemGroup)

/**
 * This type represents the supported grouping metadata available in the table
 * view.
 *
 * It is expected that the ColumnDefinitionBuilder module will handle
 * converting field values into this richer context, or the "default" value
 * which we currently support in the table layout.
 *
 * If you are adding a new group to this type ensure you also update
 * these places which will not be caught by the typechecker:
 *
 *  - `buildGroupingConfiguration` in `src/client/features/grouping/grouping-metadata-configurations.ts`
 *    to populate the `groupingConfiguration` for a field so that grouping
 *    will "light up" in the table
 *
 *  - `createEmptyGroup` in `src/client/grouping/helpers.ts` to ensure
 *    the "empty" group is rendered
 *
 *  - `UpdateColumnValueAction` in `src/client/api/columns/contracts/domain.ts`
 *    to craft the update shape the backend will expect to update a Tracked By
 *    value
 */
export type FieldGrouping =
  | AssigneesGrouping
  | DateGrouping
  | IterationGrouping
  | LabelsGrouping
  | MilestoneGrouping
  | NumberGrouping
  | RepositoryGrouping
  | SingleSelectGrouping
  | TextGrouping
  | TrackedByGrouping
  | IssueTypeGrouping
  | ParentIssueGrouping

export type GroupingMetadataWithSource = {
  /** A unique key to represent the grouping when rendering */
  value: string
  /**
   * The source object represents the data attached to this group, and should
   * be used when rendering the group in the table.
   *
   * The `kind` parameter should be used to determine how to render the field,
   * and the `kind: 'default'` code path is used for compatibility with the
   * custom fields that do not support richer formatting currently (e.g.
   * text/date/number grouping)
   */
  sourceObject: FieldGrouping
}
