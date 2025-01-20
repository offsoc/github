import type {SeriesData} from '../src'
import {BarChartElement, RegisterBarChart} from '../src/bar-chart-element'

RegisterBarChart()

describe('bar-chart', function () {
  it('column chart indexAxis', function () {
    const element = new BarChartElement()
    expect(element.indexAxis).toBe('y')
  })

  describe('attributeChangedCallback', function () {
    it('renders the component when the chart-stacked attribute changes', function () {
      const element = new BarChartElement()
      const renderMethod = jest.spyOn(element, 'render')

      element.setAttribute('chart-stacked', '')
      expect(renderMethod).toHaveBeenCalledTimes(1)
    })
  })

  describe('formatTimeSeriesData()', function () {
    it('returns the expected dataset format', function () {
      const element = new BarChartElement()
      const data: SeriesData = [
        ['2020-01-01T18:49:53+00:00', 2, 'Done'],
        ['2020-01-02T18:49:53+00:00', 7, 'Done'],
        ['2020-01-03T18:49:53+00:00', 10, 'Done'],
        ['2020-01-04T18:49:53+00:00', 15, 'Done'],
        ['2020-01-05T18:49:53+00:00', 25, 'Done'],
        ['2020-01-06T18:49:53+00:00', 32, 'Done'],
        ['2020-01-07T18:49:53+00:00', 40, 'Done'],
        ['2020-01-08T18:49:53+00:00', 43, 'Done'],
        ['2020-01-09T18:49:53+00:00', 50, 'Done'],
        ['2020-01-10T18:49:53+00:00', 60, 'Done'],
        ['2020-01-11T18:49:53+00:00', 65, 'Done'],
        ['2020-01-12T18:49:53+00:00', 65, 'Done'],
        ['2020-01-13T18:49:53+00:00', 65, 'Done'],
        ['2020-01-14T18:49:53+00:00', 76, 'Done'],
        ['2020-01-01T18:49:53+00:00', 7, 'In progress'],
        ['2020-01-02T18:49:53+00:00', 10, 'In progress'],
        ['2020-01-03T18:49:53+00:00', 15, 'In progress'],
        ['2020-01-04T18:49:53+00:00', 25, 'In progress'],
        ['2020-01-05T18:49:53+00:00', 32, 'In progress'],
        ['2020-01-06T18:49:53+00:00', 40, 'In progress'],
        ['2020-01-07T18:49:53+00:00', 43, 'In progress'],
        ['2020-01-08T18:49:53+00:00', 50, 'In progress'],
        ['2020-01-09T18:49:53+00:00', 60, 'In progress'],
        ['2020-01-10T18:49:53+00:00', 65, 'In progress'],
        ['2020-01-11T18:49:53+00:00', 65, 'In progress'],
        ['2020-01-12T18:49:53+00:00', 65, 'In progress'],
        ['2020-01-13T18:49:53+00:00', 76, 'In progress'],
        ['2020-01-14T18:49:53+00:00', 76, 'In progress'],
        ['2020-01-01T18:49:53+00:00', 40, 'To do'],
        ['2020-01-02T18:49:53+00:00', 45, 'To do'],
        ['2020-01-03T18:49:53+00:00', 50, 'To do'],
        ['2020-01-04T18:49:53+00:00', 70, 'To do'],
        ['2020-01-05T18:49:53+00:00', 80, 'To do'],
        ['2020-01-06T18:49:53+00:00', 85, 'To do'],
        ['2020-01-07T18:49:53+00:00', 85, 'To do'],
        ['2020-01-08T18:49:53+00:00', 85, 'To do'],
        ['2020-01-09T18:49:53+00:00', 85, 'To do'],
        ['2020-01-10T18:49:53+00:00', 85, 'To do'],
        ['2020-01-11T18:49:53+00:00', 85, 'To do'],
        ['2020-01-12T18:49:53+00:00', 85, 'To do'],
        ['2020-01-13T18:49:53+00:00', 85, 'To do'],
        ['2020-01-14T18:49:53+00:00', 85, 'To do'],
        ['2020-01-01T18:49:53+00:00', 40, 'No status'],
        ['2020-01-02T18:49:53+00:00', 45, 'No status'],
        ['2020-01-03T18:49:53+00:00', 50, 'No status'],
        ['2020-01-04T18:49:53+00:00', 70, 'No status'],
        ['2020-01-05T18:49:53+00:00', 80, 'No status'],
        ['2020-01-06T18:49:53+00:00', 85, 'No status'],
        ['2020-01-07T18:49:53+00:00', 85, 'No status'],
        ['2020-01-08T18:49:53+00:00', 85, 'No status'],
        ['2020-01-09T18:49:53+00:00', 85, 'No status'],
        ['2020-01-10T18:49:53+00:00', 85, 'No status'],
        ['2020-01-11T18:49:53+00:00', 85, 'No status'],
        ['2020-01-12T18:49:53+00:00', 85, 'No status'],
        ['2020-01-13T18:49:53+00:00', 85, 'No status'],
        ['2020-01-14T18:49:53+00:00', 85, 'No status'],
      ]

      const formattedData = element.formatTimeSeriesData(data, '')

      expect(formattedData).toStrictEqual({
        datasets: [
          {
            label: 'Done',
            fill: 'stack',
            data: [2, 7, 10, 15, 25, 32, 40, 43, 50, 60, 65, 65, 65, 76],
            borderColor: '#0969da',
            backgroundColor: '#ddf4ff',
            borderWidth: 2,
            pointHoverBackgroundColor: '#0969da',
            pointHoverBorderWidth: 1,
            pointHoverRadius: 3,
            pointBackgroundColor: '#0969da',
            pointBorderColor: '#0969da',
            pointHoverBorderColor: '#0969da',
          },
          {
            label: 'In progress',
            fill: 'stack',
            data: [7, 10, 15, 25, 32, 40, 43, 50, 60, 65, 65, 65, 76, 76],
            borderColor: '#2da44e',
            backgroundColor: '#dafbe1',
            borderWidth: 2,
            pointHoverBackgroundColor: '#2da44e',
            pointHoverBorderWidth: 1,
            pointHoverRadius: 3,
            pointBackgroundColor: '#2da44e',
            pointBorderColor: '#2da44e',
            pointHoverBorderColor: '#2da44e',
          },
          {
            label: 'To do',
            fill: 'stack',
            data: [40, 45, 50, 70, 80, 85, 85, 85, 85, 85, 85, 85, 85, 85],
            borderColor: '#e16f24',
            backgroundColor: '#fff1e5',
            borderWidth: 2,
            pointHoverBackgroundColor: '#e16f24',
            pointHoverBorderWidth: 1,
            pointHoverRadius: 3,
            pointBackgroundColor: '#e16f24',
            pointBorderColor: '#e16f24',
            pointHoverBorderColor: '#e16f24',
          },
          {
            label: 'No status',
            fill: 'stack',
            data: [40, 45, 50, 70, 80, 85, 85, 85, 85, 85, 85, 85, 85, 85],
            borderColor: '#bf3989',
            backgroundColor: '#ffeff7',
            borderWidth: 2,
            pointHoverBackgroundColor: '#bf3989',
            pointHoverBorderWidth: 1,
            pointHoverRadius: 3,
            pointBackgroundColor: '#bf3989',
            pointBorderColor: '#bf3989',
            pointHoverBorderColor: '#bf3989',
          },
        ],
        labels: [
          '2020-01-01T18:49:53+00:00',
          '2020-01-02T18:49:53+00:00',
          '2020-01-03T18:49:53+00:00',
          '2020-01-04T18:49:53+00:00',
          '2020-01-05T18:49:53+00:00',
          '2020-01-06T18:49:53+00:00',
          '2020-01-07T18:49:53+00:00',
          '2020-01-08T18:49:53+00:00',
          '2020-01-09T18:49:53+00:00',
          '2020-01-10T18:49:53+00:00',
          '2020-01-11T18:49:53+00:00',
          '2020-01-12T18:49:53+00:00',
          '2020-01-13T18:49:53+00:00',
          '2020-01-14T18:49:53+00:00',
        ],
      })
    })
  })

  it('input config for stacked chart', function () {
    const element = new BarChartElement()

    element.setAttribute('chart-stacked', '')
    const inputConfigData = element.handleStackedChartAttribute({})

    expect(element.chartStacked).toBeTruthy()
    expect(inputConfigData).toStrictEqual({
      'scales.x.stacked': 'true',
      'scales.y.stacked': 'true',
    })
  })

  it('input config for grouped chart', function () {
    const element = new BarChartElement()
    const inputConfigData = element.handleStackedChartAttribute({})

    expect(element.chartStacked).toBeFalsy()
    expect(inputConfigData).toStrictEqual({
      'scales.x.grouped': 'true',
      'scales.y.grouped': 'true',
    })
  })
})
