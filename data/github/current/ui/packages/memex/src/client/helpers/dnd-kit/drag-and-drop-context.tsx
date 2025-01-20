import {createContext, useContext} from 'react'

import type {DropSide} from './drop-helpers'

export const DragAndDropContext = createContext<{
  dropSide: DropSide | null
  overId: string | number | null
  moveToPosition: (currentPosition: number, newPosition: number, before: boolean) => void
} | null>(null)

/**
 *
 * @returns a method that will provide the drop side of the item with the given id
 * when an item is being dragged over.
 */
export const useDragAndDrop = (): {
  getDropSide: (id: string | number) => DropSide | null
  moveToPosition: (currentPosition: number, newPosition: number, before: boolean) => void
} => {
  const contextValue = useContext(DragAndDropContext)
  if (!contextValue) {
    throw Error(`useDragAndDrop can only be accessed from a DropSideContext.Provider component`)
  }

  const getDropSide = (id: string | number) => {
    if (contextValue.overId === id) {
      return contextValue.dropSide
    }

    return null
  }

  return {getDropSide, moveToPosition: contextValue.moveToPosition}
}
