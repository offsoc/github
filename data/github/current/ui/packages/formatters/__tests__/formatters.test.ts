import {setClientEnvForSsr} from '@github-ui/client-env'
import {currency, getSignificanceBasedPrecision, human, number, resetCache} from '../formatters'

test('api', () => {
  expect(number).toBeInstanceOf(Function)
  expect(currency).toBeInstanceOf(Function)
})

describe('number', () => {
  it('should work', () => {
    expect(() => number(123)).not.toThrow()
    expect(() => number(123.456)).not.toThrow()
  })

  it('should format', () => {
    expect(number(123)).toEqual('123')
    expect(number(123.456)).toEqual('123.456')
    expect(number(1234.567)).toEqual('1,234.567')
  })
})

describe('currency', () => {
  beforeEach(() => {
    resetCache()
  })

  it('should work', () => {
    expect(() => currency(123)).not.toThrow()
    expect(() => currency(123.456)).not.toThrow()
  })

  it('should format', () => {
    expect(currency(123)).toEqual('$123.00')
    expect(currency(123.456)).toEqual('$123.46')
    expect(currency(1234.567)).toEqual('$1,234.57')
  })

  it('should allow for currency override', () => {
    expect(currency(123, {currency: 'EUR'})).toEqual('€123.00')
    expect(currency(123.456, {currency: 'EUR'})).toEqual('€123.46')
    expect(currency(1234.567, {currency: 'EUR'})).toEqual('€1,234.57')
  })

  it('is locale aware', () => {
    setClientEnvForSsr({locale: 'de-DE', featureFlags: []})

    // we have to use regex matchers here, as the "space" after the number is a strange ascii char i cannot seem to get to pass
    expect(currency(123)).toMatch(/^123,00\s\$/)
    expect(currency(123.456, {currency: 'EUR'})).toMatch(/^123,46\s€/)
  })
})

describe('human', () => {
  it('formats with correct default options', () => {
    expect(human(0)).toEqual('0')
    expect(human(0.22)).toEqual('0.2')
    expect(human(1.22)).toEqual('1.2')
    expect(human(1234.567)).toEqual('1.2k')
  })

  it('formats a number without a suffix', () => {
    expect(human(1234.567, {suffix: false})).toEqual('1,234.6')
    expect(human(1234.567, {precision: 0, suffix: false})).toEqual('1,235')
    expect(human(1234.567, {precision: 2, suffix: false})).toEqual('1,234.57')
  })

  it('formats a number with a suffix', () => {
    expect(human(123, {suffix: true})).toEqual('123')
    expect(human(1234, {suffix: true})).toEqual('1.2k')
    expect(human(12_345, {suffix: true})).toEqual('12.3k')
    expect(human(123_456, {suffix: true})).toEqual('123.5k')
    expect(human(1_234_567, {suffix: true})).toEqual('1.2m')
    expect(human(12_345_678, {suffix: true})).toEqual('12.3m')
    expect(human(123_456_789, {suffix: true})).toEqual('123.5m')
    expect(human(1_234_567_890, {suffix: true})).toEqual('1.2b')
    expect(human(12_345_678_901, {suffix: true})).toEqual('12.3b')
    expect(human(123_456_789_012, {suffix: true})).toEqual('123.5b')
    expect(human(123_456_789_012_345, {suffix: true})).toEqual('123,456.8b')
  })

  it('formats a number with capping', () => {
    expect(human(0.6, {capping: 0.5, suffix: false})).toEqual('0.5+')
    expect(human(1234, {capping: 1000, suffix: false})).toEqual('1,000+')
    expect(human(1234, {capping: 2000, suffix: false})).toEqual('1,234')
  })

  it('formats a number with all options', () => {
    expect(human(1_234, {capping: 1000, suffix: true, precision: 2})).toEqual('1k+')
    expect(human(1_234, {capping: undefined, suffix: true, precision: 2})).toEqual('1.23k')
    expect(human(1_234, {capping: undefined, suffix: true, precision: 1})).toEqual('1.2k')
  })
})

describe('getSignificanceBasedPrecision', () => {
  it('returns correct precision', () => {
    expect(getSignificanceBasedPrecision(123)).toEqual(1)
    expect(getSignificanceBasedPrecision(1234)).toEqual(1)
    expect(getSignificanceBasedPrecision(12_345)).toEqual(0)
    expect(getSignificanceBasedPrecision(123_456)).toEqual(0)
    expect(getSignificanceBasedPrecision(1_234_567)).toEqual(1)
    expect(getSignificanceBasedPrecision(12_345_678)).toEqual(0)
    expect(getSignificanceBasedPrecision(123_456_789)).toEqual(0)
    expect(getSignificanceBasedPrecision(1_234_567_890)).toEqual(1)
    expect(getSignificanceBasedPrecision(12_345_678_901)).toEqual(0)
    expect(getSignificanceBasedPrecision(123_456_789_012)).toEqual(0)
    expect(getSignificanceBasedPrecision(123_456_789_012_345)).toEqual(0)
  })
})
