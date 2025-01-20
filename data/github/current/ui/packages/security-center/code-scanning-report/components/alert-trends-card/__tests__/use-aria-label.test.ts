import {renderHook} from '@testing-library/react'

import type {AlertTrendsResult} from '../use-alert-trends-query'
import {useAriaLabel} from '../use-aria-label'

describe('useAriaLabel', () => {
  it('returns the correct label when data is not loaded', () => {
    const data = undefined
    const {result} = renderHook(() => useAriaLabel('status', data))
    expect(result.current).toBe('Empty chart. Alert trends could not be loaded right now.')
  })

  it('returns the correct label when the chart is empty', () => {
    const data: AlertTrendsResult = []
    const {result} = renderHook(() => useAriaLabel('status', data))
    expect(result.current).toBe('Empty chart. There are no pull request alerts in this period.')
  })

  it('returns the correct label when the chart has series with no data', () => {
    const data: AlertTrendsResult = [
      {label: 'Unresolved and merged', data: []},
      {label: 'Fixed with autofix', data: []},
    ]

    const {result} = renderHook(() => useAriaLabel('status', data))

    const expected = [
      'Line chart describing pull request alert trends over time. It consists of 2 time series.',
      'The y-axis shows counts of alerts by status, with groups Unresolved and merged, Fixed with autofix.',
      'This chart data can only be accessed as a table.',
    ].join(' ')
    expect(result.current).toBe(expected)
  })

  it('returns the correct label when the chart has a single series', () => {
    const data: AlertTrendsResult = [
      {
        label: 'Unresolved and merged',
        data: [
          {x: '2024-01-01', y: 10},
          {x: '2024-02-01', y: 20},
        ],
      },
    ]

    const {result} = renderHook(() => useAriaLabel('status', data))

    const expected = [
      'Line chart describing pull request alert trends over time. It consists of 1 time series.',
      'The x-axis shows dates from Jan 1, 2024 to Feb 1, 2024.',
      'The y-axis shows counts of alerts by status, with groups Unresolved and merged.',
      'This chart data can only be accessed as a table.',
    ].join(' ')
    expect(result.current).toBe(expected)
  })

  it('returns the correct label when the chart has multiple series', () => {
    const data: AlertTrendsResult = [
      {
        label: 'Unresolved and merged',
        data: [
          {x: '2024-01-01', y: 10},
          {x: '2024-04-30', y: 20},
        ],
      },
      {
        label: 'Fixed with autofix',
        data: [
          {x: '2024-01-01', y: 10},
          {x: '2024-04-30', y: 20},
        ],
      },
    ]

    const {result} = renderHook(() => useAriaLabel('status', data))

    const expected = [
      'Line chart describing pull request alert trends over time. It consists of 2 time series.',
      'The x-axis shows dates from Jan 1, 2024 to Apr 30, 2024.',
      'The y-axis shows counts of alerts by status, with groups Unresolved and merged, Fixed with autofix.',
      'This chart data can only be accessed as a table.',
    ].join(' ')
    expect(result.current).toBe(expected)
  })
})
