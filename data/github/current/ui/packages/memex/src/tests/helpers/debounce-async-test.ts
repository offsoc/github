import {debounceAsync} from '../../client/helpers/debounce-async'
import {wrapQueryablePromise} from './queryable-promise'

describe('debounceAsync', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('will invoke the function after a period of time', async () => {
    const wrappedFn = jest.fn().mockReturnValue(Promise.resolve(4))

    const debouncedFn = debounceAsync(wrappedFn, 500)

    const promise = debouncedFn()

    jest.runOnlyPendingTimers()

    await expect(promise).resolves.toBe(4)
    expect(wrappedFn).toHaveBeenCalledTimes(1)
  })

  it('will propagate errors when the wrapped function throws', async () => {
    const wrappedFn = jest.fn().mockImplementation(() => {
      throw new Error('something went wrong')
    })

    const debouncedFn = debounceAsync(wrappedFn, 500)

    const promise = debouncedFn()

    jest.runOnlyPendingTimers()

    await expect(promise).rejects.toEqual(new Error('something went wrong'))
    expect(wrappedFn).toHaveBeenCalledTimes(1)
  })

  it('will only invoke wrapped function once if multiple calls are made within the wait period', async () => {
    const wrappedFn = jest.fn().mockReturnValue(Promise.resolve(4))

    const debouncedFn = debounceAsync(wrappedFn, 500)

    const first = debouncedFn()

    jest.advanceTimersByTime(300)

    const second = debouncedFn()

    jest.runOnlyPendingTimers()

    const wrappedFirst = wrapQueryablePromise(first)

    expect(wrappedFirst.isPending()).toBeTruthy()
    expect(wrappedFirst.isFulfilled()).toBeFalsy()
    expect(wrappedFirst.isRejected()).toBeFalsy()

    await expect(second).resolves.toEqual(4)

    expect(wrappedFn).toHaveBeenCalledTimes(1)
  })

  it('will invoke wrapped function twice if next call falls outside of the wait period', async () => {
    const wrappedFn = jest.fn().mockReturnValue(Promise.resolve(4))

    const debouncedFn = debounceAsync(wrappedFn, 500)

    const first = debouncedFn()

    jest.advanceTimersByTime(700)

    const second = debouncedFn()

    jest.runOnlyPendingTimers()

    const wrappedFirst = wrapQueryablePromise(first)

    expect(wrappedFirst.isPending()).toBeTruthy()
    expect(wrappedFirst.isFulfilled()).toBeFalsy()
    expect(wrappedFirst.isRejected()).toBeFalsy()

    await expect(second).resolves.toEqual(4)

    expect(wrappedFn).toHaveBeenCalledTimes(2)
  })
})
