import type {DropSide as DropSideType} from '../../helpers/dnd-kit/drop-helpers'

export type ReorderItemData =
  | {
      // the id of the item to insert before or after
      overItemId: number
      // "before" to insert above, "after" to insert below.
      side: DropSideType
    }
  | {
      // the id of the group that the item is being moved to
      // only used if moving to a group with no items
      overGroupId: string
    }
