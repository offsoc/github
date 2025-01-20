import type {MemexChartConfiguration} from '../../../client/api/charts/contracts/api'
import {getDirtyChartState} from '../../../client/state-providers/charts/chart-helpers'
import type {ChartState} from '../../../client/state-providers/charts/use-charts'

const defaultConfig: MemexChartConfiguration = {
  type: 'stacked-area',
  filter: '',
  xAxis: {
    dataSource: {
      column: 'time',
      sortOrder: 'asc',
    },
    groupBy: {
      column: 1,
      sortOrder: 'asc',
    },
  },
  yAxis: {
    aggregate: {
      operation: 'count',
      columns: [1],
      sortOrder: 'asc',
    },
  },
}
const defaultChart: ChartState = {
  name: 'Test Chart',
  number: 123,
  serverVersion: {configuration: {...defaultConfig}},
  localVersion: {configuration: {...defaultConfig}},
}

type DirtyChartState = ReturnType<typeof getDirtyChartState>

describe('getDirtyChartState', () => {
  it('does not mark charts as dirty when nothing changes', () => {
    expect(getDirtyChartState({...defaultChart})).toMatchObject<Partial<DirtyChartState>>({
      isDirty: false,
      isConfigurationDirty: false,
      isFilterDirty: false,
    })
  })
  it('marks chart as dirty when chart description changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.description = 'this is a chart'
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: false,
      isConfigurationDirty: false,
    })
  })

  it('marks chart as dirty when filter changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.filter = 'status:Done'
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: false,
      isFilterDirty: true,
    })
  })

  it('marks chart as dirty when chart type changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.type = 'column'
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: true,
    })
  })

  it('marks chart as dirty when chart X-axis changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.xAxis.dataSource.column = 5
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: true,
    })
  })

  it('marks chart as dirty when chart X-axis group by column changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.xAxis.groupBy = {column: 5, sortOrder: 'asc'}
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: true,
    })
  })

  it('marks chart as dirty when chart X-axis group by sort order changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.xAxis.groupBy = {column: 1, sortOrder: 'desc'}
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: true,
    })
  })

  it('marks chart as dirty when chart X-axis sort order changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.xAxis.dataSource.sortOrder = 'desc'
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: true,
    })
  })

  it('marks chart as dirty when chart Y-axis aggregate operation changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.yAxis.aggregate.operation = 'sum'
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: true,
    })
  })

  it('marks chart as dirty when chart Y-axis aggregate columns change', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.yAxis.aggregate.columns = [2]
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: true,
    })
  })

  it('marks chart as dirty when chart Y-axis sort order changes', () => {
    const chart = {...defaultChart}
    chart.localVersion.configuration.yAxis.aggregate.sortOrder = 'desc'
    expect(getDirtyChartState(chart)).toMatchObject<Partial<DirtyChartState>>({
      isDirty: true,
      isConfigurationDirty: true,
    })
  })
})
