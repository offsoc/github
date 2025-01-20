import {createContext, useContext} from 'react'

import type {FieldMoveUIType, FieldVisibilityUIType} from '../api/stats/contracts'
import type {ColumnModel} from '../models/column-model'

export const VisibleFieldsContext = createContext<{
  visibleFields: ReadonlyArray<ColumnModel>
  showField: (viewNumber: number, col: ColumnModel) => void
  hideField: (viewNumber: number, col: ColumnModel) => void
  moveField: (viewNumber: number, col: ColumnModel, position: number, exeLocation?: FieldMoveUIType) => void
  toggleField: (viewNumber: number, col: ColumnModel, position?: number, exeLocation?: FieldVisibilityUIType) => void
  isFieldVisible: (col: ColumnModel) => boolean
  isVisibleFieldsDirty: boolean

  /** Method to remove a field from a memex view */
  removeField: (field: ColumnModel) => Promise<void>
} | null>(null)

export const useVisibleFields = () => {
  const ctx = useContext(VisibleFieldsContext)
  if (!ctx) throw new Error('useVisibleFields must be used within a ViewProvider')
  return ctx
}
