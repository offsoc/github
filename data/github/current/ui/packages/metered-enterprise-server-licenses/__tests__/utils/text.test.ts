import {pluralize} from '../../utils/text'

describe('pluralize', () => {
  test('pluralizes a word when count is not 1', () => {
    expect(pluralize(2, 'seat')).toEqual('2 seats')
    expect(pluralize(0, 'seat')).toEqual('0 seats')
  })

  test('does not pluralize a word when count is 1', () => {
    expect(pluralize(1, 'seat')).toEqual('1 seat')
  })

  test('does not include the count when includeCount is false', () => {
    expect(pluralize(1, 'seat', false)).toEqual('seat')
    expect(pluralize(2, 'seat', false)).toEqual('seats')
  })
})
