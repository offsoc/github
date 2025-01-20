import {createContext} from 'react'

export const SortableItemContext = createContext<{
  title: string
  index: number
  id: string | number
}>({title: '', index: 0, id: ''})
