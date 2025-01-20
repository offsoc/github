import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {ColumnData} from '../../api/columns/contracts/storage'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'
import {
  getGroupValuesForAssignees,
  getGroupValuesForIteration,
  getGroupValuesForLabels,
  getGroupValuesForSingleSelect,
} from './get-all-group-metadata'
import {
  getAssigneesGroupingMetadata,
  getDateGroupingMetadata,
  getIssueTypeGroupingMetadata,
  getIterationGroupingMetadata,
  getLabelGroupingMetadata,
  getMilestoneGroupingMetadata,
  getNumberGroupingMetadata,
  getParentIssueGroupingMetadata,
  getRepositoryGroupingMetadata,
  getSingleSelectGroupingMetadata,
  getTextGroupingMetadata,
  getTrackedByGroupingMetadata,
} from './get-grouping-metadata'
import type {GroupingMetadataWithSource} from './types'

export type GroupingMetadataConfiguration<TOriginalItem extends {id: number | string}> = {
  /**
   * Returns the value in the given column for the given item.
   * That value will be used to group the item with like values.
   */
  getGroupingMetadata: (column: ColumnModel, item: TOriginalItem) => Array<GroupingMetadataWithSource> | undefined

  /**
   * Returns all group details for the provided column, in sorted order.
   *
   * This is typically omitted, but can be used to render specific groups in a
   * specific order, regardless of whether or not the group contains any items.
   *
   * If this is omitted, then groups that don't contain any items will not be
   * rendered, with one exception: the group for items with no value set for the
   * grouped column will always be displayed.
   *
   * @param column The column model to use for grouping
   * @param allItems All items in the project. This is provided so that the grouping
   * can be determined when the column metadata is not enough to build all
   * groups. Assignees and labels use this since all possible assignees and labels
   * are not stored in the column metadata.
   */
  getAllGroupMetadata?: (
    column: ColumnModel,
    allItems?: Readonly<Array<MemexItemModel>>,
  ) => Array<GroupingMetadataWithSource> | undefined
}

type GroupableColumnDataType = Extract<
  MemexColumnDataType,
  | 'assignees'
  | 'date'
  | 'iteration'
  | 'labels'
  | 'milestone'
  | 'number'
  | 'repository'
  | 'singleSelect'
  | 'text'
  | 'trackedBy'
  | 'issueType'
  | 'parentIssue'
>

type UngroupableColumnDataType = Exclude<MemexColumnDataType, GroupableColumnDataType>

// This type should be exhaustive of all possible column data types, given we're combining an `Extends` with an `Exclude`.
// This means if we add a new column data type, we'll get a type error in the `buildGroupingConfiguration` function below,
// until the new column data type is supported.
export type GroupingConfigurationByColumnDataType<TOriginalItem extends {id: number | string}> = {
  [K in GroupableColumnDataType]: GroupingMetadataConfiguration<TOriginalItem>
} & {
  [K in UngroupableColumnDataType]: undefined
}
/**
 * Builds the grouping configuration data for a particular view. This is used by the
 * table and roadmap views to determine the grouping metadata for each item, based on the column type.
 * Column types that do not support grouping are still included in the configuration for type exhaustiveness, but
 * will map to undefined for the grouping metadata.
 * If a new field type is added to MemexColumnDataType, we will get a compiler error until this function is updated.
 * @param getMemexItemColumnData A function that returns the columnData for the given item. For the table view this can
 * go from `Row<TableDataType> => MemexItemModel`, but for the roadmap view it just returns the item itself.
 * @param opts.useDistinctAssigneesGrouping Whether or not to use distinct grouping for assignees field vs. grouping by combinations of values.
 * @returns A map of column data type to grouping metadata configuration
 */
export function buildGroupingConfiguration<TOriginalItem extends {id: number | string}>(
  getMemexItemColumnData: (item: TOriginalItem) => ColumnData,
  opts?: {useDistinctAssigneesGrouping: boolean},
): GroupingConfigurationByColumnDataType<TOriginalItem> {
  return {
    [MemexColumnDataType.Assignees]: {
      getGroupingMetadata: (_column: ColumnModel, row: TOriginalItem) =>
        getAssigneesGroupingMetadata(getMemexItemColumnData(row), opts?.useDistinctAssigneesGrouping ?? false),
      getAllGroupMetadata: (column: ColumnModel, allItems?: Readonly<Array<MemexItemModel>>) =>
        getGroupValuesForAssignees(column, allItems),
    },
    [MemexColumnDataType.Date]: {
      getGroupingMetadata: (column: ColumnModel, row: TOriginalItem) =>
        getDateGroupingMetadata(column, getMemexItemColumnData(row)),
    },
    [MemexColumnDataType.Iteration]: {
      getGroupingMetadata: (column: ColumnModel, row: TOriginalItem) =>
        getIterationGroupingMetadata(column, getMemexItemColumnData(row)),
      getAllGroupMetadata: (column: ColumnModel) => getGroupValuesForIteration(column),
    },
    [MemexColumnDataType.Labels]: {
      getGroupingMetadata: (_column: ColumnModel, row: TOriginalItem) =>
        getLabelGroupingMetadata(getMemexItemColumnData(row)),
      getAllGroupMetadata: (column: ColumnModel, allItems?: Readonly<Array<MemexItemModel>>) =>
        getGroupValuesForLabels(column, allItems),
    },
    [MemexColumnDataType.LinkedPullRequests]: undefined,
    [MemexColumnDataType.Milestone]: {
      getGroupingMetadata: (_column: ColumnModel, row: TOriginalItem) =>
        getMilestoneGroupingMetadata(getMemexItemColumnData(row)),
    },
    [MemexColumnDataType.Number]: {
      getGroupingMetadata: (column: ColumnModel, row: TOriginalItem) =>
        getNumberGroupingMetadata(column, getMemexItemColumnData(row)),
    },
    [MemexColumnDataType.ParentIssue]: {
      getGroupingMetadata: (_column: ColumnModel, row: TOriginalItem) =>
        getParentIssueGroupingMetadata(getMemexItemColumnData(row)),
    },
    [MemexColumnDataType.Repository]: {
      getGroupingMetadata: (_column: ColumnModel, row: TOriginalItem) =>
        getRepositoryGroupingMetadata(getMemexItemColumnData(row)),
    },
    [MemexColumnDataType.Reviewers]: undefined,
    [MemexColumnDataType.SingleSelect]: {
      getGroupingMetadata: (column: ColumnModel, row: TOriginalItem) =>
        getSingleSelectGroupingMetadata(column, getMemexItemColumnData(row)),
      getAllGroupMetadata: (column: ColumnModel) => getGroupValuesForSingleSelect(column),
    },
    [MemexColumnDataType.SubIssuesProgress]: undefined,
    [MemexColumnDataType.Text]: {
      getGroupingMetadata: (column: ColumnModel, row: TOriginalItem) =>
        getTextGroupingMetadata(column, getMemexItemColumnData(row)),
    },
    [MemexColumnDataType.Title]: undefined,
    [MemexColumnDataType.TrackedBy]: {
      getGroupingMetadata: (_column: ColumnModel, row: TOriginalItem) =>
        getTrackedByGroupingMetadata(getMemexItemColumnData(row)),
    },
    [MemexColumnDataType.Tracks]: undefined,
    [MemexColumnDataType.IssueType]: {
      getGroupingMetadata: (_column: ColumnModel, row: TOriginalItem) =>
        getIssueTypeGroupingMetadata(getMemexItemColumnData(row)),
    },
  }
}
