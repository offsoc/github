import {groupItems} from '../../features/grouping/group-items'
import type {GroupingMetadataConfiguration} from '../../features/grouping/grouping-metadata-configurations'
import type {GroupingMetadataWithSource} from '../../features/grouping/types'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'

export const buildGetGroupedRowsFunctionForBoard = (
  columnModel: ColumnModel,
  config: GroupingMetadataConfiguration<MemexItemModel>,
) => {
  return (
    rows: Array<MemexItemModel> | ReadonlyArray<MemexItemModel>,
  ): Array<GroupingMetadataWithSource & {rows: ReadonlyArray<MemexItemModel>}> => {
    return groupItems(rows, columnModel, config.getGroupingMetadata, config.getAllGroupMetadata)
  }
}
