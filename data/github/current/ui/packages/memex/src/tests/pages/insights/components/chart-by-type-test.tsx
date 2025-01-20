import type {Series} from '@github-ui/insights-charts'
import {testIdProps} from '@github-ui/test-id-props'
import {render, screen} from '@testing-library/react'

import {ChartByType} from '../../../../client/pages/insights/components/chart-by-type'

const emptySeries: Series = {
  columns: [
    {name: 'Date', dataType: 'datetime'},
    {name: 'Count', dataType: 'int'},
    {name: 'Status', dataType: 'nvarchar'},
  ],
  rows: [],
  isSensitive: false,
}

test('renders bar-chart-memex-insights when requested', () => {
  render(<ChartByType chartType={'bar'} isLoading series={emptySeries} {...testIdProps('test-chart')} />)
  expect(screen.getByTestId('test-chart').tagName).toEqual('BAR-CHART-MEMEX-INSIGHTS')
})

test('renders bar-chart-memex-insights when stacked-bar is requested', () => {
  render(<ChartByType chartType={'stacked-bar'} isLoading series={emptySeries} {...testIdProps('test-chart')} />)
  expect(screen.getByTestId('test-chart').tagName).toEqual('BAR-CHART-MEMEX-INSIGHTS')
  expect(screen.getByTestId('test-chart')).toHaveAttribute('chart-stacked', '')
})

test('renders column-chart-memex-insights when requested', () => {
  render(<ChartByType chartType={'column'} isLoading series={emptySeries} {...testIdProps('test-chart')} />)
  expect(screen.getByTestId('test-chart').tagName).toEqual('COLUMN-CHART-MEMEX-INSIGHTS')
})

test('renders column-chart-memex-insights when stacked column is requested', () => {
  render(<ChartByType chartType={'stacked-column'} isLoading series={emptySeries} {...testIdProps('test-chart')} />)
  expect(screen.getByTestId('test-chart').tagName).toEqual('COLUMN-CHART-MEMEX-INSIGHTS')
  expect(screen.getByTestId('test-chart')).toHaveAttribute('chart-stacked', '')
})

test('renders line-chart-memex-insights when requested', () => {
  render(<ChartByType chartType={'line'} isLoading series={emptySeries} {...testIdProps('test-chart')} />)
  expect(screen.getByTestId('test-chart').tagName).toEqual('LINE-CHART-MEMEX-INSIGHTS')
})

test('renders stacked-area-chart-memex-insights when requested', () => {
  render(<ChartByType chartType={'stacked-area'} isLoading series={emptySeries} {...testIdProps('test-chart')} />)
  expect(screen.getByTestId('test-chart').tagName).toEqual('STACKED-AREA-CHART-MEMEX-INSIGHTS')
})
