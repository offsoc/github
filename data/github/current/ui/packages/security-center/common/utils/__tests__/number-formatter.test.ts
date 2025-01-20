import {formatFriendly} from '../number-formatter'

describe('formatFriendly', () => {
  it('returns zero', () => {
    expect(formatFriendly(undefined)).toEqual('0')
    expect(formatFriendly(NaN)).toEqual('0')
    expect(formatFriendly(0)).toEqual('0')
    expect(formatFriendly(0.0)).toEqual('0')
  })

  it('returns less than one', () => {
    expect(formatFriendly(0.1)).toEqual('<1')
    expect(formatFriendly(0.00001)).toEqual('<1')
    expect(formatFriendly(0.5)).toEqual('<1')
    expect(formatFriendly(0.6)).toEqual('<1')
    expect(formatFriendly(0.99999)).toEqual('<1')
  })

  it('returns rounded value', () => {
    expect(formatFriendly(1.0)).toEqual('1')
    expect(formatFriendly(1.1)).toEqual('1')
    expect(formatFriendly(1.49)).toEqual('1')
    expect(formatFriendly(1.5)).toEqual('2')
    expect(formatFriendly(1.6)).toEqual('2')
    expect(formatFriendly(1.9)).toEqual('2')
  })
})
