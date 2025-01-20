import type {SeriesData} from '../../src'
import {forecast, forecastAndAppend} from '../../src/forecasting/linear-regression'

describe('forecasting linear regression tests', () => {
  describe('single series', () => {
    const simpleSeries: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1],
      [new Date('Oct 1 2022').toISOString(), 2],
      [new Date('Oct 2 2022').toISOString(), 3],
      [new Date('Oct 3 2022').toISOString(), 4],
      [new Date('Oct 4 2022').toISOString(), 5],
      [new Date('Oct 5 2022').toISOString(), 6],
    ]

    it('should forecast 5 days by default', () => {
      const {series, forecastStartdate} = forecast(simpleSeries)

      expect(series).toHaveLength(5)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)
    })

    it('should forecast 3 days when a day count is passed of 3', () => {
      const {series, forecastStartdate} = forecast(simpleSeries, 3)

      expect(series).toHaveLength(3)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)
    })

    it('should forecast 7 days when a day count is passed of 7', () => {
      const {series, forecastStartdate} = forecast(simpleSeries, 7)

      expect(series).toHaveLength(7)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)
    })
  })

  describe('grouped series', () => {
    const simpleSeries: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1],
      [new Date('Oct 1 2022').toISOString(), 2],
      [new Date('Oct 2 2022').toISOString(), 3],
      [new Date('Oct 3 2022').toISOString(), 4],
      [new Date('Oct 4 2022').toISOString(), 5],
      [new Date('Oct 5 2022').toISOString(), 6],
    ]

    const NUM_GROUPS = 2
    const groupedSeries: SeriesData = []
    // @ts-expect-error - testing
    groupedSeries.push(...simpleSeries.map(s => [...s, `group 1`]))
    for (let i = 1; i < NUM_GROUPS; i++) {
      // @ts-expect-error - testing
      groupedSeries.push(...simpleSeries.map(s => [...s, `group ${i + 1}`]))
    }

    it('should forecast 5 days by default', () => {
      const {series, forecastStartdate} = forecast(groupedSeries)

      expect(series).toHaveLength(5 * NUM_GROUPS)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))

      const forecastedGroup1 = series.find(f => f[2] === 'group 1')
      const forecastedGroup2 = series.find(f => f[2] === 'group 2')

      expect(new Date(forecastedGroup1![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)

      expect(new Date(forecastedGroup2![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)
    })

    it('should forecast 3 days when a day count is passed of 3', () => {
      const {series, forecastStartdate} = forecast(groupedSeries, 3)

      expect(series).toHaveLength(3 * NUM_GROUPS)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))

      const forecastedGroup1 = series.find(f => f[2] === 'group 1')
      const forecastedGroup2 = series.find(f => f[2] === 'group 2')

      expect(new Date(forecastedGroup1![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)

      expect(new Date(forecastedGroup2![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)
    })

    it('should forecast 7 days when a day count is passed of 7', () => {
      const {series, forecastStartdate} = forecast(groupedSeries, 7)

      expect(series).toHaveLength(7 * NUM_GROUPS)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))

      const forecastedGroup1 = series.find(f => f[2] === 'group 1')
      const forecastedGroup2 = series.find(f => f[2] === 'group 2')

      expect(new Date(forecastedGroup1![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)

      expect(new Date(forecastedGroup2![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[0]![1]).toEqual(7)
    })
  })

  describe('single series with appended result', () => {
    const simpleSeries: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1],
      [new Date('Oct 1 2022').toISOString(), 2],
      [new Date('Oct 2 2022').toISOString(), 3],
      [new Date('Oct 3 2022').toISOString(), 4],
      [new Date('Oct 4 2022').toISOString(), 5],
      [new Date('Oct 5 2022').toISOString(), 6],
    ]

    it('should forecast 5 days by default', () => {
      const {series, forecastStartdate} = forecastAndAppend(simpleSeries)

      expect(series).toHaveLength(11)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))
    })

    it('should forecast 7 days', () => {
      const {series, forecastStartdate} = forecastAndAppend(simpleSeries, 7)

      expect(series).toHaveLength(13)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))
    })
  })

  describe('grouped series with appended result', () => {
    const simpleSeries: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1],
      [new Date('Oct 1 2022').toISOString(), 2],
      [new Date('Oct 2 2022').toISOString(), 3],
      [new Date('Oct 3 2022').toISOString(), 4],
      [new Date('Oct 4 2022').toISOString(), 5],
      [new Date('Oct 5 2022').toISOString(), 6],
    ]

    const NUM_GROUPS = 2
    const groupedSeries: SeriesData = []
    // @ts-expect-error - testing
    groupedSeries.push(...simpleSeries.map(s => [...s, `group 1`]))
    for (let i = 1; i < NUM_GROUPS; i++) {
      // @ts-expect-error - testing
      groupedSeries.push(...simpleSeries.map(s => [...s, `group ${i + 1}`]))
    }

    it('should forecast 5 days by default', () => {
      const {series, forecastStartdate} = forecastAndAppend(groupedSeries)

      expect(series).toHaveLength(5 * NUM_GROUPS + 6 * 2)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))

      const forecastedGroup1 = series.filter(f => f[2] === 'group 1')
      const forecastedGroup2 = series.filter(f => f[2] === 'group 2')

      expect(new Date(forecastedGroup1[6]![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[12]![1]).toEqual(7)

      expect(new Date(forecastedGroup2[6]![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[12]![1]).toEqual(7)
    })

    it('should forecast 3 days when a day count is passed of 3', () => {
      const {series, forecastStartdate} = forecastAndAppend(groupedSeries, 3)

      expect(series).toHaveLength(3 * NUM_GROUPS + 6 * 2)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))

      const forecastedGroup1 = series.filter(f => f[2] === 'group 1')
      const forecastedGroup2 = series.filter(f => f[2] === 'group 2')

      expect(new Date(forecastedGroup1[6]![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[12]![1]).toEqual(7)

      expect(new Date(forecastedGroup2[6]![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[12]![1]).toEqual(7)
    })

    it('should forecast 7 days when a day count is passed of 7', () => {
      const {series, forecastStartdate} = forecastAndAppend(groupedSeries, 7)

      expect(series).toHaveLength(7 * NUM_GROUPS + 6 * 2)
      expect(new Date(forecastStartdate)).toEqual(new Date('Oct 6 2022'))

      const forecastedGroup1 = series.filter(f => f[2] === 'group 1')
      const forecastedGroup2 = series.filter(f => f[2] === 'group 2')

      expect(new Date(forecastedGroup1[6]![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[12]![1]).toEqual(7)

      expect(new Date(forecastedGroup2[6]![0])).toEqual(new Date('Oct 6 2022'))
      expect(series[12]![1]).toEqual(7)
    })
  })

  describe('options and miscellaneous tests', () => {
    it('should handle 00:00:00 time in strings without seeing duplicate dates in resulting forecast', () => {
      const simpleSeries: SeriesData = [
        ['2022-11-24', 1],
        ['2022-11-25', 2],
        ['2022-11-26', 3],
        ['2022-11-27', 4],
        ['2022-11-28', 5],
        ['2022-11-29', 6],
      ]

      const {series, forecastStartdate} = forecastAndAppend(simpleSeries, 7)

      expect(series).toHaveLength(13)
      expect(new Date(forecastStartdate)).toEqual(new Date('2022-11-30'))

      expect(new Set(series.map(s => s[0])).size).toEqual(series.length)
    })
  })

  it('should round when provided roundTo option - grouped and ungrouped', () => {
    const simpleSeries: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1.52],
      [new Date('Oct 1 2022').toISOString(), 2.54],
    ]

    const {series, forecastStartdate} = forecastAndAppend(simpleSeries, 2, {
      roundTo: 1,
    })

    expect(series).toHaveLength(4)
    expect(new Date(forecastStartdate)).toEqual(new Date('Oct 2 2022'))

    expect(series[3]![1]).toEqual(4.6)

    const groupedSeries: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1.52, 'group 1'],
      [new Date('Oct 1 2022').toISOString(), 2.54, 'group 1'],
    ]

    const {series: groupedSeriesActual, forecastStartdate: groupedForecastStartdate} = forecastAndAppend(
      groupedSeries,
      2,
      {
        roundTo: 1,
      },
    )

    expect(groupedSeriesActual).toHaveLength(4)
    expect(new Date(groupedForecastStartdate)).toEqual(new Date('Oct 2 2022'))

    expect(groupedSeriesActual[3]![1]).toEqual(4.6)
  })

  it('should round to the closest whole number when roundTo is 0', () => {
    const simpleSeries: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1.52],
      [new Date('Oct 1 2022').toISOString(), 2.54],
    ]

    const {series, forecastStartdate} = forecastAndAppend(simpleSeries, 2, {
      roundTo: 0,
    })

    expect(series).toHaveLength(4)
    expect(new Date(forecastStartdate)).toEqual(new Date('Oct 2 2022'))

    expect(series[3]![1]).toEqual(5)
  })

  it('should round based on the GREATEST number of decimals in the series if no roundTo option is provided', () => {
    const simpleSeries: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1.5232],
      [new Date('Oct 1 2022').toISOString(), 2],
    ]

    const {series, forecastStartdate} = forecastAndAppend(simpleSeries, 2)

    expect(series).toHaveLength(4)
    expect(new Date(forecastStartdate)).toEqual(new Date('Oct 2 2022'))

    expect(series[3]![1]).toEqual(2.9536)
  })
})
