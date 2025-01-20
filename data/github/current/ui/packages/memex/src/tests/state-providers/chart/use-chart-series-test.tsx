import {renderHook} from '@testing-library/react'

import type {MemexChartConfiguration} from '../../../client/api/charts/contracts/api'
import {createMemexItemModel, type MemexItemModel} from '../../../client/models/memex-item-model'
import {applyMemexChartOperation} from '../../../client/state-providers/charts/chart-helpers'
import {useChartSeries, useChartSeriesCardCharts} from '../../../client/state-providers/charts/use-chart-series'
import {assigneesColumn, customNumberColumn, labelsColumn, stageColumn, statusColumn} from '../../../mocks/data/columns'
import {
  DefaultClosedPullRequest,
  DefaultCopyIssue,
  DefaultOpenIssue,
  IssueWithAFixedAssignee,
  OverflowingClosedIssue,
} from '../../../mocks/memex-items'
import {DefaultColumns} from '../../../mocks/mock-data'

const allItems = [
  createMemexItemModel(DefaultOpenIssue),
  createMemexItemModel(IssueWithAFixedAssignee),
  createMemexItemModel(DefaultCopyIssue),
  createMemexItemModel(OverflowingClosedIssue),
  createMemexItemModel(DefaultOpenIssue),
  createMemexItemModel(DefaultClosedPullRequest),
]
let chartConfiguration: MemexChartConfiguration
let filteredItems: Array<MemexItemModel>

jest.mock('../../../client/state-providers/memex-items/use-memex-items', () => ({
  __esModule: true,
  useMemexItems: jest.fn(() => {
    return {
      items: allItems,
    }
  }),
}))

jest.mock('../../../client/state-providers/columns/use-find-column-by-database-id', () => ({
  __esModule: true,
  useFindColumnByDatabaseId: jest.fn(() => {
    return {
      findColumnByDatabaseId: (databaseId: number) => DefaultColumns.find(c => c.databaseId === databaseId),
    }
  }),
}))

describe('useChartSeries', () => {
  describe('with count aggregation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'count', columns: [assigneesColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[1], allItems[2]]
    })

    it('should build series columns with two elements if there is no groupBy in configuration', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.columns).toEqual([
        {dataType: 'nvarchar', name: 'Status'},
        {dataType: 'int', name: 'Count'},
      ])
    })

    it('should build series columns with three elements if there is a groupBy in configuration', () => {
      chartConfiguration.xAxis.groupBy = {column: DefaultColumns[3].databaseId}

      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.columns).toEqual([
        {dataType: 'nvarchar', name: 'Status'},
        {dataType: 'int', name: 'Count'},
        {dataType: 'nvarchar', name: 'Labels'},
      ])
    })

    it('should build empty series rows if there are no items', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, []))

      expect(result.current.series.rows).toEqual([])
    })

    it('should build series rows from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, null))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 2],
        ['Done', 2],
        ['No Status', 2],
      ])
    })

    it('should return series rows for filtered items', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1],
        ['Done', 1],
        ['No Status', 1],
      ])
    })

    it('should return series rows for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: labelsColumn.databaseId}

      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1, 'enhancement ✨'],
        ['Done', 1, 'enhancement ✨'],
        ['Done', 1, 'tech debt'],
        ['No Status', 1, 'No Labels'],
      ])
    })
  })

  describe('with sum operation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'sum', columns: [customNumberColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[2], allItems[5]]
    })

    it('should build series rows from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, null))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 2],
        ['Done', 20],
      ])
    })

    it('should build series columns with y-axis label', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.columns).toEqual([
        {dataType: 'nvarchar', name: 'Status'},
        {dataType: 'int', name: 'Sum of Estimate'},
      ])
    })

    it('should return series rows for filtered items', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1],
        ['Done', 20],
      ])
    })

    it('should return series rows for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: stageColumn.databaseId}

      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1, 'No Stage'],
        ['Done', 10, 'No Stage'],
        ['Done', 10, 'Closed'],
      ])
    })
  })

  describe('with avg operation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'avg', columns: [customNumberColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[2], allItems[5]]
    })

    it('should build series rows from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, null))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1],
        ['Done', 10],
      ])
    })

    it('should build series columns with y-axis label', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.columns).toEqual([
        {dataType: 'nvarchar', name: 'Status'},
        {dataType: 'int', name: 'Average of Estimate'},
      ])
    })

    it('should return series rows for filtered items', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1],
        ['Done', 10],
      ])
    })

    it('should return series rows for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: stageColumn.databaseId}

      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1, 'No Stage'],
        ['Done', 10, 'No Stage'],
        ['Done', 10, 'Closed'],
      ])
    })
  })

  describe('with min operation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'min', columns: [customNumberColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[3], allItems[4]]
    })

    it('should build series rows from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, null))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1],
        ['Done', 10],
      ])
    })

    it('should build series columns with y-axis label', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.columns).toEqual([
        {dataType: 'nvarchar', name: 'Status'},
        {dataType: 'int', name: 'Minimum of Estimate'},
      ])
    })

    it('should return series rows for filtered items', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([['Backlog', 1]])
    })

    it('should return series rows for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: stageColumn.databaseId}

      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([['Backlog', 1, 'No Stage']])
    })
  })

  describe('with max operation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'max', columns: [customNumberColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[3], allItems[5]]
    })

    it('should build series rows from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, null))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1],
        ['Done', 10],
      ])
    })

    it('should build series columns with y-axis label', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.columns).toEqual([
        {dataType: 'nvarchar', name: 'Status'},
        {dataType: 'int', name: 'Maximum of Estimate'},
      ])
    })

    it('should return series rows for filtered items', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1],
        ['Done', 10],
      ])
    })

    it('should return series rows for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: stageColumn.databaseId}

      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1, 'No Stage'],
        ['Done', 10, 'Closed'],
      ])
    })
  })

  describe('applyMemexChartOperation', () => {
    it('sum: should return the sum of an array of numbers', () => {
      const result = applyMemexChartOperation({
        memexChartOperation: 'sum',
        values: [1, 2, 3],
      })

      expect(result).toEqual(6)
    })

    it('sum: should return 0 when passing empty `array` values', () => {
      const result = applyMemexChartOperation({
        memexChartOperation: 'sum',
        values: [],
      })

      expect(result).toEqual(0)
    })

    it('avg: should return the avg of an array of numbers', () => {
      const result = applyMemexChartOperation({
        memexChartOperation: 'avg',
        values: [3.9, 2, 8, 6.1],
      })

      expect(result).toEqual(5)
    })

    it('avg: should return 0 when passing empty `array` values', () => {
      const result = applyMemexChartOperation({
        memexChartOperation: 'avg',
        values: [],
      })

      expect(result).toEqual(null)
    })

    it('min: should return the min of an array of numbers', () => {
      const result = applyMemexChartOperation({
        memexChartOperation: 'min',
        values: [0.9, 1, 2, 3],
      })

      expect(result).toEqual(0.9)
    })

    it('min: should return 0 when passing empty `array` values', () => {
      const result = applyMemexChartOperation({
        memexChartOperation: 'min',
        values: [],
      })

      expect(result).toEqual(null)
    })

    it('max: should return the min of an array of numbers', () => {
      const result = applyMemexChartOperation({
        memexChartOperation: 'max',
        values: [1, 2, 3, 3.1],
      })

      expect(result).toEqual(3.1)
    })

    it('max: should return 0 when passing empty `array` values', () => {
      const result = applyMemexChartOperation({
        memexChartOperation: 'max',
        values: [],
      })

      expect(result).toEqual(null)
    })
  })
})

describe('useChartSeriesCardCharts', () => {
  describe('with count aggregation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'count', columns: [assigneesColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[1], allItems[2]]
    })

    it('should build series axis with two elements if there is no groupBy in configuration', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.axis).toEqual({
        xAxis: {dataType: 'nvarchar', name: 'Status'},
        yAxis: {dataType: 'int', name: 'Count'},
      })
    })

    it('should build empty series axis if there are no items', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, []))

      expect(result.current.series).toEqual([])
    })

    it('should build series from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, null))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [2, 2, 2]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })

    it('should return series for filtered items', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [1, 1, 1]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })

    it('should return series for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: labelsColumn.databaseId}

      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.series).toEqual([
        {name: 'enhancement ✨', data: [1, 1, 0]},
        {name: 'tech debt', data: [0, 1, 0]},
        {name: 'No Labels', data: [0, 0, 1]},
      ])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })
  })

  describe('with sum operation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'sum', columns: [customNumberColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[2], allItems[5]]
    })

    it('should build series from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, null))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [2, 20, 0]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })

    it('should build series axis with y-axis label', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.axis).toEqual({
        xAxis: {dataType: 'nvarchar', name: 'Status'},
        yAxis: {dataType: 'int', name: 'Sum of Estimate'},
      })
    })

    it('should return series for filtered items', () => {
      const {result} = renderHook(() => useChartSeries(chartConfiguration, filteredItems))

      expect(result.current.series.rows).toEqual([
        ['Backlog', 1],
        ['Done', 20],
      ])
    })

    it('should return series for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: stageColumn.databaseId}

      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.series).toEqual([
        {name: 'No Stage', data: [1, 10]},
        {name: 'Closed', data: [0, 10]},
      ])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done'])
    })
  })

  describe('with avg operation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'avg', columns: [customNumberColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[2], allItems[5]]
    })

    it('should build series from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, null))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [1, 10, 0]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })

    it('should build series axis with y-axis label', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.axis).toEqual({
        xAxis: {dataType: 'nvarchar', name: 'Status'},
        yAxis: {dataType: 'int', name: 'Average of Estimate'},
      })
    })

    it('should return series for filtered items', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [1, 10]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done'])
    })

    it('should return series for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: stageColumn.databaseId}

      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.series).toEqual([
        {name: 'No Stage', data: [1, 10]},
        {name: 'Closed', data: [0, 10]},
      ])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done'])
    })
  })

  describe('with min operation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'min', columns: [customNumberColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[3], allItems[4]]
    })

    it('should build series from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, null))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [1, 10, 0]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })

    it('should build series axis with y-axis label', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.axis).toEqual({
        xAxis: {dataType: 'nvarchar', name: 'Status'},
        yAxis: {dataType: 'int', name: 'Minimum of Estimate'},
      })
    })

    it('should return series for filtered items', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [1, 0]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'No Status'])
    })

    it('should return series for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: stageColumn.databaseId}

      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))
      expect(result.current.series).toEqual([{name: 'No Stage', data: [1, 0]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'No Status'])
    })
  })

  describe('with max operation', () => {
    beforeEach(() => {
      chartConfiguration = {
        filter: '',
        type: 'column',
        xAxis: {dataSource: {column: statusColumn.databaseId}},
        yAxis: {aggregate: {operation: 'max', columns: [customNumberColumn.databaseId]}},
      }

      filteredItems = [allItems[0], allItems[3], allItems[5]]
    })

    it('should build series from all items if items are not filtered', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, null))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [1, 10, 0]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })

    it('should build series axis with y-axis label', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.axis).toEqual({
        xAxis: {dataType: 'nvarchar', name: 'Status'},
        yAxis: {dataType: 'int', name: 'Maximum of Estimate'},
      })
    })

    it('should return series for filtered items', () => {
      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.series).toEqual([{name: 'Sum of Estimate', data: [1, 10, 0]}])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })

    it('should return series for filtered items with groupBy', () => {
      chartConfiguration.xAxis.groupBy = {column: stageColumn.databaseId}

      const {result} = renderHook(() => useChartSeriesCardCharts(chartConfiguration, filteredItems))

      expect(result.current.series).toEqual([
        {name: 'No Stage', data: [1, 0, 0]},
        {name: 'Closed', data: [0, 10, 0]},
      ])
      expect(result.current.xCoordinates).toEqual(['Backlog', 'Done', 'No Status'])
    })
  })
})
