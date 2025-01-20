import {act, renderHook} from '@testing-library/react'

import {useDirtyStateTracking} from '../use-dirty-state-tracking'

describe('useDirtyState', () => {
  it('reports not dirty when tracked value matches default', async () => {
    const {result} = renderHook(() => useDirtyStateTracking('foo', 'foo', false))

    const [isDirty] = result.current
    expect(isDirty).toBe(false)
  })

  it('reports not dirty when tracked value does not match default, but initial isDirty is provided', async () => {
    const {result} = renderHook(() => useDirtyStateTracking('foo', 'bar', true))

    const [isDirty] = result.current
    expect(isDirty).toBe(true)
  })

  it('reports dirty when tracked value does not match default', async () => {
    const {result} = renderHook(() => useDirtyStateTracking('foo', 'bar', false))

    const [isDirty] = result.current
    expect(isDirty).toBe(true)
  })

  it('reports dirty when tracked value matches default, but initial isDirty is provided', async () => {
    const {result} = renderHook(() => useDirtyStateTracking('foo', 'foo', true))

    const [isDirty] = result.current
    expect(isDirty).toBe(true)
  })

  it('uses custom equality check', async () => {
    const {result} = renderHook(() => useDirtyStateTracking(123, 123, false, () => false))

    const [isDirty] = result.current
    expect(isDirty).toBe(true)
  })

  it('resets dirty state', async () => {
    const {result} = renderHook(() => useDirtyStateTracking(123, 456, false))

    let [isDirty, resetIsDirty] = result.current
    expect(isDirty).toBe(true)

    // invoke the reset and check again
    act(() => resetIsDirty())
    ;[isDirty, resetIsDirty] = result.current
    expect(isDirty).toBe(false)
  })
})
