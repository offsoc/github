import {act, renderHook} from '@testing-library/react'

import {ObservableValue} from '@github-ui/observable'
import {
  useDerivedObservable,
  useObservableMap,
  useObservableSet,
  useObservableValue,
  useObservedState,
  useSubscription,
} from '../react-observable'

describe('useObservableValue', () => {
  it('returns a constant reference to an observable object', () => {
    const {result, rerender} = renderHook((initialValue: number) => useObservableValue(initialValue), {
      initialProps: 1,
    })
    const observable = result.current
    rerender(2)
    expect(result.current).toBe(observable)
    expect(result.current.value).toBe(1) // Does not change when a new initial value is passed
  })
})

describe('useObservableSet', () => {
  it('returns a constant reference to an observable set', () => {
    const {result, rerender} = renderHook((initialValues: number[]) => useObservableSet(initialValues), {
      initialProps: [1, 2, 3],
    })
    const observable = result.current
    rerender([2, 3])
    expect(result.current).toBe(observable)
    expect(result.current.value.has(1)).toBe(true) // Does not change when a new initial value is passed
  })
})

describe('useObservableMap', () => {
  it('returns a constant reference to an observable map', () => {
    const {result, rerender} = renderHook((initialValues: Array<[string, number]>) => useObservableMap(initialValues), {
      initialProps: [
        ['foo', 1],
        ['bar', 2],
        ['baz', 3],
      ],
    })
    const observable = result.current
    rerender([
      ['bar', 2],
      ['baz', 3],
    ])
    expect(result.current).toBe(observable)
    expect(result.current.value.has('foo')).toBe(true) // Does not change when a new initial value is passed
  })
})

describe('useSubscription', () => {
  it('runs the provided callback when the observable changes', () => {
    const observable = new ObservableValue(1)
    const subscription = jest.fn()

    renderHook(() => useSubscription(observable, subscription))

    expect(subscription).not.toHaveBeenCalled()

    observable.value = 2
    expect(subscription).toHaveBeenCalledWith(2)

    subscription.mockReset()
    observable.value = 2
    expect(subscription).not.toHaveBeenCalled()
  })

  it('unsubscribes when the component unmounts', () => {
    const observable = new ObservableValue(1)
    const subscription = jest.fn()

    const {unmount} = renderHook(() => useSubscription(observable, subscription))

    expect(subscription).not.toHaveBeenCalled()

    observable.value = 2
    observable.value = 3
    expect(subscription).toHaveBeenCalledTimes(2)

    subscription.mockReset()
    unmount()
    observable.value = 4
    observable.value = 5
    expect(subscription).not.toHaveBeenCalled()
  })
})

describe('useObservedState', () => {
  it('returns the contents of the observable as a stateful value', () => {
    const observable = new ObservableValue(1)

    const {result} = renderHook(() => useObservedState(observable))

    expect(result.current).toBe(1)

    act(() => {
      observable.value = 2
    })
    expect(result.current).toBe(2)
  })
})

describe('useDerivedObservable', () => {
  it('returns a constant reference to a new observable which is updated based on the given observable and callback', () => {
    const observable = new ObservableValue(1)
    const isEven = jest.fn((value: number) => value % 2 === 0)

    const {result} = renderHook(() => useDerivedObservable(observable, isEven))

    expect(result.current.value).toBe(false)
    expect(isEven).toHaveBeenCalledWith(1)

    observable.value = 2
    expect(result.current.value).toBe(true)
    expect(isEven).toHaveBeenCalledWith(2)

    observable.value = 4
    expect(result.current.value).toBe(true)
    expect(isEven).toHaveBeenCalledWith(4)
  })

  it('stops updating when the component is unmounted', () => {
    const observable = new ObservableValue(1)
    const isEven = jest.fn((value: number) => value % 2 === 0)

    const {result, unmount} = renderHook(() => useDerivedObservable(observable, isEven))

    const derived = result.current

    observable.value = 2
    expect(derived.value).toBe(true)

    isEven.mockReset()
    unmount()

    observable.value = 3
    expect(derived.value).toBe(true) // Not updated
    expect(isEven).not.toHaveBeenCalled()
  })
})
