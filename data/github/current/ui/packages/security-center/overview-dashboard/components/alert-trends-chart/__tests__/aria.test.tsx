import {generateAriaLabelForAlertTrends} from '../aria'
import type {AlertTrend} from '../fetch-types'

describe('generateAriaLabelForAlertTrends', () => {
  it('should generate an ARIA label for a line chart describing alert trends over time', () => {
    const datasets: AlertTrend[][] = [
      [
        {x: '10/17/2023', y: 10},
        {x: '10/20/2023', y: 15},
        {x: '10/23/2023', y: 20},
      ],
      [
        {x: '10/17/2023', y: 0},
        {x: '10/20/2023', y: 0},
        {x: '10/23/2023', y: 0},
      ],
      [
        {x: '10/17/2023', y: 5},
        {x: '10/20/2023', y: 2},
        {x: '10/23/2023', y: 3},
      ],
      [
        {x: '10/17/2023', y: 0},
        {x: '10/20/2023', y: 0},
        {x: '10/23/2023', y: 0},
      ],
    ]
    const expectedLabel =
      'Line chart describing open alert trends over time. It consists of 2 time series. The x-axis shows dates from Oct 17, 2023 to Oct 23, 2023. The y-axis shows counts of alerts with low, high severities. This chart data can only be accessed as a table.'
    const label = generateAriaLabelForAlertTrends(datasets, true)
    expect(label).toEqual(expectedLabel)
  })

  it('should return description for no data if array is empty', () => {
    const datasets: AlertTrend[][] = []
    const expectedLabel =
      'Empty chart. There are no open alerts in this period. This chart data can only be accessed as a table.'
    const label = generateAriaLabelForAlertTrends(datasets, true)
    expect(label).toEqual(expectedLabel)
  })

  it('should return description for error if isError is true', () => {
    const datasets: AlertTrend[][] = []
    const expectedLabel =
      'Empty chart. Alert trends could not be loaded right now. This chart data can only be accessed as a table.'
    const label = generateAriaLabelForAlertTrends(datasets, true, true)
    expect(label).toEqual(expectedLabel)
  })
})
