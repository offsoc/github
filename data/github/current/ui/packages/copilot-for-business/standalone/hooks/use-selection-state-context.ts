import {createContext, useContext} from 'react'
import type {Selectable} from './use-selectables'

export type StableRef<T> = Record<string, T>
type SelectionStateContextValue<T> = {
  allChecked: boolean
  checkCount: number
  isIndeterminate: boolean
  selectedItems: string[]
  selectables: Array<Selectable<T>>
  total: number
  isChecked: (selectable: Selectable<T>) => boolean
  checkOne: (selectable: Selectable<T>) => void
  checkAll: () => void
  uncheckAll: () => void
}
type ContextVal<T> = {
  selectionState: SelectionStateContextValue<T>
  updateStableRef: (newStableRefs: StableRef<T>) => void
  stableRef: StableRef<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SelectionStateContext = createContext<ContextVal<any> | null>(null)

export function useSelectionStateContext() {
  const context = useContext(SelectionStateContext)
  if (!context) {
    throw new Error('useSelectionStateContext must be used within a SelectionStateProvider')
  }
  return context
}
