import {memo, useCallback, useMemo} from 'react'

import {getDecimalPlaces} from '../../utils/math'
import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import type {NumericValue} from '../api/columns/contracts/number'
import type {FieldOperation} from '../api/view/contracts'
import {AggregationSettingsContext} from '../hooks/use-aggregation-settings'
import {ViewStateActionTypes} from '../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../hooks/use-views'
import type {ColumnModel} from '../models/column-model'
import type {MemexItemModel} from '../models/memex-item-model'
import {useAllColumns} from '../state-providers/columns/use-all-columns'

export const AggregationSettingsProvider = memo<{
  children?: React.ReactNode
}>(function AggregationSettingsProvider({children}) {
  const {currentView, viewStateDispatch} = useViews()
  const {allColumns} = useAllColumns()

  const addFieldAggregation = useCallback(
    (viewNumber: number, fieldOperation: FieldOperation, column: ColumnModel): void => {
      viewStateDispatch({type: ViewStateActionTypes.AddFieldAggregation, viewNumber, fieldOperation, column})
    },
    [viewStateDispatch],
  )

  const removeFieldAggregation = useCallback(
    (viewNumber: number, fieldOperation: FieldOperation, column: ColumnModel): void => {
      viewStateDispatch({type: ViewStateActionTypes.RemoveFieldAggregation, viewNumber, fieldOperation, column})
    },
    [viewStateDispatch],
  )

  const toggleItemsCount = useCallback(
    (viewNumber: number): void => {
      viewStateDispatch({type: ViewStateActionTypes.ToggleItemsCount, viewNumber})
    },
    [viewStateDispatch],
  )

  const getAggregatesForItems = useCallback(
    (items: Readonly<Array<Pick<MemexItemModel, 'columns'>>>) => {
      const columnAggregates = []
      const numericFields = allColumns.filter(c => c.dataType === MemexColumnDataType.Number).map(c => c.id)

      const map: {[key: string]: number} = {}
      for (const field of currentView?.localViewStateDeserialized.aggregationSettings.sum ?? []) {
        const aggregate = {
          name: field.name,
          sum: 0,
          maxDecimalPlaces: 0,
        }

        for (const item of items) {
          const columnData = item.columns
          const number = columnData[field.id] as NumericValue
          // @ts-expect-error This is not statically known as a number in newer versions of typescript, we should validate it
          const index = numericFields.indexOf(field.id)
          map[field.name] = index

          aggregate.sum += number?.value ?? 0
          aggregate.maxDecimalPlaces = Math.max(aggregate.maxDecimalPlaces, getDecimalPlaces(number?.value ?? 0))
        }
        columnAggregates.push(aggregate)
      }
      return columnAggregates.sort((a, b) => (map[a.name] ?? 0) - (map[b.name] ?? 0))
    },
    [currentView?.localViewStateDeserialized.aggregationSettings.sum, allColumns],
  )

  return (
    <AggregationSettingsContext.Provider
      value={useMemo(() => {
        return {
          hideItemsCount: !!currentView?.localViewStateDeserialized.aggregationSettings.hideItemsCount,
          sum: currentView?.localViewStateDeserialized.aggregationSettings.sum ?? [],
          toggleItemsCount,
          addFieldAggregation,
          removeFieldAggregation,
          isAggregationSettingsDirty: currentView?.isAggregationSettingsDirty ?? false,
          getAggregatesForItems,
        }
      }, [
        currentView?.localViewStateDeserialized.aggregationSettings.hideItemsCount,
        currentView?.localViewStateDeserialized.aggregationSettings.sum,
        currentView?.isAggregationSettingsDirty,
        toggleItemsCount,
        addFieldAggregation,
        removeFieldAggregation,
        getAggregatesForItems,
      ])}
    >
      {children}
    </AggregationSettingsContext.Provider>
  )
})
