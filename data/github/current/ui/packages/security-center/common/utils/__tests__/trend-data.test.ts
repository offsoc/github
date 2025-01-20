import {calculateTrend} from '../trend-data'

describe('calculateTrend', () => {
  it('should return a positive number for increasing trend', () => {
    const actual = calculateTrend(4.2, 3.5)
    expect(actual).toEqual(20)
  })

  it('should return a negative number for decreasing trend', () => {
    const actual = calculateTrend(3.5, 4.2)
    expect(actual).toEqual(-16.67)
  })

  it('should return 0 for a flat trend', () => {
    const actual = calculateTrend(3.5, 3.5)
    expect(actual).toEqual(0)
  })

  it('should return 0 if both current and previous values are 0', () => {
    const actual = calculateTrend(0, 0)
    expect(actual).toEqual(0)
  })

  it('should return infinity if previous value is 0', () => {
    const actual = calculateTrend(42, 0)
    expect(actual).toEqual(Infinity)
  })
})
