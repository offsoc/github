import {act, renderHook} from '@testing-library/react'

import {useLocalStorage, clearLocalStorage} from '../use-local-storage'

beforeEach(() => {
  localStorage.clear()
})

test('it defaults the value to the fallback when localStorage is empty', () => {
  expect(localStorage.getItem('foo')).toBeNull()
  const {result} = renderHook(() => useLocalStorage('foo', 'bar'))
  expect(result.current[0]).toEqual('bar')
})

test('it does not call json.parse when initialized with the fallback', () => {
  const parseSpy = jest.spyOn(JSON, 'parse')
  const {result, rerender} = renderHook(() => useLocalStorage('foo', 'bar'))
  expect(result.current[0]).toEqual('bar')
  // no need to call JSON.parse when initializing with fallback
  expect(parseSpy).toHaveBeenCalledTimes(0)

  rerender()
  expect(parseSpy).toHaveBeenCalledTimes(0)
})

test('it calls json.parse twice on setup, but not on re-render', () => {
  localStorage.setItem('foo', '"some value"')
  const parseSpy = jest.spyOn(JSON, 'parse')
  const {result, rerender} = renderHook(() => useLocalStorage('foo', 'bar'))
  expect(result.current[0]).toEqual('some value')
  // no need to call JSON.parse when initializing with fallback
  expect(parseSpy).toHaveBeenCalledTimes(2)

  rerender()
  expect(parseSpy).toHaveBeenCalledTimes(2)
})

test('it ignores the fallback when a value was previously in local storage', () => {
  localStorage.setItem('foo', JSON.stringify('bar'))
  expect(localStorage.getItem('foo')).toEqual(JSON.stringify('bar'))
  const {result} = renderHook(() => useLocalStorage('foo', 'baz'))
  expect(result.current[0]).toEqual('bar')
})

test('it sets the value locally and syncs it to local storage', () => {
  const {result} = renderHook(() => useLocalStorage('foo', 'baz'))
  expect(result.current[0]).toEqual('baz')

  act(() => {
    result.current[1]('not-baz')
  })

  expect(result.current[0]).toEqual('not-baz')
  expect(localStorage.getItem('foo')).toEqual(JSON.stringify('not-baz'))
})

test('it clears storage for a set of keys, falling back as provided', () => {
  const {result: result1} = renderHook(() => useLocalStorage('foo', 'bar'))
  const {result: result2} = renderHook(() => useLocalStorage('bar', 'baz'))

  act(() => {
    result1.current[1]('not-bar')
    result2.current[1]('not-baz')
  })

  expect(localStorage.getItem('foo')).toBe('"not-bar"')
  expect(localStorage.getItem('bar')).toBe('"not-baz"')
  expect(result1.current[0]).toBe('not-bar')
  expect(result2.current[0]).toBe('not-baz')

  act(() => {
    clearLocalStorage(['foo', 'bar'])
  })

  expect(localStorage.getItem('foo')).toBeNull()
  expect(localStorage.getItem('bar')).toBeNull()
  expect(result1.current[0]).toBe('bar')
  expect(result2.current[0]).toBe('baz')
})

test('it avoids tearing', () => {
  const views = Array.from({length: 10}, () => renderHook(() => useLocalStorage('foo', 'bar')))

  for (const view of views) {
    expect(view.result.current[0]).toEqual('bar')
  }

  act(() => {
    views[0]!.result.current[1]('not-bar')
  })

  for (const view of views) {
    expect(view.result.current[0]).toEqual('not-bar')
  }

  expect(localStorage.getItem('foo')).toEqual(JSON.stringify('not-bar'))
})

test('it handles storagekey changes', () => {
  localStorage.setItem('foo', '"baz"')
  const {result, rerender} = renderHook(({key, fallback}) => useLocalStorage(key, fallback), {
    initialProps: {
      key: 'foo',
      fallback: 'bar',
    },
  })

  expect(result.current[0]).toBe('baz')

  rerender({key: 'not-foo', fallback: 'a new improved fallback'})

  expect(result.current[0]).toBe('a new improved fallback')
})
