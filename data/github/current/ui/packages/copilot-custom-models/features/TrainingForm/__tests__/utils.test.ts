import {toRepoNwos} from '../utils'

describe('toRepoNwos', () => {
  describe('when given a comma-separated list of strings', () => {
    it('returns an array of those strings, excluding any empty values', () => {
      const actual = toRepoNwos('abc,def,,ghi')

      expect(actual).toEqual(['abc', 'def', 'ghi'])
    })
  })

  describe('when given an empty string', () => {
    it('returns an empty array', () => {
      const actual = toRepoNwos('')

      expect(actual).toEqual([])
    })
  })

  describe('when provided null', () => {
    it('returns null', () => {
      const actual = toRepoNwos(null)

      expect(actual).toBeNull()
    })
  })
})
