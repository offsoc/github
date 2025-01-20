import {useCallback, useContext} from 'react'

import {DragAndDropContext} from '../context/DragAndDropContext'
import type {DragAndDropDirection, DragAndDropItem} from '../utils/types'

/**
 *
 * @returns a method that will provide the hooks for drag and drop items
 * when an item is selected.
 */
export const useDragAndDrop = (): {
  isDropTarget: (id: string | number) => boolean | null
  isBefore: (index: number) => boolean | null
  moveToPosition: (currentPosition: number, newPosition: number, isBefore?: boolean) => void
  direction: DragAndDropDirection
  items: DragAndDropItem[]
  openMoveModal: (title: string, index: number) => void
  moveModalItem: {title: string; index: number} | null
  isInDragMode: boolean
} => {
  const contextValue = useContext(DragAndDropContext)
  if (!contextValue) {
    throw Error(`useDragAndDrop can only be accessed from a DragAndDropContext.Provider component`)
  }
  const {overId, dragIndex, moveToPosition, items, direction, moveModalItem, openMoveModal, isInDragMode} = contextValue

  const isDropTarget = useCallback(
    (id: string | number) => {
      if (overId === id) {
        return true
      }
      return null
    },
    [overId],
  )
  const isBefore = (index: number) => dragIndex !== null && index < dragIndex

  return {isDropTarget, isBefore, moveToPosition, items, direction, moveModalItem, openMoveModal, isInDragMode}
}
