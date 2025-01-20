import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {renderHook} from '@testing-library/react'
import {useEffect} from 'react'

import {useDebounce, type UseDebounceSettings} from '../use-debounce'

const renderUseDebounce = <T extends (...args: unknown[]) => unknown>(initialProps: {
  fn: T
  wait: number
  settings?: UseDebounceSettings
}) => renderHook(({fn, wait, settings}) => useDebounce(fn, wait, settings), {initialProps})

jest.useFakeTimers()

describe('useDebounce', () => {
  it('remains referentially stable when the function changes', () => {
    const firstFn = jest.fn()
    const secondFn = jest.fn()
    const {result, rerender} = renderUseDebounce({fn: firstFn, wait: 100})
    const firstResult = result.current
    rerender({fn: secondFn, wait: 100})
    expect(firstResult).toBe(result.current)
  })

  it('remains referentially stable when settings object reference changes', () => {
    const fn = jest.fn()
    const {result, rerender} = renderUseDebounce({fn, wait: 100, settings: {leading: true}})

    const firstResult = result.current
    rerender({fn, wait: 100, settings: {leading: true}})
    expect(firstResult).toBe(result.current)
  })

  it('calls the function like normal if leading', () => {
    const fn = jest.fn()
    const {result} = renderUseDebounce({fn, wait: 100, settings: {leading: true}})
    result.current()
    expect(fn).toHaveBeenCalled()
  })

  it('calls the most recent function when updated', () => {
    const firstFn = jest.fn()
    const secondFn = jest.fn()
    const {result, rerender} = renderUseDebounce({fn: firstFn, wait: 100, settings: {leading: true}})
    rerender({fn: secondFn, wait: 100, settings: {leading: true}})
    result.current()
    expect(firstFn).not.toHaveBeenCalled()
    expect(secondFn).toHaveBeenCalled()
  })

  it('debounces calls', () => {
    const fn = jest.fn()
    const {result} = renderUseDebounce({fn, wait: 250, settings: {leading: true, trailing: false}})
    result.current()
    jest.advanceTimersByTime(50)
    result.current()
    jest.advanceTimersByTime(50)
    result.current()
    jest.advanceTimersByTime(50)
    result.current()
    expect(fn).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(500)
    result.current()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('cancels pending calls when changed in "cancel" mode', () => {
    const fn = jest.fn()
    const {result, rerender} = renderUseDebounce({
      fn,
      wait: 1000,
      settings: {trailing: true, leading: false, onChangeBehavior: 'cancel'},
    })
    result.current()
    rerender({fn, wait: 900, settings: {trailing: true, leading: false, onChangeBehavior: 'cancel'}})
    jest.advanceTimersByTime(3000)
    expect(fn).not.toHaveBeenCalled()
  })

  it.each(['flush', undefined] as const)('flushes pending calls when changed in "flush" mode', onChangeBehavior => {
    const fn = jest.fn()
    const {result, rerender} = renderUseDebounce({
      fn,
      wait: 1000,
      settings: {trailing: true, leading: false},
    })
    result.current()
    rerender({fn, wait: 900, settings: {trailing: true, leading: false, onChangeBehavior}})
    jest.advanceTimersByTime(3000)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('cancels pending calls when dismounted in "cancel" mode', () => {
    const fn = jest.fn()
    const {result, unmount} = renderUseDebounce({
      fn,
      wait: 1000,
      settings: {trailing: true, leading: false, onChangeBehavior: 'cancel'},
    })
    result.current()
    unmount()
    jest.advanceTimersByTime(3000)
    expect(fn).not.toHaveBeenCalled()
  })

  it.each(['flush', undefined] as const)('flushes pending calls when dismounted in "flush" mode', onChangeBehavior => {
    const fn = jest.fn()
    const {result, unmount} = renderUseDebounce({
      fn,
      wait: 1000,
      settings: {trailing: true, leading: false, onChangeBehavior},
    })
    result.current()
    unmount()
    jest.advanceTimersByTime(3000)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  // https://github.com/github/memex/pull/9955#discussion_r868295282
  it.each([useEffect, useLayoutEffect])(
    'always provides effect dependents with the most up-to-date value',
    useEffectForm => {
      const callback = jest.fn()

      const useSomeOtherHook = (w: number) => {
        const debouncedCb = useDebounce(() => callback(w), w, {leading: true, trailing: false})

        useEffectForm(() => debouncedCb(), [debouncedCb])
      }

      const {rerender} = renderHook(({w}) => useSomeOtherHook(w), {initialProps: {w: 100}})
      jest.advanceTimersByTime(1500)
      for (const w of [200, 200, 300]) {
        rerender({w})
        jest.advanceTimersByTime(1500)
      }

      expect(callback).toHaveBeenCalledTimes(3)

      for (const [n, w] of [
        [1, 100],
        [2, 200],
        [3, 300],
      ]) {
        if (!n || !w) return
        expect(callback).toHaveBeenNthCalledWith(n, w)
      }
    },
  )
})
