import type {SeriesData} from '../../src'
import {transform} from '../../src/rolling-sum'

describe('rolling sum tests', () => {
  describe('single series', () => {
    it('time series', () => {
      const series: SeriesData = [
        [new Date('Sep 30 2022').toISOString(), 1],
        [new Date('Oct 1 2022').toISOString(), 2],
        [new Date('Oct 2 2022').toISOString(), 1],
        [new Date('Oct 3 2022').toISOString(), 4],
        [new Date('Oct 4 2022').toISOString(), 2],
        [new Date('Oct 5 2022').toISOString(), 3],
      ]

      const expected = [
        [new Date('Sep 30 2022').toISOString(), 1],
        [new Date('Oct 1 2022').toISOString(), 3],
        [new Date('Oct 2 2022').toISOString(), 4],
        [new Date('Oct 3 2022').toISOString(), 8],
        [new Date('Oct 4 2022').toISOString(), 10],
        [new Date('Oct 5 2022').toISOString(), 13],
      ]

      const result = transform(series)
      expect(expected).toStrictEqual(result)
    })

    it('categorical series', () => {
      const series: SeriesData = [
        ['Backlog', 183],
        ['Ready for Work', 47],
        ['In Progress', 44],
        ['Done', 703],
      ]

      const expected = [
        ['Backlog', 183],
        ['Ready for Work', 230],
        ['In Progress', 274],
        ['Done', 977],
      ]

      const result = transform(series)
      expect(expected).toStrictEqual(result)
    })
  })

  describe('multi series', () => {
    it('time series', () => {
      const series: SeriesData = [
        [new Date('Sep 30 2022').toISOString(), 1, 'repo 1'],
        [new Date('Oct 1 2022').toISOString(), 2, 'repo 1'],
        [new Date('Oct 2 2022').toISOString(), 1, 'repo 1'],
        [new Date('Oct 3 2022').toISOString(), 4, 'repo 1'],
        [new Date('Oct 4 2022').toISOString(), 2, 'repo 1'],
        [new Date('Oct 5 2022').toISOString(), 3, 'repo 1'],

        [new Date('Sep 30 2022').toISOString(), 10, 'repo 2'],
        [new Date('Oct 1 2022').toISOString(), 1, 'repo 2'],
        [new Date('Oct 2 2022').toISOString(), 1, 'repo 2'],
        [new Date('Oct 3 2022').toISOString(), 5, 'repo 2'],
        [new Date('Oct 4 2022').toISOString(), 1, 'repo 2'],
        [new Date('Oct 5 2022').toISOString(), 3, 'repo 2'],
      ]

      const expected = [
        [new Date('Sep 30 2022').toISOString(), 1, 'repo 1'],
        [new Date('Oct 1 2022').toISOString(), 3, 'repo 1'],
        [new Date('Oct 2 2022').toISOString(), 4, 'repo 1'],
        [new Date('Oct 3 2022').toISOString(), 8, 'repo 1'],
        [new Date('Oct 4 2022').toISOString(), 10, 'repo 1'],
        [new Date('Oct 5 2022').toISOString(), 13, 'repo 1'],

        [new Date('Sep 30 2022').toISOString(), 10, 'repo 2'],
        [new Date('Oct 1 2022').toISOString(), 11, 'repo 2'],
        [new Date('Oct 2 2022').toISOString(), 12, 'repo 2'],
        [new Date('Oct 3 2022').toISOString(), 17, 'repo 2'],
        [new Date('Oct 4 2022').toISOString(), 18, 'repo 2'],
        [new Date('Oct 5 2022').toISOString(), 21, 'repo 2'],
      ]

      const result = transform(series)
      expect(expected).toStrictEqual(result)
    })

    it('categorical series', () => {
      const series: SeriesData = [
        ['Backlog', 183, 'repo 1'],
        ['Backlog', 10, 'repo 2'],
        ['Ready for Work', 15, 'repo 2'],
        ['Ready for Work', 47, 'repo 1'],
        ['In Progress', 44, 'repo 1'],
        ['In Progress', 11, 'repo 2'],
        ['Done', 703, 'repo 1'],
      ]

      const expected = [
        ['Backlog', 183, 'repo 1'],
        ['Backlog', 10, 'repo 2'],
        ['Ready for Work', 25, 'repo 2'],
        ['Ready for Work', 230, 'repo 1'],
        ['In Progress', 274, 'repo 1'],
        ['In Progress', 36, 'repo 2'],
        ['Done', 977, 'repo 1'],
      ]

      const result = transform(series)
      expect(expected).toStrictEqual(result)
    })
  })
})
