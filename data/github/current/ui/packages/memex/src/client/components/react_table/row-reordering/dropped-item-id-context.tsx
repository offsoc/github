import {createContext} from 'react'

/**
 * Used to generate the `isDropped` state in `useReorderableRow`. When a row is dropped, it is temporarily highlighted
 * as `isDropped` to make it look selected until the table can render the selected state, which takes a longer time
 * because table row selection is index-based (so it cannot be updated until after the row is finished moving).
 */
export const DroppedItemIdContext = createContext<number | null>(null)
