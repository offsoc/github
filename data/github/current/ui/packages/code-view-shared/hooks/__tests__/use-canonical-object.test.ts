import {renderHook} from '@testing-library/react'

import {deepCompare, useCanonicalObject} from '../use-canonical-object'

describe('useCanonicalObject', () => {
  it('returns the same object if it is the same object', () => {
    const obj1 = {foo: 2}
    const obj2 = {bar: 3}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {result, rerender} = renderHook(({o}) => useCanonicalObject(o), {initialProps: {o: obj1} as any})
    expect(result.current).toBe(obj1)
    rerender({o: obj2})
    expect(result.current).toBe(obj2)
    rerender({o: obj1})
    expect(result.current).toBe(obj1)
  })

  it('canonicalizes objects', () => {
    const obj1 = {foo: 2}
    const obj2 = {foo: 2}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {result, rerender} = renderHook(({o}) => useCanonicalObject(o), {initialProps: {o: obj1} as any})
    expect(result.current).toBe(obj1)
    rerender({o: obj2})
    expect(result.current).toBe(obj1)
  })

  it('canonicalizes arrays', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {result, rerender} = renderHook(({a}) => useCanonicalObject(a), {initialProps: {a: arr1} as any})
    expect(result.current).toBe(arr1)
    rerender({a: arr2})
    expect(result.current).toBe(arr1)
  })

  it('has limited storage', () => {
    const obj1 = {foo: 2}
    const obj2 = {bar: 7}
    const obj3 = {baz: 9}
    const obj4 = {qux: 11}
    const obj5 = {quux: 13}
    const obj6 = {corge: 17}
    const obj7 = {foo: 2}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {result, rerender} = renderHook(({o}) => useCanonicalObject(o), {initialProps: {o: obj1} as any})
    expect(result.current).toBe(obj1)
    rerender({o: obj2})
    rerender({o: obj3})
    rerender({o: obj4})
    rerender({o: obj5})
    rerender({o: obj6})
    rerender({o: obj7})
    expect(result.current).toBe(obj7)
  })
})

describe('deepCompare', () => {
  it('compares primitives', () => {
    expect(deepCompare(2, 2)).toBe(true)
    expect(deepCompare(2, 3)).toBe(false)
    expect(deepCompare('foo', 'foo')).toBe(true)
    expect(deepCompare('foo', 'bar')).toBe(false)
    expect(deepCompare(true, true)).toBe(true)
    expect(deepCompare(true, false)).toBe(false)
    expect(deepCompare(undefined, undefined)).toBe(true)
    expect(deepCompare(null, null)).toBe(true)
    expect(deepCompare(undefined, null)).toBe(false)
  })
  it('compares objects', () => {
    expect(deepCompare({foo: 2}, {foo: 2})).toBe(true)
    expect(deepCompare({foo: 2}, {foo: 3})).toBe(false)
    expect(deepCompare({foo: 2}, {bar: 2})).toBe(false)
    expect(deepCompare({foo: 2}, {foo: 2, bar: 3})).toBe(false)
    expect(deepCompare({foo: 2, bar: 3}, {foo: 2})).toBe(false)
  })
  it('compares arrays', () => {
    expect(deepCompare([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepCompare([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(deepCompare([1, 2, 3], [1, 2])).toBe(false)
    expect(deepCompare([1, 2], [1, 2, 3])).toBe(false)
  })
  it('compares mixed objects', () => {
    expect(deepCompare({foo: 2, bar: [1, 2, 3]}, {foo: 2, bar: [1, 2, 3]})).toBe(true)
    expect(deepCompare({foo: 2, bar: [1, 2, 3]}, {foo: 2, bar: [1, 2, 4]})).toBe(false)
    expect(deepCompare({foo: 2, bar: [1, 2, 3]}, {foo: 2, bar: [1, 2]})).toBe(false)
    expect(deepCompare({foo: 2, bar: [1, 2]}, {foo: 2, bar: [1, 2, 3]})).toBe(false)
  })
  it('compares recursively', () => {
    expect(deepCompare({foo: 2, bar: {baz: 3}}, {foo: 2, bar: {baz: 3}})).toBe(true)
    expect(deepCompare({foo: 2, bar: {baz: 3}}, {foo: 2, bar: {baz: 4}})).toBe(false)
  })
  it('compares arrays recursively', () => {
    expect(deepCompare([1, 2, 3, [4, 5, 6]], [1, 2, 3, [4, 5, 6]])).toBe(true)
    expect(deepCompare([1, 2, 3, [4, 5, 6]], [1, 2, 3, [4, 5, 7]])).toBe(false)
    expect(deepCompare([1, 2, 3, {foo: 2}], [1, 2, 3, {foo: 2}])).toBe(true)
    expect(deepCompare([1, 2, 3, {foo: 2}], [1, 2, 3, {foo: 3}])).toBe(false)
  })
})
