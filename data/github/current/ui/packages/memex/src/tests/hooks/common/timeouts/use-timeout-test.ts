import {renderHook} from '@testing-library/react'

import {useSetTimeout, useTimeout} from '../../../../client/hooks/common/timeouts/use-timeout'

const renderUseSetTimeout = <T extends (...args: Array<unknown>) => unknown>(initialProps: {fn: T}) =>
  renderHook(({fn}) => useSetTimeout(fn), {initialProps})

const renderUseTimeout = <T extends (...args: Array<unknown>) => unknown>(initialProps: {fn: T; delayMs: number}) =>
  renderHook(({fn, delayMs}) => useTimeout(fn, delayMs), {initialProps})

jest.useFakeTimers()

describe('useTimeout', () => {
  it('remains referentially stable when the function changes', () => {
    const firstFn = jest.fn()
    const secondFn = jest.fn()
    const {result, rerender} = renderUseSetTimeout({fn: firstFn})
    const firstResult = result.current
    rerender({fn: secondFn})
    expect(firstResult).toBe(result.current)
  })

  it('sets a timeout', () => {
    const fn = jest.fn()
    const {result} = renderUseSetTimeout({fn})
    result.current(1000)()
    jest.runAllTimers()
    expect(fn).toHaveBeenCalled()
  })

  it('calls the most recent function when updated', () => {
    const firstFn = jest.fn()
    const secondFn = jest.fn()
    const {result, rerender} = renderUseSetTimeout({fn: firstFn})
    result.current(1000)()
    rerender({fn: secondFn})
    jest.runAllTimers()
    expect(firstFn).not.toHaveBeenCalled()
    expect(secondFn).toHaveBeenCalled()
  })

  it('can handle parallel timers without mixing arguments', () => {
    const fn = jest.fn()
    const {result} = renderUseSetTimeout({fn})
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

  it('cancels pending timers on dismount', () => {
    const fn = jest.fn()
    const {result, unmount} = renderUseSetTimeout({fn})
    result.current(1000)()
    result.current(1500)()
    result.current(1300)()
    unmount()
    jest.runAllTimers()
    expect(fn).not.toHaveBeenCalled()
  })

  it('cancels pending timers when manually cancelled', () => {
    const fn = jest.fn()
    const {result} = renderUseSetTimeout({fn})
    const timer = result.current(1000)()
    timer.cancel()
    jest.runAllTimers()
    expect(fn).not.toHaveBeenCalled()
  })

  describe('useMemoizedTimeout', () => {
    it("remains referentially stable as long as delay doesn't change", () => {
      const firstFn = jest.fn()
      const secondFn = jest.fn()
      const {result, rerender} = renderUseTimeout({fn: firstFn, delayMs: 1000})
      const firstResult = result.current
      rerender({fn: secondFn, delayMs: 1000})
      expect(firstResult).toBe(result.current)
    })
  })
})
