import {act, renderHook} from '@testing-library/react'

import {useInsightsChartName} from '../../../../client/pages/insights/hooks/use-insights-chart-name'
import {createTrackableChart} from '../../../../client/state-providers/charts/chart-state-provider'
import {useChartActions} from '../../../../client/state-providers/charts/use-chart-actions'

let chartStateContext: any
let chartStateInteractionsContext: any

const customChart = createTrackableChart({
  name: 'My custom chart',
  number: 1,
  configuration: {
    filter: '',
    type: 'column',
    xAxis: {dataSource: {column: 1}},
    yAxis: {aggregate: {operation: 'sum', columns: [2]}},
  },
})

jest.mock('../../../../client/state-providers/charts/use-charts', () => ({
  __esModule: true,
  useCharts: jest.fn(() => chartStateContext),
}))
jest.mock('../../../../client/state-providers/charts/use-chart-actions', () => ({
  __esModule: true,
  useChartActions: jest.fn(() => chartStateInteractionsContext),
}))

describe('useInsightsChartName', () => {
  beforeEach(() => {
    chartStateInteractionsContext = {
      updateChartName: {perform: jest.fn(), status: {current: {status: 'succeeded'}}},
    }
  })

  it('should chartName by chart configuration number', () => {
    const {result} = renderHook(() => useInsightsChartName(customChart))

    expect(result.current.chartName).toBe('My custom chart')
    expect(useChartActions).toHaveBeenCalled()
  })

  it('should set local chartName', () => {
    const {result} = renderHook(() => useInsightsChartName(customChart))

    act(() => {
      result.current.setLocalChartName('My new awesome chart')
    })

    expect(result.current.chartName).toBe('My new awesome chart')
  })

  it('should save chartName', async () => {
    const {result} = renderHook(() => useInsightsChartName(customChart))

    act(() => result.current.setLocalChartName('My new super chart'))

    await act(async () => {
      await result.current.saveChartName()
    })

    expect(result.current.chartName).toBe('My new super chart')
    expect(chartStateInteractionsContext.updateChartName.perform).toHaveBeenCalled()
  })

  it('should revert local chartName', () => {
    const {result} = renderHook(() => useInsightsChartName(customChart))

    act(() => {
      result.current.setLocalChartName('My new super chart')
      result.current.revertChartName()
    })

    expect(result.current.chartName).toBe('My custom chart')
  })

  it('should revert local chartName if saving empty string', async () => {
    const {result} = renderHook(() => useInsightsChartName(customChart))

    act(() => {
      result.current.setLocalChartName('')
    })
    await act(async () => {
      await result.current.saveChartName()
    })
    expect(result.current.chartName).toBe('My custom chart')
  })

  it('should revert local chartName if saving whitespace', async () => {
    const {result} = renderHook(() => useInsightsChartName(customChart))

    act(() => {
      result.current.setLocalChartName('   ')
    })
    await act(async () => {
      await result.current.saveChartName()
    })

    expect(result.current.chartName).toBe('My custom chart')
  })
})
