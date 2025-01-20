import {BONUS_POINT, DIRECT_MATCH, NO_MATCH, fuzzyScore} from '../fuzzy-score'

test('direct match returns highest score', () => {
  expect(fuzzyScore('hello', 'hello')).toBe(DIRECT_MATCH)
  expect(fuzzyScore('', '')).toBe(DIRECT_MATCH)
})

test('no match returns lowest score', () => {
  expect(fuzzyScore('hello', 'world')).toBe(NO_MATCH)
  expect(fuzzyScore('u', 'hell')).toBe(NO_MATCH)
  expect(fuzzyScore('y', 'helo')).toBe(NO_MATCH)
  expect(fuzzyScore('', 'hello')).toBe(NO_MATCH)
  expect(fuzzyScore('hello', '')).toBe(NO_MATCH)
})

test('correct awards bonus points with direct match on starting with query', () => {
  const baseScore = fuzzyScore('hello', 'helloWorld', 0)
  const bonusScore = fuzzyScore('hello', 'helloWorld')
  expect(bonusScore).toBe(baseScore + BONUS_POINT)
})

test('correct awards bonus points with direct match on ending with query', () => {
  const baseScore = fuzzyScore('world', 'helloWorld', 0)
  const bonusScore = fuzzyScore('world', 'helloWorld')
  expect(bonusScore).toBe(baseScore + BONUS_POINT)
})

test('fuzzy correctly outranks various words with lesser matches', () => {
  const text = 'This is a sentence'
  expect(fuzzyScore('this', text)).toBeGreaterThan(fuzzyScore('his', text))
  expect(fuzzyScore('his', text)).toBeGreaterThan(fuzzyScore('is', text))
  expect(fuzzyScore('is', text)).toBeGreaterThan(fuzzyScore('a', text))
  expect(fuzzyScore('sente', text)).toBeGreaterThan(fuzzyScore('is', text))
})
