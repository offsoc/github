import {isFullSemver} from '../semver-util'

describe('mapRefType', () => {
  test('should return true for valid semver', () => {
    expect(isFullSemver('1.0.0')).toBe(true)
    expect(isFullSemver('1.0.0-beta')).toBe(true)
    expect(isFullSemver('1.0.0+build')).toBe(true)
    expect(isFullSemver('1.0.0-beta+build')).toBe(true)
  })

  test('should return true for v-prefixed semantic versions', () => {
    expect(isFullSemver('v1.0.0')).toBe(true)
    expect(isFullSemver('v1.0.0-beta')).toBe(true)
    expect(isFullSemver('v1.0.0+build')).toBe(true)
    expect(isFullSemver('v1.0.0-beta+build')).toBe(true)
  })
})
