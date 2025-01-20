import {getDecimalPlaces} from '../../utils/math'

describe('getDecimalPlaces', () => {
  it('returns 0 for integers', () => {
    expect(getDecimalPlaces(0)).toEqual(0)
    expect(getDecimalPlaces(1)).toEqual(0)
    expect(getDecimalPlaces(100)).toEqual(0)
    expect(getDecimalPlaces(-1000)).toEqual(0)
  })
  it('returns number of digits after decimal point', () => {
    expect(getDecimalPlaces(0.1)).toEqual(1)
    expect(getDecimalPlaces(0.12)).toEqual(2)
    expect(getDecimalPlaces(0.123)).toEqual(3)
    expect(getDecimalPlaces(0.1234)).toEqual(4)
    expect(getDecimalPlaces(0.0001)).toEqual(4)
  })
  it('returns number of digits after decimal point, ignoring trailing zeroes', () => {
    expect(getDecimalPlaces(0.1)).toEqual(1)
    expect(getDecimalPlaces(0.12)).toEqual(2)
    expect(getDecimalPlaces(0.123)).toEqual(3)
    expect(getDecimalPlaces(0.1234)).toEqual(4)
    expect(getDecimalPlaces(0.0001)).toEqual(4)
  })
  it('returns 0 for NaN and infinity', () => {
    expect(getDecimalPlaces(NaN)).toEqual(0)
    expect(getDecimalPlaces(Infinity)).toEqual(0)
    expect(getDecimalPlaces(-Infinity)).toEqual(0)
  })
})
