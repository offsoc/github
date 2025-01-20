import {createContext, useContext} from 'react'

import type {ColumnModel} from '../../../models/column-model'

/** Slice value to represent "No <fieldName>" is selected, i.e., no field value `no:fieldName` filter. */
export const NO_SLICE_VALUE = '_noValue'

/* value as string, null is no slice selected, or '_noValue' represents no field value `no:fieldName` filter. */
export type SliceValue = string | null

export const SliceByContext = createContext<{
  sliceField: ColumnModel | null
  setSliceField: (viewNumber: number, col: ColumnModel) => void
  /* Slice field value selection used to filter the project items. Will be -1 for exclusion filters. */
  sliceValue: SliceValue
  /* Sets the selected value for a project's slice field. Used to filter project items. */
  setSliceValue: (viewNumber: number, value: SliceValue) => void
  clearSliceField: (viewNumber: number) => void
  isSliceByDirty: boolean
  sliceByPanelWidth: number | undefined
  setSliceByPanelWidth: (width: number) => void
} | null>(null)

export const useSliceBy = () => {
  const ctx = useContext(SliceByContext)
  if (!ctx) throw new Error('useSliceBy must be used within a ViewProvider')
  return ctx
}
