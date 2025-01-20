import {createContext, useContext} from 'react'

import type {FieldOperation} from '../api/view/contracts'
import type {ColumnModel} from '../models/column-model'
import type {MemexItemModel} from '../models/memex-item-model'

export type FieldAggregate = {
  /** The name of the field being aggregated */
  name: string
  /** The total sum of values */
  sum: number
  /** The largest number of decimal places among the aggregated inputs */
  maxDecimalPlaces: number
}

export const AggregationSettingsContext = createContext<{
  hideItemsCount: boolean
  toggleItemsCount: (viewNumber: number) => void
  sum: ReadonlyArray<ColumnModel>
  addFieldAggregation: (viewNumber: number, fieldOperation: FieldOperation, column: ColumnModel) => void
  removeFieldAggregation: (viewNumber: number, fieldOperation: FieldOperation, column: ColumnModel) => void
  isAggregationSettingsDirty: boolean
  getAggregatesForItems: (items: Readonly<Array<Pick<MemexItemModel, 'columns'>>>) => Array<FieldAggregate>
} | null>(null)

/**
 * This hook exposes the current fields that are contain the aggregations
 * applied to the views
 */
export const useAggregationSettings = () => {
  const ctx = useContext(AggregationSettingsContext)
  if (!ctx) {
    throw new Error('useAggregationSettings must be used within a AggregationSettingsContext')
  }
  return ctx
}
