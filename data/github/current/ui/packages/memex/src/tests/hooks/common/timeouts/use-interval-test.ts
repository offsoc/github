import {renderHook} from '@testing-library/react'

import {useInterval, useSetInterval} from '../../../../client/hooks/common/timeouts/use-interval'

const renderUseSetInterval = <T extends (...args: Array<unknown>) => unknown>(initialProps: {fn: T}) =>
  renderHook(({fn}) => useSetInterval(fn), {initialProps})

const renderUseInterval = <T extends (...args: Array<unknown>) => unknown>(initialProps: {fn: T; delayMs: number}) =>
  renderHook(({fn, delayMs}) => useInterval(fn, delayMs), {initialProps})

jest.useFakeTimers()

describe('useInterval', () => {
  it('remains referentially stable when the function changes', () => {
    const firstFn = jest.fn()
    const secondFn = jest.fn()
    const {result, rerender} = renderUseSetInterval({fn: firstFn})
    const firstResult = result.current
    rerender({fn: secondFn})
    expect(firstResult).toBe(result.current)
  })

  it('calls the most recent function when updated', () => {
    const firstFn = jest.fn()
    const secondFn = jest.fn()
    const {result, rerender} = renderUseSetInterval({fn: firstFn})
    result.current(1000)()
    rerender({fn: secondFn})
    jest.advanceTimersByTime(1100)
    expect(firstFn).not.toHaveBeenCalled()
    expect(secondFn).toHaveBeenCalled()
  })

  it('can handle parallel intervals without mixing arguments', () => {
    const fn = jest.fn()
    const {result} = renderUseSetInterval({fn})
    result.current(1000)(1)
    result.current(1500)(2)
    result.current(1250)(3)
    jest.advanceTimersByTime(1100)
    expect(fn).toHaveBeenLastCalledWith(1)
    jest.advanceTimersByTime(300)
    expect(fn).toHaveBeenLastCalledWith(3)
    jest.advanceTimersByTime(500)
    expect(fn).toHaveBeenLastCalledWith(2)
  })

  it('cancels intervals on dismount', () => {
    const fn = jest.fn()
    const {result, unmount} = renderUseSetInterval({fn})
    result.current(1000)()
    result.current(1500)()
    result.current(1300)()
    unmount()
    jest.advanceTimersByTime(1100)
    expect(fn).not.toHaveBeenCalled()
  })

  it('cancels pending intervals when manually cancelled', () => {
    const fn = jest.fn()
    const {result} = renderUseSetInterval({fn})
    const interval = result.current(1000)()
    interval.cancel()
    jest.advanceTimersByTime(1100)
    expect(fn).not.toHaveBeenCalled()
  })

  it('reruns if not cancelled', () => {
    const fn = jest.fn()
    const {result} = renderUseSetInterval({fn})
    result.current(1000)()
    jest.advanceTimersByTime(2500)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  describe('useMemoizedInterval', () => {
    it("remains referentially stable as long as delay doesn't change", () => {
      const firstFn = jest.fn()
      const secondFn = jest.fn()
      const {result, rerender} = renderUseInterval({fn: firstFn, delayMs: 1000})
      const firstResult = result.current
      rerender({fn: secondFn, delayMs: 1000})
      expect(firstResult).toBe(result.current)
    })
  })
})
