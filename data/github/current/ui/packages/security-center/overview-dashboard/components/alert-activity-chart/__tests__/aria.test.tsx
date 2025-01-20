import {generateAriaLabelForAlertActivity} from '../aria'
import type {AlertActivityChartData} from '../fetch-types'

describe('generateAriaLabelForAlertActivity', () => {
  it('should generate an ARIA label for a bar chart describing alert activity over time', () => {
    const datasets: AlertActivityChartData[] = [
      {date: 'Oct 17', endDate: 'Oct 20', closed: 1, opened: 2},
      {date: 'Oct 21', endDate: 'Oct 24', closed: 3, opened: 4},
      {date: 'Oct 25', endDate: 'Oct 28', closed: 5, opened: 6},
    ]
    const expectedLabel =
      'Bar chart describing alert activity over time. It consists of 3 data points. The x-axis shows dates from Oct 17 to Oct 28. The y-axis shows counts of newly created alerts, closed alerts, and net alert activity. This chart data can only be accessed as a table.'
    const label = generateAriaLabelForAlertActivity(datasets)
    expect(label).toEqual(expectedLabel)
  })

  it('should return description for no data array is empty', () => {
    const datasets: AlertActivityChartData[] = []
    const expectedLabel =
      'Empty chart. There are no alert activities in this period. This chart data can only be accessed as a table.'
    const label = generateAriaLabelForAlertActivity(datasets)
    expect(label).toEqual(expectedLabel)
  })

  it('should return description for error if isError is true', () => {
    const datasets: AlertActivityChartData[] = []
    const expectedLabel =
      'Empty chart. Alert activity could not be loaded right now. This chart data can only be accessed as a table.'
    const label = generateAriaLabelForAlertActivity(datasets, true)
    expect(label).toEqual(expectedLabel)
  })
})
