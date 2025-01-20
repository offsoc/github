import {useContext} from 'react'

import {SortableItemContext} from '../context/SortableItemContext'

export const useSortableItem = () => {
  const context = useContext(SortableItemContext)
  if (!context) {
    throw new Error('useSortableItem must be used within a SortableItemContextProvider')
  }
  return context
}
