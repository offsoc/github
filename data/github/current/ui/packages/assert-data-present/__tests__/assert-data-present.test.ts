import {assertDataPresent, errorMessage} from '../assert-data-present'

test('throw if the data passed is null', () => {
  const data = null
  expect(() => {
    assertDataPresent(data)
  }).toThrow(errorMessage)
})

test('throw if the data passed is undefined', () => {
  const data = undefined
  expect(() => {
    assertDataPresent(data)
  }).toThrow(errorMessage)
})

test('return nothing if data is passed', () => {
  const data = {foo: 'bar'}
  expect(assertDataPresent(data)).toBeUndefined()
})
