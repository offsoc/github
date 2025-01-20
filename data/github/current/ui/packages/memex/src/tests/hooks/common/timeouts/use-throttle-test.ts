import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {renderHook} from '@testing-library/react'
import {useEffect} from 'react'

import {useThrottle, type UseThrottleSettings} from '../../../../client/hooks/common/timeouts/use-throttle'

const renderUseThrottle = <T extends (...args: Array<unknown>) => unknown>(initialProps: {
  fn: T
  wait: number
  settings?: UseThrottleSettings
}) => renderHook(({fn, wait, settings}) => useThrottle(fn, wait, settings), {initialProps})

jest.useFakeTimers()

describe('useThrottle', () => {
  it('remains referentially stable when the function changes', () => {
    const firstFn = jest.fn()
    const secondFn = jest.fn()
    const {result, rerender} = renderUseThrottle({fn: firstFn, wait: 100})
    const firstResult = result.current
    rerender({fn: secondFn, wait: 100})
    expect(firstResult).toBe(result.current)
  })

  it('remains referentially stable when settings object reference changes', () => {
    const fn = jest.fn()
    const {result, rerender} = renderUseThrottle({fn, wait: 100, settings: {leading: true}})
    const firstResult = result.current
    rerender({fn, wait: 100, settings: {leading: true}})
    expect(firstResult).toBe(result.current)
  })

  it('calls the function like normal if leading', () => {
    const fn = jest.fn()
    const {result} = renderUseThrottle({fn, wait: 100, settings: {leading: true}})
    result.current()
    expect(fn).toHaveBeenCalled()
  })

  it('calls the most recent function when updated', () => {
    const firstFn = jest.fn()
    const secondFn = jest.fn()
    const {result, rerender} = renderUseThrottle({fn: firstFn, wait: 100, settings: {leading: true}})
    rerender({fn: secondFn, wait: 100, settings: {leading: true}})
    result.current()
    expect(firstFn).not.toHaveBeenCalled()
    expect(secondFn).toHaveBeenCalled()
  })

  it('throttles calls', () => {
    const fn = jest.fn()
    const {result} = renderUseThrottle({fn, wait: 200, settings: {leading: true}})
    result.current()
    jest.advanceTimersByTime(100)
    result.current()
    jest.advanceTimersByTime(100)
    result.current()
    jest.advanceTimersByTime(100)
    result.current()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it.each(['flush', undefined] as const)('flushes pending calls when changed in "flush" mode', onChangeBehavior => {
    const fn = jest.fn()
    const {result, rerender} = renderUseThrottle({
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
    const {result, unmount} = renderUseThrottle({
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
    const {result, unmount} = renderUseThrottle({
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
        const debouncedCb = useThrottle(() => callback(w), w, {leading: true, trailing: false})

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
      ])
        expect(callback).toHaveBeenNthCalledWith(n, w)
    },
  )
})
