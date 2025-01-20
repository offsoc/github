import type {SeriesData} from '@github-ui/insights-charts'
import {renderHook} from '@testing-library/react'
import {subDays} from 'date-fns'

import type {MemexChartConfiguration} from '../../../client/api/charts/contracts/api'
import type {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {createMemexItemModel, type MemexItemModel} from '../../../client/models/memex-item-model'
import {
  LeanHistoricalStateType,
  useLeanHistoricalChartSeries,
  useLeanHistoricalChartSeriesChartCard,
} from '../../../client/state-providers/charts/use-lean-historical-chart-series'
import {customNumberColumn} from '../../../mocks/data/columns'
import {generateLeanHistoricalInsightsData} from '../../../mocks/data/generated'
import {DefaultColumns} from '../../../mocks/mock-data'

// use a fixed date to avoid test flakiness
const now = new Date('2023-08-01T00:00:00.000Z')
const allItems = generateLeanHistoricalInsightsData({columns: DefaultColumns}, now).map(item =>
  createMemexItemModel(item),
)
let filteredItems: Array<MemexItemModel>

jest.useFakeTimers().setSystemTime(now)

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

// gets the last column of the series data
function getLastColumnValues(rows: SeriesData) {
  return rows.slice(-4).map(row => row[1])
}

function getDatabaseIdByColumnId(columnId: number | SystemColumnId) {
  return DefaultColumns.filter(column => column.id === columnId).map(column => column.databaseId)
}

const minDaysPerMonth = 28
const generatedRowsPerDay = 3
const defaultConfig: MemexChartConfiguration = {
  filter: '',
  type: 'stacked-area',
  xAxis: {
    dataSource: {
      column: 'time',
    },
    groupBy: {
      column: 12,
    },
  },
  yAxis: {
    aggregate: {
      operation: 'count',
    },
  },
  time: {
    period: '2W',
  },
}

describe('useLeanHistoricalChartSeries', () => {
  describe('with count aggregation', () => {
    it('should build series columns', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: defaultConfig,
          filteredItems: allItems,
          startDate: subDays(now, 14).toISOString(),
          endDate: now.toISOString(),
        }),
      )

      expect(result.current.series.columns).toEqual([
        {name: 'Date', dataType: 'datetime'},
        {name: 'count', dataType: 'int'},
        {name: 'State', dataType: 'nvarchar'},
      ])
    })

    it('should build empty series rows when theres no item data available', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: defaultConfig,
          filteredItems: [],
          startDate: subDays(now, 14).toISOString(),
          endDate: now.toISOString(),
        }),
      )
      expect(result.current.series.rows).toEqual([])
    })

    it('should build the expected number of rows for a 2W period', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: defaultConfig,
          filteredItems: allItems,
        }),
      )
      expect(result.current.series.rows.length).toBeGreaterThanOrEqual(14 * generatedRowsPerDay)
    })

    it('should build the expected number of rows for a 1M period', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: {
            ...defaultConfig,
            time: {
              period: '1M',
            },
          },
          filteredItems: allItems,
        }),
      )
      expect(result.current.series.rows.length).toBeGreaterThanOrEqual(minDaysPerMonth * generatedRowsPerDay)
    })

    it('should build the expected number of rows for a 3M period', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: {
            ...defaultConfig,
            time: {
              period: '3M',
            },
          },
          filteredItems: allItems,
        }),
      )
      expect(result.current.series.rows.length).toBeGreaterThanOrEqual(minDaysPerMonth * 3 * generatedRowsPerDay)
    })

    it('should build the expected number of rows for a MAX period', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: {
            ...defaultConfig,
            time: {
              period: 'max',
            },
          },
          filteredItems: allItems,
        }),
      )
      expect(result.current.series.rows.length).toBeGreaterThanOrEqual(minDaysPerMonth * 6 * generatedRowsPerDay)
    })

    it('should build the expected number of rows for a custom range', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: {
            ...defaultConfig,
            time: {
              period: 'custom',
            },
          },
          filteredItems,
          startDate: subDays(now, 7).toISOString(),
          endDate: now.toISOString(),
        }),
      )

      expect(result.current.series.rows.length).toBeGreaterThanOrEqual(7 * generatedRowsPerDay)
    })

    it('should build the expected rows when using "Count of items" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: defaultConfig,
          filteredItems: allItems,
        }),
      )

      const [notPlannedCount, closedCount, completedCount, openCount] = getLastColumnValues(result.current.series.rows)

      expect(notPlannedCount).toBeGreaterThan(0)
      expect(closedCount).toBeGreaterThan(0)
      expect(completedCount).toBeGreaterThan(0)
      expect(openCount).toBe(0)
    })

    it('should build the expected rows when using "Sum of a field" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: {
            ...defaultConfig,
            yAxis: {
              aggregate: {
                columns: getDatabaseIdByColumnId(customNumberColumn.id),
                operation: 'sum',
              },
            },
          },
          filteredItems: allItems,
        }),
      )

      const [notPlannedCount, closedCount, completedCount, openCount] = getLastColumnValues(result.current.series.rows)

      expect(notPlannedCount).toBeGreaterThan(100000)
      expect(closedCount).toBeGreaterThan(100000)
      expect(completedCount).toBeGreaterThan(100000)
      expect(openCount).toBe(0)
    })

    it('should build the expected rows when using "Average of a field" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: {
            ...defaultConfig,
            yAxis: {
              aggregate: {
                columns: getDatabaseIdByColumnId(customNumberColumn.id),
                operation: 'avg',
              },
            },
          },
          filteredItems: allItems,
        }),
      )

      const [notPlannedCount, closedCount, completedCount, openCount] = getLastColumnValues(result.current.series.rows)

      expect(notPlannedCount).toBeGreaterThan(10000)
      expect(closedCount).toBeGreaterThan(10000)
      expect(completedCount).toBeGreaterThan(10000)
      expect(openCount).toBe(0)
    })

    it('should build the expected rows when using "Minimum of a field" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: {
            ...defaultConfig,
            yAxis: {
              aggregate: {
                columns: getDatabaseIdByColumnId(customNumberColumn.id),
                operation: 'min',
              },
            },
          },
          filteredItems: allItems,
        }),
      )

      const [notPlannedCount, closedCount, completedCount, openCount] = getLastColumnValues(result.current.series.rows)

      expect(notPlannedCount).toBeGreaterThan(0)
      expect(closedCount).toBeGreaterThan(0)
      expect(completedCount).toBeGreaterThan(0)
      expect(openCount).toBe(0)
    })

    it('should build the expected rows when using "Maximum of a field" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeries({
          configuration: {
            ...defaultConfig,
            yAxis: {
              aggregate: {
                columns: getDatabaseIdByColumnId(customNumberColumn.id),
                operation: 'max',
              },
            },
          },
          filteredItems: allItems,
        }),
      )

      const [notPlannedCount, closedCount, completedCount, openCount] = getLastColumnValues(result.current.series.rows)

      expect(notPlannedCount).toBeGreaterThan(10000)
      expect(closedCount).toBeGreaterThan(10000)
      expect(completedCount).toBeGreaterThan(10000)
      expect(openCount).toBe(0)
    })
  })
})

describe('useLeanHistoricalChartSeriesChartCard', () => {
  describe('with count aggregation', () => {
    it('check index value of state type', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: defaultConfig,
          filteredItems: allItems,
        }),
      )

      const series = result.current.series

      expect(series.find(s => s.name === LeanHistoricalStateType.NOT_PLANNED)?.index).toBe(3)
      expect(series.find(s => s.name === LeanHistoricalStateType.CLOSED)?.index).toBe(2)
      expect(series.find(s => s.name === LeanHistoricalStateType.COMPLETED)?.index).toBe(1)
      expect(series.find(s => s.name === LeanHistoricalStateType.OPEN)?.index).toBe(0)
    })

    it('should build empty series when theres no item data available', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: defaultConfig,
          filteredItems: [],
          startDate: subDays(now, 14).toISOString(),
          endDate: now.toISOString(),
        }),
      )
      expect(result.current.series).toEqual([])
    })

    it('should build the expected number of series data for a 2W period', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: defaultConfig,
          filteredItems: allItems,
        }),
      )
      const series = result.current.series.flat()
      const count = series.reduce((acc, cur) => {
        return (acc += cur.data.length)
      }, 0)

      expect(count).toBeGreaterThanOrEqual(14 * generatedRowsPerDay)
    })

    it('should build the expected number of series data for a 1M period', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: {
            ...defaultConfig,
            time: {
              period: '1M',
            },
          },
          filteredItems: allItems,
        }),
      )
      const series = result.current.series.flat()
      const count = series.reduce((acc, cur) => {
        return (acc += cur.data.length)
      }, 0)

      expect(count).toBeGreaterThanOrEqual(minDaysPerMonth * generatedRowsPerDay)
    })

    it('should build the expected number of series data for a 3M period', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: {
            ...defaultConfig,
            time: {
              period: '3M',
            },
          },
          filteredItems: allItems,
        }),
      )
      const series = result.current.series.flat()
      const count = series.reduce((acc, cur) => {
        return (acc += cur.data.length)
      }, 0)

      expect(count).toBeGreaterThanOrEqual(minDaysPerMonth * 3 * generatedRowsPerDay)
    })

    it('should build the expected number of series data for a MAX period', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: {
            ...defaultConfig,
            time: {
              period: 'max',
            },
          },
          filteredItems: allItems,
        }),
      )
      const series = result.current.series.flat()
      const count = series.reduce((acc, cur) => {
        return (acc += cur.data.length)
      }, 0)

      expect(count).toBeGreaterThanOrEqual(minDaysPerMonth * 6 * generatedRowsPerDay)
    })

    it('should build the expected number of series data for a custom range', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: {
            ...defaultConfig,
            time: {
              period: 'custom',
            },
          },
          filteredItems,
          startDate: subDays(now, 7).toISOString(),
          endDate: now.toISOString(),
        }),
      )
      const series = result.current.series.flat()
      const count = series.reduce((acc, cur) => {
        return (acc += cur.data.length)
      }, 0)

      expect(count).toBeGreaterThanOrEqual(7 * generatedRowsPerDay)
    })

    it('should build the expected series data when using "Count of items" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: defaultConfig,
          filteredItems: allItems,
        }),
      )

      const series = result.current.series

      expect(series.find(s => s.name === LeanHistoricalStateType.NOT_PLANNED)?.data.pop()).toBeGreaterThan(0)
      expect(series.find(s => s.name === LeanHistoricalStateType.CLOSED)?.data.pop()).toBeGreaterThan(0)
      expect(series.find(s => s.name === LeanHistoricalStateType.COMPLETED)?.data.pop()).toBeGreaterThan(0)
      expect(series.find(s => s.name === LeanHistoricalStateType.OPEN)?.data.pop()).toBe(0)
    })

    it('should build the expected series data when using "Sum of a field" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: {
            ...defaultConfig,
            yAxis: {
              aggregate: {
                columns: getDatabaseIdByColumnId(customNumberColumn.id),
                operation: 'sum',
              },
            },
          },
          filteredItems: allItems,
        }),
      )

      const series = result.current.series

      expect(series.find(s => s.name === LeanHistoricalStateType.NOT_PLANNED)?.data.pop()).toBeGreaterThan(100000)
      expect(series.find(s => s.name === LeanHistoricalStateType.CLOSED)?.data.pop()).toBeGreaterThan(100000)
      expect(series.find(s => s.name === LeanHistoricalStateType.COMPLETED)?.data.pop()).toBeGreaterThan(100000)
      expect(series.find(s => s.name === LeanHistoricalStateType.OPEN)?.data.pop()).toBe(0)
    })

    it('should build the expected series data when using "Average of a field" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: {
            ...defaultConfig,
            yAxis: {
              aggregate: {
                columns: getDatabaseIdByColumnId(customNumberColumn.id),
                operation: 'avg',
              },
            },
          },
          filteredItems: allItems,
        }),
      )

      const series = result.current.series

      expect(series.find(s => s.name === LeanHistoricalStateType.NOT_PLANNED)?.data.pop()).toBeGreaterThan(10000)
      expect(series.find(s => s.name === LeanHistoricalStateType.CLOSED)?.data.pop()).toBeGreaterThan(10000)
      expect(series.find(s => s.name === LeanHistoricalStateType.COMPLETED)?.data.pop()).toBeGreaterThan(10000)
      expect(series.find(s => s.name === LeanHistoricalStateType.OPEN)?.data.pop()).toBe(0)
    })

    it('should build the expected series data when using "Minimum of a field" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: {
            ...defaultConfig,
            yAxis: {
              aggregate: {
                columns: getDatabaseIdByColumnId(customNumberColumn.id),
                operation: 'min',
              },
            },
          },
          filteredItems: allItems,
        }),
      )

      const series = result.current.series

      expect(series.find(s => s.name === LeanHistoricalStateType.NOT_PLANNED)?.data.pop()).toBeGreaterThan(0)
      expect(series.find(s => s.name === LeanHistoricalStateType.CLOSED)?.data.pop()).toBeGreaterThan(0)
      expect(series.find(s => s.name === LeanHistoricalStateType.COMPLETED)?.data.pop()).toBeGreaterThan(0)
      expect(series.find(s => s.name === LeanHistoricalStateType.OPEN)?.data.pop()).toBe(0)
    })

    it('should build the expected series data when using "Maximum of a field" Y-axis aggregation', () => {
      const {result} = renderHook(() =>
        useLeanHistoricalChartSeriesChartCard({
          configuration: {
            ...defaultConfig,
            yAxis: {
              aggregate: {
                columns: getDatabaseIdByColumnId(customNumberColumn.id),
                operation: 'max',
              },
            },
          },
          filteredItems: allItems,
        }),
      )

      const series = result.current.series

      expect(series.find(s => s.name === LeanHistoricalStateType.NOT_PLANNED)?.data.pop()).toBeGreaterThan(10000)
      expect(series.find(s => s.name === LeanHistoricalStateType.CLOSED)?.data.pop()).toBeGreaterThan(10000)
      expect(series.find(s => s.name === LeanHistoricalStateType.COMPLETED)?.data.pop()).toBeGreaterThan(10000)
      expect(series.find(s => s.name === LeanHistoricalStateType.OPEN)?.data.pop()).toBe(0)
    })
  })
})
