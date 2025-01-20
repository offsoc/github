import type {GroupingMetadataWithSource} from '../../features/grouping/types'
import type {DropSide} from '../../helpers/dnd-kit/drop-helpers'
import type {MemexItemModel} from '../../models/memex-item-model'

export interface BaseDropEvent {
  activeItem: MemexItemModel
}

export interface DropOnRowEvent extends BaseDropEvent {
  overItem: MemexItemModel
  side: DropSide
}

export interface DropOnGroupEvent extends BaseDropEvent {
  activeItemGroup: GroupingMetadataWithSource
  overItemGroup: GroupingMetadataWithSource
}

export interface DropOnGroupedRowEvent extends DropOnGroupEvent, DropOnRowEvent {}

export type DropEvent = DropOnRowEvent | DropOnGroupEvent | DropOnGroupedRowEvent

export const isDropOnGroup = (event: DropEvent | BaseDropEvent): event is DropOnGroupEvent =>
  'overItemGroup' in event && event.overItemGroup !== undefined

export const isDropOnRow = (event: DropEvent | BaseDropEvent): event is DropOnRowEvent =>
  'overItem' in event && event.overItem !== undefined
