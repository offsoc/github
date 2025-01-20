import {fillMissing} from '../../src/padding'
import {type SeriesData, SeriesType} from '../../src/types'

describe('padding tests', () => {
  describe('single time series', () => {
    const noPaddingNeeded: SeriesData = [
      [new Date('Sep 30 2022').toISOString(), 1],
      [new Date('Oct 1 2022').toISOString(), 2],
      [new Date('Oct 2 2022').toISOString(), 3],
      [new Date('Oct 3 2022').toISOString(), 4],
      [new Date('Oct 4 2022').toISOString(), 5],
      [new Date('Oct 5 2022').toISOString(), 6],
    ]

    const singleSeriesIntNotPadable = [
      [1, 1],
      [3, 3],
      [5, 5],
    ]

    const singleSeriesDateNotPadable = [
      ['2020-01-01T18:00:00.000Z', 1],
      ['2020-01-01T18:00:01.000Z', 2],
      ['2020-01-01T18:00:02.000Z', 3],
      ['2020-01-01T18:00:03.000Z', 4],
    ]

    const missingOneDay: SeriesData = [
      [new Date('Oct 1 2022').toISOString(), 2],
      [new Date('Oct 3 2022').toISOString(), 4],
    ]

    const missingSeveralDays: SeriesData = [
      [new Date('Oct 1 2022').toISOString(), 1],
      [new Date('Oct 3 2022').toISOString(), 2],
      [new Date('Oct 5 2022').toISOString(), 3],
      [new Date('Oct 8 2022').toISOString(), 4],
      [new Date('Oct 9 2022').toISOString(), 5],
      [new Date('Oct 11 2022').toISOString(), 6],
    ]

    it('should not fill missing days if none are missing', () => {
      const series = fillMissing(noPaddingNeeded, 0)
      expect(series).toStrictEqual(noPaddingNeeded)
    })

    it('should fill missing days with 0', () => {
      const expectedSeries = [
        [new Date('Oct 1 2022').toISOString(), 1],
        [new Date('Oct 2 2022').toISOString(), 0],
        [new Date('Oct 3 2022').toISOString(), 2],
        [new Date('Oct 4 2022').toISOString(), 0],
        [new Date('Oct 5 2022').toISOString(), 3],
        [new Date('Oct 6 2022').toISOString(), 0],
        [new Date('Oct 7 2022').toISOString(), 0],
        [new Date('Oct 8 2022').toISOString(), 4],
        [new Date('Oct 9 2022').toISOString(), 5],
        [new Date('Oct 10 2022').toISOString(), 0],
        [new Date('Oct 11 2022').toISOString(), 6],
      ]

      const actual = fillMissing(missingSeveralDays, 0)
      expect(actual).toStrictEqual(expectedSeries)
    })

    it('should fill missing values with specified value', () => {
      const value = Math.floor(Math.random() * 1000)
      const actual = fillMissing(missingOneDay, value)
      expect(actual[1]![1]).toStrictEqual(value)
    })

    it('should not mutate data that cannot be padded', () => {
      for (const testCase of [
        [singleSeriesIntNotPadable, SeriesType.Time],
        [singleSeriesDateNotPadable, SeriesType.Time],
        [singleSeriesIntNotPadable, SeriesType.Categorical],
        [singleSeriesDateNotPadable, SeriesType.Categorical],
        [singleSeriesIntNotPadable, null],
        [singleSeriesDateNotPadable, null],
      ]) {
        // @ts-expect-error - testing
        expect(fillMissing(testCase[0], 0, testCase[1])).toStrictEqual(testCase[0])
      }
    })
  })
  describe('grouped time series', () => {
    const noPaddingNeeded: SeriesData = [
      [new Date('Oct 1 2022').toISOString(), 2, 'Group 1'],
      [new Date('Oct 1 2022').toISOString(), 2, 'Group 2'],
      [new Date('Oct 2 2022').toISOString(), 3, 'Group 1'],
      [new Date('Oct 2 2022').toISOString(), 3, 'Group 2'],
      [new Date('Oct 3 2022').toISOString(), 4, 'Group 1'],
      [new Date('Oct 3 2022').toISOString(), 4, 'Group 2'],
      [new Date('Oct 4 2022').toISOString(), 5, 'Group 1'],
      [new Date('Oct 4 2022').toISOString(), 5, 'Group 2'],
      [new Date('Oct 5 2022').toISOString(), 6, 'Group 1'],
      [new Date('Oct 5 2022').toISOString(), 6, 'Group 2'],
    ]

    const missingSeveralDays: SeriesData = [
      ['2020-01-01T18:49:53.000Z', 2, 'Done'],
      ['2020-01-02T18:49:53.000Z', 7, 'Done'],
      ['2020-01-03T18:49:53.000Z', 10, 'Done'],
      ['2020-01-04T18:49:53.000Z', 15, 'Done'],
      ['2020-01-05T18:49:53.000Z', 25, 'Done'],
      ['2020-01-06T18:49:53.000Z', 32, 'Done'],
      ['2020-01-07T18:49:53.000Z', 40, 'Done'],
      ['2020-01-03T18:49:53.000Z', 15, 'In progress'],
      ['2020-01-04T18:49:53.000Z', 25, 'In progress'],
      ['2020-01-05T18:49:53.000Z', 32, 'In progress'],
      ['2020-01-06T18:49:53.000Z', 40, 'In progress'],
      ['2020-01-07T18:49:53.000Z', 43, 'In progress'],
      ['2020-01-05T18:49:53.000Z', 80, 'To do'],
      ['2020-01-06T18:49:53.000Z', 85, 'To do'],
      ['2020-01-07T18:49:53.000Z', 85, 'To do'],
      ['2020-01-06T18:49:53.000Z', 85, 'No status'],
      ['2020-01-07T18:49:53.000Z', 85, 'No status'],
    ]

    it('should not fill missing days if none are missing', () => {
      const series = fillMissing(noPaddingNeeded, 0)
      expect(series).toStrictEqual(noPaddingNeeded)
    })

    it('should fill missing days with 0', () => {
      const expectedSeries = [
        ['2020-01-01T18:49:53.000Z', 2, 'Done'],
        ['2020-01-01T18:49:53.000Z', 0, 'In progress'],
        ['2020-01-01T18:49:53.000Z', 0, 'To do'],
        ['2020-01-01T18:49:53.000Z', 0, 'No status'],
        ['2020-01-02T18:49:53.000Z', 7, 'Done'],
        ['2020-01-02T18:49:53.000Z', 0, 'In progress'],
        ['2020-01-02T18:49:53.000Z', 0, 'To do'],
        ['2020-01-02T18:49:53.000Z', 0, 'No status'],
        ['2020-01-03T18:49:53.000Z', 10, 'Done'],
        ['2020-01-03T18:49:53.000Z', 15, 'In progress'],
        ['2020-01-03T18:49:53.000Z', 0, 'To do'],
        ['2020-01-03T18:49:53.000Z', 0, 'No status'],
        ['2020-01-04T18:49:53.000Z', 15, 'Done'],
        ['2020-01-04T18:49:53.000Z', 25, 'In progress'],
        ['2020-01-04T18:49:53.000Z', 0, 'To do'],
        ['2020-01-04T18:49:53.000Z', 0, 'No status'],
        ['2020-01-05T18:49:53.000Z', 25, 'Done'],
        ['2020-01-05T18:49:53.000Z', 32, 'In progress'],
        ['2020-01-05T18:49:53.000Z', 80, 'To do'],
        ['2020-01-05T18:49:53.000Z', 0, 'No status'],
        ['2020-01-06T18:49:53.000Z', 32, 'Done'],
        ['2020-01-06T18:49:53.000Z', 40, 'In progress'],
        ['2020-01-06T18:49:53.000Z', 85, 'To do'],
        ['2020-01-06T18:49:53.000Z', 85, 'No status'],
        ['2020-01-07T18:49:53.000Z', 40, 'Done'],
        ['2020-01-07T18:49:53.000Z', 43, 'In progress'],
        ['2020-01-07T18:49:53.000Z', 85, 'To do'],
        ['2020-01-07T18:49:53.000Z', 85, 'No status'],
      ]
      const actual = fillMissing(missingSeveralDays, 0)
      expect(actual).toStrictEqual(expectedSeries)
    })

    const integerWeekDates: SeriesData = [
      ['20221031', 2, 'P2'],
      ['20221031', 1, 'P4'],
      ['20221024', 6, 'P3'],
      ['20221017', 1, 'P2'],
      ['20221017', 1, 'P3'],
      ['20221017', 1, 'P4'],
      ['20221010', 4, 'P2'],
      ['20221010', 2, 'P3'],
      ['20221003', 2, 'P2'],
      ['20221003', 3, 'P3'],
      ['20221003', 1, 'P4'],
      ['20220926', 5, 'P3'],
      ['20220919', 1, 'P1'],
      ['20220919', 2, 'P2'],
      ['20220919', 4, 'P3'],
      ['20220919', 1, 'P4'],
      ['20220912', 2, 'P2'],
      ['20220912', 4, 'P3'],
      ['20220912', 1, 'P4'],
      ['20220905', 1, 'P2'],
      ['20220905', 1, 'P3'],
      ['20220905', 1, 'P4'],
      ['20220829', 1, 'P2'],
      ['20220829', 1, 'P3'],
    ]

    it('should fill missing integer weeks and not covert ints to string', () => {
      const expectedSeries = [
        ['20220829', 1, 'P2'],
        ['20220829', 0, 'P4'],
        ['20220829', 1, 'P3'],
        ['20220829', 0, 'P1'],
        ['20220905', 1, 'P2'],
        ['20220905', 1, 'P4'],
        ['20220905', 1, 'P3'],
        ['20220905', 0, 'P1'],
        ['20220912', 2, 'P2'],
        ['20220912', 1, 'P4'],
        ['20220912', 4, 'P3'],
        ['20220912', 0, 'P1'],
        ['20220919', 2, 'P2'],
        ['20220919', 1, 'P4'],
        ['20220919', 4, 'P3'],
        ['20220919', 1, 'P1'],
        ['20220926', 0, 'P2'],
        ['20220926', 0, 'P4'],
        ['20220926', 5, 'P3'],
        ['20220926', 0, 'P1'],
        ['20221003', 2, 'P2'],
        ['20221003', 1, 'P4'],
        ['20221003', 3, 'P3'],
        ['20221003', 0, 'P1'],
        ['20221010', 4, 'P2'],
        ['20221010', 0, 'P4'],
        ['20221010', 2, 'P3'],
        ['20221010', 0, 'P1'],
        ['20221017', 1, 'P2'],
        ['20221017', 1, 'P4'],
        ['20221017', 1, 'P3'],
        ['20221017', 0, 'P1'],
        ['20221024', 0, 'P2'],
        ['20221024', 0, 'P4'],
        ['20221024', 6, 'P3'],
        ['20221024', 0, 'P1'],
        ['20221031', 2, 'P2'],
        ['20221031', 1, 'P4'],
        ['20221031', 0, 'P3'],
        ['20221031', 0, 'P1'],
      ]
      const actual = fillMissing(integerWeekDates, 0)

      expect(actual).toStrictEqual(expectedSeries)
    })
  })
})
