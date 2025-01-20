import {omit} from '../../utils/omit'

describe('omit', function () {
  it('omits nothing when no keys are passed', () => {
    const obj = {a: 1, b: 2, c: 3}
    expect(omit(obj, [])).toEqual(obj)
  })
  it('should omit the given keys', function () {
    expect(omit({a: 1, b: 2, c: 3}, ['a', 'c'])).toEqual({b: 2})
    expect(omit({a: 1, b: 2, c: 3}, ['a', 'b'])).toEqual({c: 3})
    expect(omit({a: 1, b: 2, c: 3}, ['a', 'b', 'c'])).toEqual({})
  })
})
