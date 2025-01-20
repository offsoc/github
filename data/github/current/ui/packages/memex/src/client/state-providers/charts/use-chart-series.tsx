import type {Series, SeriesData} from '@github-ui/insights-charts'

import type {
  MemexChartConfiguration,
  MemexChartOperation,
  MemexChartYAxisAggregate,
} from '../../api/charts/contracts/api'
import {resolveSortFunction} from '../../features/sorting/resolver'
import getInsightsColumnValues from '../../helpers/insights-column-values'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {isNumber} from '../../helpers/parsing'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'
import {getYAxisAggregateLabel} from '../../pages/insights/components/insights-configuration-pane/y-axis-selector'
import {useFindColumnByDatabaseId} from '../columns/use-find-column-by-database-id'
import {useMemexItems} from '../memex-items/use-memex-items'
import {applyMemexChartOperation} from './chart-helpers'

type GetGroupByColumnAggregateRowsByOperationArgs = {
  items: Readonly<Array<MemexItemModel>>
  xAxisColumnModel: ColumnModel
  yAxisColumnModel: ColumnModel
  groupByColumnModel: ColumnModel
  memexChartOperation: MemexChartOperation
  isChartCard: boolean
}

function getGroupByColumnAggregateRowsByOperation({
  items,
  xAxisColumnModel,
  yAxisColumnModel,
  groupByColumnModel,
  memexChartOperation,
  isChartCard,
}: GetGroupByColumnAggregateRowsByOperationArgs) {
  const rowValueMap = new Map<string, Map<string, Array<number>>>()
  const groups: Array<string> = []

  for (const item of items) {
    const columnData = item.columns

    // can have multiple values for columns like Assignees and Labels
    const xAxisValues = getInsightsColumnValues(xAxisColumnModel, columnData)
    // currently we only support one yAxisValue, eg: Estimate
    const yAxisValue = parseFloat(
      not_typesafe_nonNullAssertion(getInsightsColumnValues(yAxisColumnModel, columnData)[0]),
    )

    for (const xAxisValue of xAxisValues) {
      const childMap = rowValueMap.get(xAxisValue) ?? new Map<string, Array<number>>()
      if (!rowValueMap.get(xAxisValue)) {
        rowValueMap.set(xAxisValue, childMap)
      }

      const groupByValues = getInsightsColumnValues(groupByColumnModel, columnData)

      for (const groupByValue of groupByValues) {
        if (!groups.includes(groupByValue)) {
          groups.push(groupByValue)
        }
        const yValuesByGroupBy = childMap.get(groupByValue) ?? []

        if (!isNaN(yAxisValue)) {
          yValuesByGroupBy.push(yAxisValue)
        }

        childMap.set(groupByValue, yValuesByGroupBy)
      }
    }
  }
  const xCoordinates = Array.from(rowValueMap.keys())
  const series: Array<{data: Array<number>; name: string}> = groups.map(g => {
    return {name: g, data: []}
  })

  const rows: SeriesData = []

  for (const [key, values] of rowValueMap) {
    for (const groupByValue of groups) {
      const childValues = values.get(groupByValue)
      const value =
        childValues && childValues.length > 0 ? applyMemexChartOperation({memexChartOperation, values: childValues}) : 0
      if (childValues && childValues.length > 0) {
        rows.push([key, value, groupByValue])
      }
      series.find(s => s.name === groupByValue)?.data.push(value ?? 0)
    }
  }

  return isChartCard ? {xCoordinates, series} : rows
}

type GetAggregateRowsByOperationArgs = {
  items: Readonly<Array<MemexItemModel>>
  xAxisColumnModel: ColumnModel
  yAxisColumnModel: ColumnModel
  memexChartOperation: MemexChartOperation
  isChartCard: boolean
}

/**
 * Returns rows for a chart series, based on the given configuration operation.
 */
function getAggregateRowsByOperation({
  items,
  xAxisColumnModel,
  yAxisColumnModel,
  memexChartOperation,
  isChartCard,
}: GetAggregateRowsByOperationArgs) {
  const rowValueMap = new Map<string, Array<number>>()

  for (const item of items) {
    const columnData = item.columns

    // can have multiple values for columns like Assignees and Labels
    const xAxisValues = getInsightsColumnValues(xAxisColumnModel, columnData)
    // currently we only support one yAxisValue, eg: Estimate
    const yAxisValue = parseFloat(
      not_typesafe_nonNullAssertion(getInsightsColumnValues(yAxisColumnModel, columnData)[0]),
    )

    for (const xAxisValue of xAxisValues) {
      const yValuesByX = rowValueMap.get(xAxisValue) || []

      if (!isNaN(yAxisValue)) {
        yValuesByX.push(yAxisValue)
      }

      rowValueMap.set(xAxisValue, yValuesByX)
    }
  }

  const series = [{data: [] as Array<number>, name: 'Sum of Estimate'}]

  const xCoordinates = Array.from(rowValueMap.keys())

  const rows: SeriesData = []

  for (const [key, values] of rowValueMap) {
    if (values.length > 0) {
      rows.push([key, applyMemexChartOperation({memexChartOperation, values})])
    }
    series[0]?.data.push(applyMemexChartOperation({memexChartOperation, values}) ?? 0)
  }

  return isChartCard ? {series, xCoordinates} : rows
}

function getAggregateCountRows(
  items: Readonly<Array<MemexItemModel>>,
  xAxisColumnModel: ColumnModel,
  isChartCard: boolean,
) {
  const itemsMap: {[key: string]: number} = {}

  for (const item of items) {
    const xAxisValues = getInsightsColumnValues(xAxisColumnModel, item.columns)

    for (const xAxisValue of xAxisValues) {
      if (itemsMap[xAxisValue] === undefined) {
        itemsMap[xAxisValue] = 0
      }

      itemsMap[xAxisValue] += 1
    }
  }

  const series = [{data: [] as Array<number>, name: 'Sum of Estimate'}]
  const xCoordinates = Object.keys(itemsMap)

  const rows: SeriesData = []
  for (const xAxisValue of Object.keys(itemsMap)) {
    rows.push([xAxisValue, not_typesafe_nonNullAssertion(itemsMap[xAxisValue])])
    series[0]?.data.push(not_typesafe_nonNullAssertion(itemsMap[xAxisValue]))
  }
  return isChartCard ? {series, xCoordinates} : rows
}

function getGroupByAggregateCountRows(
  items: Readonly<Array<MemexItemModel>>,
  xAxisColumnModel: ColumnModel,
  groupByColumnModel: ColumnModel,
  isChartCard: boolean,
) {
  const itemsMap: {
    [key: string]: {
      [key: string]: number
    }
  } = {}
  const groups: Array<string> = []

  for (const item of items) {
    const xAxisValues = getInsightsColumnValues(xAxisColumnModel, item.columns)

    for (const xAxisValue of xAxisValues) {
      if (itemsMap[xAxisValue] === undefined) {
        itemsMap[xAxisValue] = {}
      }

      const groupByValues = getInsightsColumnValues(groupByColumnModel, item.columns)

      for (const groupByValue of groupByValues) {
        if (itemsMap[xAxisValue]?.[groupByValue] === undefined) {
          not_typesafe_nonNullAssertion(itemsMap[xAxisValue])[groupByValue] = 0
        }

        if (!groups.includes(groupByValue)) {
          groups.push(groupByValue)
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        not_typesafe_nonNullAssertion(itemsMap[xAxisValue])[groupByValue]! += 1
      }
    }
  }

  const xCoordinates = Object.keys(itemsMap)
  const series: Array<{data: Array<number>; name: string}> = groups.map(g => {
    return {name: g, data: []}
  })

  const rows: SeriesData = []

  for (const xAxisValue of Object.keys(itemsMap)) {
    for (const groupByValue of groups) {
      const value = not_typesafe_nonNullAssertion(not_typesafe_nonNullAssertion(itemsMap[xAxisValue])[groupByValue])
      if (value) {
        rows.push([xAxisValue, value, groupByValue])
      }
      series.find(s => s.name === groupByValue)?.data.push(value ?? 0)
    }
  }

  return isChartCard ? {xCoordinates, series} : rows
}

function getSeriesColumns(
  xAxisColumnModel?: ColumnModel,
  yAxisColumnModel?: ColumnModel,
  groupByColumnModel?: ColumnModel,
  memexChartOperation?: MemexChartOperation,
) {
  const columns = [{name: xAxisColumnModel?.name || 'Unknown', dataType: 'nvarchar'}]

  if (yAxisColumnModel && memexChartOperation && memexChartOperation !== 'count') {
    columns.push({
      name: getYAxisAggregateLabel(memexChartOperation, yAxisColumnModel.name),
      dataType: 'int',
    })
  } else {
    columns.push({
      name: 'Count',
      dataType: 'int',
    })
  }

  if (groupByColumnModel) {
    columns.push({name: groupByColumnModel.name || 'Unknown', dataType: 'nvarchar'})
  }

  return columns
}

/**
 * Memoization fails here since the observables from allItems and filteredItems
 * internal items aren't going to trigger a re-render, when they should.
 */
export function useChartSeries(
  configuration: MemexChartConfiguration,
  filteredItems: Readonly<Array<MemexItemModel>> | null,
) {
  const {items: allItems} = useMemexItems()
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()

  const xAxisColumn = configuration.xAxis.dataSource.column
  const groupByColumn = configuration.xAxis.groupBy?.column
  const yAxisOperationColumn = configuration.yAxis.aggregate?.columns?.[0]

  const xAxisColumnModel = isNumber(xAxisColumn) ? findColumnByDatabaseId(xAxisColumn) : undefined
  const groupByColumnModel = isNumber(groupByColumn) ? findColumnByDatabaseId(groupByColumn) : undefined
  const yAxisColumnModel = isNumber(yAxisOperationColumn) ? findColumnByDatabaseId(yAxisOperationColumn) : undefined
  const items = filteredItems === null ? allItems : filteredItems

  const seriesColumns = getSeriesColumns(
    xAxisColumnModel,
    yAxisColumnModel,
    groupByColumnModel,
    configuration.yAxis.aggregate.operation,
  )

  const seriesRows = getSeriesRows({
    items,
    xAxisColumnModel,
    yAxisColumnModel,
    groupByColumnModel,
    yAxisAggregate: configuration.yAxis.aggregate,
  })

  const series: Series = {columns: seriesColumns, rows: seriesRows as SeriesData, isSensitive: false}

  return {series}
}

function getSeriesRows({
  items,
  xAxisColumnModel,
  yAxisColumnModel,
  groupByColumnModel,
  yAxisAggregate,
  isChartCard = false,
}: {
  items: ReadonlyArray<MemexItemModel>
  xAxisColumnModel: ColumnModel | undefined
  yAxisColumnModel: ColumnModel | undefined
  groupByColumnModel: ColumnModel | undefined
  yAxisAggregate: MemexChartYAxisAggregate
  isChartCard?: boolean
}) {
  if (!xAxisColumnModel) {
    return []
  }

  const xAxisSortMethod = resolveSortFunction(xAxisColumnModel)

  /**
   * If the xAxisColumnModel has a sort method, we need to sort the items
   *
   * If the items are equal and we have a group by, we need to sort those items by the
   * group by as well
   */
  const sortedItems = xAxisSortMethod
    ? items.slice().sort((itemA, itemB) => {
        const itemARow = itemA
        const itemBRow = itemB

        const xAxisSortOrder = xAxisSortMethod(itemARow, itemBRow, false)
        if (xAxisSortOrder === 0 && groupByColumnModel) {
          const xAxisGroupBySortMethod = groupByColumnModel ? resolveSortFunction(groupByColumnModel) : undefined
          const value = xAxisGroupBySortMethod?.(itemARow, itemBRow, false) ?? xAxisSortOrder
          return value
        }
        return xAxisSortOrder
      })
    : items.slice()

  // if the yAxis operation is not count, ie: sum, average, min, max
  if (yAxisAggregate.operation !== 'count' && yAxisColumnModel) {
    return groupByColumnModel
      ? getGroupByColumnAggregateRowsByOperation({
          items: sortedItems,
          xAxisColumnModel,
          yAxisColumnModel,
          groupByColumnModel,
          memexChartOperation: yAxisAggregate.operation,
          isChartCard,
        })
      : getAggregateRowsByOperation({
          items: sortedItems,
          xAxisColumnModel,
          yAxisColumnModel,
          memexChartOperation: yAxisAggregate.operation,
          isChartCard,
        })
  }

  return groupByColumnModel
    ? getGroupByAggregateCountRows(sortedItems, xAxisColumnModel, groupByColumnModel, isChartCard)
    : getAggregateCountRows(sortedItems, xAxisColumnModel, isChartCard)
}

function getAxis(
  xAxisColumnModel?: ColumnModel,
  yAxisColumnModel?: ColumnModel,
  memexChartOperation?: MemexChartOperation,
) {
  const xAxis = {name: xAxisColumnModel?.name || 'Unknown', dataType: 'nvarchar'}
  let yAxis = {
    name: 'Count',
    dataType: 'int',
  }

  if (yAxisColumnModel && memexChartOperation && memexChartOperation !== 'count') {
    yAxis = {
      name: getYAxisAggregateLabel(memexChartOperation, yAxisColumnModel.name),
      dataType: 'int',
    }
  }
  return {xAxis, yAxis}
}

/**
 * Memoization fails here since the observables from allItems and filteredItems
 * internal items aren't going to trigger a re-render, when they should.
 */
export function useChartSeriesCardCharts(
  configuration: MemexChartConfiguration,
  filteredItems: Readonly<Array<MemexItemModel>> | null,
) {
  const {items: allItems} = useMemexItems()
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()

  const xAxisColumn = configuration.xAxis.dataSource.column
  const groupByColumn = configuration.xAxis.groupBy?.column
  const yAxisOperationColumn = configuration.yAxis.aggregate?.columns?.[0]

  const xAxisColumnModel = isNumber(xAxisColumn) ? findColumnByDatabaseId(xAxisColumn) : undefined
  const groupByColumnModel = isNumber(groupByColumn) ? findColumnByDatabaseId(groupByColumn) : undefined
  const yAxisColumnModel = isNumber(yAxisOperationColumn) ? findColumnByDatabaseId(yAxisOperationColumn) : undefined
  const items = filteredItems === null ? allItems : filteredItems

  const axis = getAxis(xAxisColumnModel, yAxisColumnModel, configuration.yAxis.aggregate.operation)

  const {series, xCoordinates} = getSeriesRows({
    items,
    xAxisColumnModel,
    yAxisColumnModel,
    groupByColumnModel,
    yAxisAggregate: configuration.yAxis.aggregate,
    isChartCard: true,
  }) as {series: Array<{data: Array<number>; name: string}>; xCoordinates: Array<string>}

  return {
    series: series.filter(s => {
      return s.data.length
    }),
    axis,
    xCoordinates,
  }
}
