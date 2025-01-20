import type {GroupingMetadataWithSource} from '../features/grouping/types'
import type {GroupId} from '../state-providers/memex-items/queries/query-keys'
import type {Resources} from '../strings'
import type {ColumnModel} from './column-model'
import type {MemexItemModel} from './memex-item-model'

export type ItemDataForVerticalColumn = {
  items: ReadonlyArray<MemexItemModel>
  groupId?: GroupId
  totalCount?: number
}

export type ItemsGroupedByVerticalColumn = Readonly<{
  [k: string]: ItemDataForVerticalColumn
}>

type BaseHorizontalGroup = {
  isCollapsed: boolean
  itemsByVerticalGroup: ItemsGroupedByVerticalColumn
  rows: ReadonlyArray<MemexItemModel>
}

/**
 * Merging this with value and sourceObject to make it a bit easier to interact with them
 */
export type UngroupedHorizontalGroup = BaseHorizontalGroup & {
  value: typeof Resources.undefined
  sourceObject?: undefined
}

/**
 * We optionally include a `serverGroupId` when the group is dervied from a PWL group provided by the server
 */
export type GroupedHorizontalGroup = GroupingMetadataWithSource & BaseHorizontalGroup & {serverGroupId?: string}
export type HorizontalGroup = GroupedHorizontalGroup | UngroupedHorizontalGroup

export type HorizontalGrouping =
  | {
      isHorizontalGrouped: true
      horizontalGroupedByColumn: ColumnModel
      allItemsByVerticalGroup: ItemsGroupedByVerticalColumn
      horizontalGroups: ReadonlyArray<Readonly<GroupedHorizontalGroup>>
    }
  | {
      isHorizontalGrouped: false
      allItemsByVerticalGroup: ItemsGroupedByVerticalColumn
      horizontalGroups: [Readonly<UngroupedHorizontalGroup>]
    }
