import {differenceInBusinessDays, differenceInDays, nextMonday, parseISO, previousFriday} from 'date-fns'

import type {RangeEnd} from '../types'
import {fitRange} from '../utils/range'

describe('fitRange', () => {
  const range = {from: parseISO('2023-12-31'), to: parseISO('2024-02-03')}

  it('leaves range unchanged if already fits', () => {
    const result = fitRange(range, {})
    expect(result).toEqual(range)
  })

  describe('shifts range to fit in minimum and maximum dates, preserving range length', () => {
    const midDate = parseISO('2024-01-15')

    it('ensures start falls on or after minimum date', () => {
      const result = fitRange(range, {minDate: midDate})
      expect(result.from).toEqual(midDate)
      expect(differenceInDays(result.from, result.to)).toEqual(differenceInDays(range.from, range.to))
    })

    it('ensures end falls on or before maximum date', () => {
      const result = fitRange(range, {maxDate: midDate})
      expect(result.to).toEqual(midDate)
      expect(differenceInDays(result.from, result.to)).toEqual(differenceInDays(range.from, range.to))
    })
  })

  describe.each<RangeEnd>(['from', 'to'])('for each adjustable range end: %s', adjustableRangeEnd => {
    const fixedRangeEnd = adjustableRangeEnd === 'from' ? 'to' : 'from'
    it('moves adjustable end of range to make range as long as minimum size', () => {
      const result = fitRange(range, {minRangeSize: 60, adjustableRangeEnd})
      const rangeSize = differenceInDays(result.to, result.from) + 1
      expect(rangeSize).toBeGreaterThanOrEqual(60)
      expect(result[fixedRangeEnd]).toEqual(range[fixedRangeEnd])
    })

    it('moves adjustable end of range to make range as short as maximum size', () => {
      const result = fitRange(range, {maxRangeSize: 5, adjustableRangeEnd})
      const rangeSize = differenceInDays(result.to, result.from) + 1
      expect(rangeSize).toBeLessThanOrEqual(5)
      expect(result[fixedRangeEnd]).toEqual(range[fixedRangeEnd])
    })
  })

  describe('when weekends are disabled', () => {
    it('moves ends of range to fall on closest weekdays', () => {
      const result = fitRange(range, {disableWeekends: true})
      expect(result.from).toEqual(nextMonday(range.from))
      expect(result.to).toEqual(previousFriday(range.to))
    })

    it("doesn't count weekends as part of range size if weekends are disabled", () => {
      const result = fitRange(range, {disableWeekends: true, minRangeSize: 30})
      const rangeSize = differenceInBusinessDays(result.to, result.from) + 1
      expect(rangeSize).toBeGreaterThanOrEqual(30)
    })
  })
})
