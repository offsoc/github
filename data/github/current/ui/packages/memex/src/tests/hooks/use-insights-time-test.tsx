import {renderHook} from '@testing-library/react'
import cloneDeep from 'lodash-es/cloneDeep'
import {MemoryRouter} from 'react-router-dom'

import {useInsightsTime} from '../../client/pages/insights/hooks/use-insights-time'
import {useChartActions} from '../../client/state-providers/charts/use-chart-actions'
import type {ChartState} from '../../client/state-providers/charts/use-charts'
import {asMockHook} from '../mocks/stub-utilities'

jest.mock('../../client/state-providers/charts/use-chart-actions')

const configuration = {
  filter: '',
  type: 'stacked-area' as const,
  xAxis: {
    dataSource: {column: 'time' as const},
  },
  yAxis: {
    aggregate: {operation: 'count' as const},
  },
}
const initialChart: ChartState = {
  number: 1,
  name: 'Chart 1',
  localVersion: {configuration},
  serverVersion: {configuration},
}

const chartWithTime = cloneDeep(initialChart)
chartWithTime.localVersion.configuration['time'] = {
  period: 'custom',
  startDate: '2022-02-22',
  endDate: '2022-02-24',
}

const getInsightsTime = (chart: ChartState, initialEntries?: Array<string>) => {
  const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  )
  const {result} = renderHook(() => useInsightsTime(chart), {wrapper})
  return result.current
}

describe('useInsightsTime', () => {
  beforeEach(() => {
    asMockHook(useChartActions).mockReturnValue({
      updateLocalChartConfiguration: jest.fn(),
    })
  })
  it('returns time fields based on chart argument', () => {
    const initial = getInsightsTime(initialChart)
    expect(initial.period).toEqual('2W')
    expect(initial.startDate).toBeUndefined()
    expect(initial.endDate).toBeUndefined()

    const withTime = getInsightsTime(chartWithTime)
    expect(withTime.period).toEqual('custom')
    expect(withTime.startDate).toEqual('2022-02-22')
    expect(withTime.endDate).toEqual('2022-02-24')
  })

  it('overrides chart config time with search parameters', () => {
    const customTime = getInsightsTime(initialChart, [
      '/charts/1?period=custom&start_date=2020-01-01&end_date=2020-01-02',
    ])
    expect(customTime.period).toEqual('custom')
    expect(customTime.startDate).toEqual('2020-01-01')
    expect(customTime.endDate).toEqual('2020-01-02')

    const threeMonths = getInsightsTime(initialChart, ['/charts/1?period=3M'])
    expect(threeMonths.period).toEqual('3M')
    expect(threeMonths.startDate).toBeUndefined()
    expect(threeMonths.endDate).toBeUndefined()
  })

  it('ignores invalid chart config times from search params', () => {
    const {period, startDate, endDate} = getInsightsTime(initialChart, [
      '/charts/1?period=invalid&start_date=invalid&end_date=invalid',
    ])
    expect(period).toEqual('2W')
    expect(startDate).toBeUndefined()
    expect(endDate).toBeUndefined()
  })

  describe('if a valid start or end date is missing', () => {
    it('uses a fallback instead of "custom" period', () => {
      expect(initialChart.localVersion.configuration.time).toBeUndefined()
      const noStartDate = getInsightsTime(initialChart, ['/charts/1?period=custom&end_date=2020-01-01'])
      expect(noStartDate.period).toEqual('2W')
      expect(noStartDate.startDate).toBeUndefined()
      expect(noStartDate.endDate).toBeUndefined()
    })

    it('prefers the local configuration time over the default', () => {
      const threeMonthChart = cloneDeep(initialChart)
      threeMonthChart.localVersion.configuration['time'] = {period: '3M'}
      const noEndDate = getInsightsTime(threeMonthChart, ['/charts/1?period=custom&start_date=2020-01-01'])
      expect(noEndDate.period).toEqual('3M')
      expect(noEndDate.startDate).toBeUndefined()
      expect(noEndDate.endDate).toBeUndefined()
    })

    it('ignores malformed date parameters', () => {
      const invalidEndDate = getInsightsTime(initialChart, [
        '/charts/1?period=custom&start_date=2020-01-01&end_date=20-01-02',
      ])
      expect(invalidEndDate.period).toEqual('2W')
      expect(invalidEndDate.startDate).toBeUndefined()
      expect(invalidEndDate.endDate).toBeUndefined()
    })
  })

  it('updates the local config', () => {
    const {updateLocalChartConfiguration} = useChartActions()
    const {period} = getInsightsTime(initialChart)
    expect(updateLocalChartConfiguration).toHaveBeenCalledWith(initialChart.number, {time: {period}})
  })
})
