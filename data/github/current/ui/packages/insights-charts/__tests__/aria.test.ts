/* eslint @typescript-eslint/no-explicit-any: off */

import {generateAriaLabelFromCategoricalData, generateAriaLabelFromTimeSeriesData} from '../src/aria'
import type {SeriesDataItem} from '../src/types'

describe('Aria tests', () => {
  it('generates time series data aria text as expected', () => {
    const data = {
      columns: [
        {
          name: 'Date',
          dataType: 'datetimeoffset',
        },
        {
          name: 'Count',
          dataType: 'int',
        },
      ],
      rows: [
        ['2020-01-01', 10],
        ['2020-01-02', 20],
        ['2020-01-03', 30],
        ['2020-01-04', 40],
        ['2020-01-05', 50],
      ],
    }

    const earliestDate = humanReadableDate(Date.parse('2020-01-01'))
    const latestDate = humanReadableDate(Date.parse('2020-01-05'))

    const seriesData = data.rows as SeriesDataItem[]
    const {datasets} = formatTimeSeriesData(seriesData, 'Y value')
    const actual = generateAriaLabelFromTimeSeriesData({datasets}, seriesData, 'bar', ['Datetime', 'Amount'])

    const expected = `bar chart describing time series data. It consists of 1 series. The x-axis shows time from ${earliestDate} to ${latestDate}. The y-axis shows data of type Amount with a minimum value of 10 and a maximum value of 50. This chart data can only be accessed as a table.`
    expect(actual).toBe(expected)
  })

  it('generates categorical series data aria text as expected', () => {
    const data = {
      columns: [
        {
          name: 'Date',
          dataType: 'datetimeoffset',
        },
        {
          name: 'Count',
          dataType: 'int',
        },
      ],
      rows: [
        ['2020-01-01', 10],
        ['2020-01-02', 20],
        ['2020-01-03', 30],
        ['2020-01-04', 40],
        ['2020-01-05', 50],
      ],
    }

    const seriesData = data.rows as SeriesDataItem[]
    const {datasets} = formatCategoricalData(seriesData, 'Y value')
    const actual = generateAriaLabelFromCategoricalData({datasets}, seriesData, 'bar', ['Datetime', 'Amount'])

    const expected = `bar chart describing discrete data. It consists of 1 series. The x-axis shows Datetime. The y-axis shows Amount with a minimum value of 10 and a maximum value of 50. This chart data can only be accessed as a table.`
    expect(actual).toBe(expected)
  })
})

// copying from base chart
const formatTimeSeriesData = (data: SeriesDataItem[], yDefaultLabel: string) => {
  const dataSets: {[key: string]: any} = {}
  const labels = new Set()

  // Sort the data by date
  data = data.sort((a: SeriesDataItem, b: SeriesDataItem) => Date.parse(a[0]) - Date.parse(b[0]))

  // Create a dataSet for each unique label in the data
  for (const d of data) {
    const valueLabel = d[2] && d[2] !== 'Y value' ? d[2] : yDefaultLabel
    labels.add(d[0])

    if (dataSets[valueLabel] === undefined) {
      dataSets[valueLabel] = {
        label: valueLabel,
        fill: '',
        data: [],
      }
    }

    dataSets[valueLabel].data.push(d[1])
  }

  return {
    datasets: Object.values(dataSets),
    labels: [...labels],
  }
}

const formatCategoricalData = (data: any, yDefaultLabel: string) => {
  const dataSets: {[key: string]: any} = {}

  const labels: Set<string> = new Set()

  // Create a dataSet for each unique label in the data
  for (const d of data) {
    const valueLabel = d[2] && d[2] !== 'Y value' ? d[2] : yDefaultLabel

    if (dataSets[valueLabel]) {
      dataSets[valueLabel] = {
        ...dataSets[valueLabel],
        data: [...dataSets[valueLabel].data, d[1]],
      }

      labels.add(d[0].toString() || 'Unlabeled')

      continue
    }

    dataSets[valueLabel] = {
      label: valueLabel,
      fill: '',
      data: [d[1]],
    }

    labels.add(d[0].toString() || 'Unlabeled')
  }

  return {
    datasets: Object.values(dataSets),
    labels: [...labels],
  }
}

const humanReadableDate = (dateInteger: number) =>
  new Date(dateInteger).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
