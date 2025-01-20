import {DragAndDropMoveModal} from './DragAndDropMoveModal'
import {MoveModalTrigger as DragAndDropMoveModalTrigger} from './MoveModalTrigger'
import {SortableListContainer} from './SortableListContainer'
import {SortableListItem} from './SortableListItem'
import {SortableListTrigger} from './SortableListTrigger'

/**
 * Wrapper for the sortable list and item components.
 */
export const DragAndDrop = Object.assign(SortableListContainer, {
  Item: SortableListItem,
  DragTrigger: SortableListTrigger,
  MoveModal: DragAndDropMoveModal,
  MoveModalTrigger: DragAndDropMoveModalTrigger,
})
