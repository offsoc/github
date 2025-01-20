import {render} from '@github-ui/react-core/test-utils'
import {renderHook, screen} from '@testing-library/react'

import {type Dataset, EnablementTrendChart, type EnablementTrendChartProps, useAriaLabel} from '../EnablementTrendChart'

describe('EnablementTrendChart', () => {
  it('renders the comopnent with data', () => {
    const props: EnablementTrendChartProps = {
      state: 'ready',
      description: '',
      datasets: [
        {
          label: 'Alerts',
          data: [
            {x: '2023-01-01', y: 60},
            {x: '2023-01-15', y: 70},
            {x: '2023-02-01', y: 80},
            {x: '2023-02-15', y: 80},
            {x: '2023-03-01', y: 80},
            {x: '2023-03-15', y: 85},
          ],
        },
        {
          label: 'Security updates',
          data: [
            {x: '2023-01-01', y: 45},
            {x: '2023-01-15', y: 50},
            {x: '2023-02-01', y: 45},
            {x: '2023-02-15', y: 50},
            {x: '2023-03-01', y: 55},
            {x: '2023-03-15', y: 60},
          ],
        },
      ],
      trendValue: 10,
    }
    render(<EnablementTrendChart {...props} />)
    expect(screen.getByTestId('enablement-trend-chart')).toBeInTheDocument()
    expect(screen.getByTestId('trend-indicator-value')).toBeInTheDocument()
  })

  it('shows a loading spinner when state is loading', () => {
    const props: EnablementTrendChartProps = {
      state: 'loading',
      description: '',
      datasets: [],
      trendValue: 0,
    }
    render(<EnablementTrendChart {...props} />)
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
  })

  it('shows a warning when state is error', () => {
    const props: EnablementTrendChartProps = {
      state: 'error',
      description: '',
      datasets: [],
      trendValue: 0,
    }
    render(<EnablementTrendChart {...props} />)
    expect(screen.getByTestId('error-indicator')).toBeInTheDocument()
  })

  it('shows a notice when state is no-data', () => {
    const props: EnablementTrendChartProps = {
      state: 'no-data',
      description: '',
      datasets: [],
      trendValue: 0,
    }
    render(<EnablementTrendChart {...props} />)
    expect(screen.getByTestId('no-data-indicator')).toBeInTheDocument()
  })

  describe('useAriaLabel', () => {
    it('returns the correct label when the chart is empty', () => {
      const datasets: Dataset[] = []
      const {result} = renderHook(() => useAriaLabel(datasets))
      expect(result.current).toBe('Empty chart. There are no enabled features in this period.')
    })

    it('returns the correct label when the chart has a single dataset', () => {
      const datasets: Dataset[] = [
        {
          label: 'Advanced security',
          data: [
            {x: '2023-01-01', y: 60},
            {x: '2023-02-15', y: 80},
            {x: '2023-03-15', y: 85},
          ],
        },
      ]

      const {result} = renderHook(() => useAriaLabel(datasets))

      const expected = [
        'Line chart describing feature enablement trends over time. It consists of 1 time series.',
        'The x-axis shows dates from Jan 1, 2023 to Mar 15, 2023.',
        'The y-axis shows the percentage of repositories enabled with the Advanced security feature.',
      ].join(' ')
      expect(result.current).toBe(expected)
    })

    it('returns the correct label when the chart has multiple datasets', () => {
      const datasets: Dataset[] = [
        {
          label: 'Alerts',
          data: [
            {x: '2023-01-01', y: 60},
            {x: '2023-02-15', y: 80},
            {x: '2023-03-15', y: 85},
          ],
        },
        {
          label: 'Push protection',
          data: [
            {x: '2023-01-01', y: 45},
            {x: '2023-02-15', y: 50},
            {x: '2023-03-15', y: 60},
          ],
        },
      ]

      const {result} = renderHook(() => useAriaLabel(datasets))

      const expected = [
        'Line chart describing feature enablement trends over time. It consists of 2 time series.',
        'The x-axis shows dates from Jan 1, 2023 to Mar 15, 2023.',
        'The y-axis shows the percentage of repositories enabled with the Alerts and Push protection features.',
      ].join(' ')
      expect(result.current).toBe(expected)
    })
  })
})
