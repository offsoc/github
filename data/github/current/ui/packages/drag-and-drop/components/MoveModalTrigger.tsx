import type React from 'react'

import {useDragAndDrop} from '../hooks/use-drag-and-drop'
import {useSortableItem} from '../hooks/use-sortable-item'

export interface MoveModalTriggerProps<T> {
  /**
   * The clickable component that will trigger the move modal to open
   */
  Component: T
}

/**
 * A trigger component that opens the move modal when clicked.
 *
 * @param props MoveModalTriggerProps
 */
export const MoveModalTrigger = <T extends React.ElementType>({
  Component,
  ...props
}: MoveModalTriggerProps<T> & React.ComponentProps<T>) => {
  const {title, index} = useSortableItem()
  const {items, openMoveModal} = useDragAndDrop()

  const openDialog = () => {
    openMoveModal(title, index)
  }

  if (items.length === 1) return null

  return (
    <>
      <Component {...props} onClick={openDialog} />
    </>
  )
}
