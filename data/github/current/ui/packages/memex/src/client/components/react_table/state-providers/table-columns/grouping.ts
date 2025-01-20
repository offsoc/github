import type {Row} from 'react-table'

import {buildGroups, groupItems} from '../../../../features/grouping/group-items'
import type {GroupingMetadataConfiguration} from '../../../../features/grouping/grouping-metadata-configurations'
import type {GroupingMetadataWithSource} from '../../../../features/grouping/types'
import {getEnabledFeatures} from '../../../../helpers/feature-flags'
import type {ColumnModel} from '../../../../models/column-model'
import type {TableDataType} from '../../table-data-type'
import type {CustomRowGrouping} from './types'

export function applyGroupNameToRowId<T extends object>(item: Row<T>, groupName: string): Row<T> {
  return {...item, id: `${groupName}-${item.id}`}
}

/**
 * Helper that returns a function that can be used as the `groupRows` key in the
 * UseCustomGroupByColumnOptions interface.
 */
export const buildGetGroupedRowsFunction = (
  columnModel: ColumnModel,
  config: GroupingMetadataConfiguration<Row<TableDataType>>,
) => {
  const {memex_table_without_limits} = getEnabledFeatures()
  return (
    rows: Array<Row<TableDataType>>,
  ): Array<CustomRowGrouping<TableDataType>> | Array<GroupingMetadataWithSource> => {
    if (memex_table_without_limits) {
      return buildGroups(rows, columnModel, config.getGroupingMetadata)
    } else {
      return groupItems(
        rows,
        columnModel,
        config.getGroupingMetadata,
        config.getAllGroupMetadata,
        applyGroupNameToRowId,
      )
    }
  }
}

/**
 * Helper that returns a function that can be used as the `groupValue` key in
 * the UseCustomGroupByColumnOptions interface.
 */
export const buildGetGroupValueFunction = (
  columnModel: ColumnModel,
  config: GroupingMetadataConfiguration<Row<TableDataType>>,
) => {
  return (row: Row<TableDataType>) => config.getGroupingMetadata(columnModel, row)
}
