import {hasFuzzyMatch} from '../has-fuzzy-match'

test('No match returns false', () => {
  expect(hasFuzzyMatch('hello', 'world')).toBeFalsy()
  expect(hasFuzzyMatch('u', 'hell')).toBeFalsy()
  expect(hasFuzzyMatch('y', 'helo')).toBeFalsy()
  expect(hasFuzzyMatch('', 'hello')).toBeFalsy()
  expect(hasFuzzyMatch('hello', '')).toBeFalsy()
})

test('Partial matches return true', () => {
  const text = 'This is a sentence'
  expect(hasFuzzyMatch('this', text)).toBeTruthy()
  expect(hasFuzzyMatch('his', text)).toBeTruthy()
  expect(hasFuzzyMatch('is', text)).toBeTruthy()
  expect(hasFuzzyMatch('a', text)).toBeTruthy()
  expect(hasFuzzyMatch('sente', text)).toBeTruthy()
})
