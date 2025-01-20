import {mapRefType, qualifyRef, unqualifyRef} from '../ref-utils'

describe('mapRefType', () => {
  test('should return the corret maptype for a fully qualified ref if valid', () => {
    expect(mapRefType('refs/tags/v1.0.0')).toBe('tag')
    expect(mapRefType('refs/heads/main')).toBe('branch')
    expect(mapRefType('refs/heads/refs/heads/main')).toBe('branch')
    expect(mapRefType('refs/heads/feature/branch')).toBe('branch')
    expect(mapRefType('refs/heads/feature/branch/with/multiple/levels')).toBe('branch')
    expect(mapRefType('refs/tags/v1.0.0/with/multiple/levels')).toBe('tag')
  })
  test('should return undefined for an invalid ref', () => {
    expect(mapRefType('refs/v1.0.0/with/multiple/levels')).toBe(undefined)
    expect(mapRefType('refs/main')).toBe(undefined)
    expect(mapRefType('main')).toBe(undefined)
    expect(mapRefType('/refs/__gh__/main')).toBe(undefined)
    expect(mapRefType('/refs/pull/main')).toBe(undefined)
    expect(mapRefType()).toBe(undefined)
  })
})

describe('qualifyRef', () => {
  it('should return the correct fully qualified ref', () => {
    expect(qualifyRef('v1.0.0', 'tag')).toBe('refs/tags/v1.0.0')
    expect(qualifyRef('main', 'branch')).toBe('refs/heads/main')
    expect(qualifyRef('feature/branch', 'branch')).toBe('refs/heads/feature/branch')
    expect(qualifyRef('feature/branch/with/multiple/levels', 'branch')).toBe(
      'refs/heads/feature/branch/with/multiple/levels',
    )
    expect(qualifyRef('v1.0.0/with/multiple/levels', 'tag')).toBe('refs/tags/v1.0.0/with/multiple/levels')
    expect(qualifyRef('refs/heads/main', 'branch')).toBe('refs/heads/refs/heads/main')
    expect(qualifyRef('refs/tags/v1.0.0', 'branch')).toBe('refs/heads/refs/tags/v1.0.0')
  })
})

describe('unqualifyRef', () => {
  it('should return the correct unqualified ref given a branch or tag prefix', () => {
    expect(unqualifyRef('refs/tags/v1.0.0')).toBe('v1.0.0')
    expect(unqualifyRef('refs/heads/main')).toBe('main')
    expect(unqualifyRef('refs/heads/refs/heads/main')).toBe('refs/heads/main')
    expect(unqualifyRef('refs/heads/feature/branch')).toBe('feature/branch')
    expect(unqualifyRef('refs/heads/feature/branch/with/multiple/levels')).toBe('feature/branch/with/multiple/levels')
    expect(unqualifyRef('refs/tags/v1.0.0/with/multiple/levels')).toBe('v1.0.0/with/multiple/levels')
    expect(unqualifyRef('refs/v1.0.0/with/multiple/levels')).toBe('refs/v1.0.0/with/multiple/levels')
    expect(unqualifyRef('refs/main')).toBe('refs/main')
    expect(unqualifyRef('main')).toBe('main')
    expect(unqualifyRef('/refs/__gh__/main')).toBe('/refs/__gh__/main')
    expect(unqualifyRef('/refs/pull/main')).toBe('/refs/pull/main')
    expect(unqualifyRef()).toBe(undefined)
  })
})
