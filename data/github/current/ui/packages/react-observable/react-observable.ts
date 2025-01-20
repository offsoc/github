import {useEffect, useRef, useState} from 'react'

import {type Observable, ObservableMap, ObservableSet, ObservableValue} from '@github-ui/observable'

/**
 * Returns a constant reference to an ObservableValue
 * @param initialValue the initial value of the observable
 */
export function useObservableValue<T>(initialValue: T): ObservableValue<T> {
  const observableRef = useRef(new ObservableValue(initialValue))
  return observableRef.current
}

/**
 * Returns a constant reference to an ObservableSet
 * @param args the initializer arguments for the underlying Set
 */
export function useObservableSet<T>(...args: ConstructorParameters<typeof Set<T>>): ObservableSet<T> {
  const observableRef = useRef(new ObservableSet(...args))
  return observableRef.current
}

/**
 * Returns a constant reference to an ObservableMap
 * @param args the initializer arguments for the underlying Map
 */
export function useObservableMap<K, V>(...args: ConstructorParameters<typeof Map<K, V>>) {
  const observableRef = useRef(new ObservableMap(...args))
  return observableRef.current
}

/**
 * Safely subscribes to and unsubscribes from an observable
 * @param observable the subject observable
 * @param onChange a callback to run in response to changes in the observable
 */
export function useSubscription<T>(observable: Observable<T>, onChange: (value: T) => void): void {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => observable.subscribe(value => onChangeRef.current(value)), [observable])
}

/**
 * Returns a stateful value that is updated (re-rendering the
 * component) when the given observable changes
 * @param observable the subject observable
 */
export function useObservedState<T>(observable: Observable<T>): T {
  const [value, setValue] = useState(observable.value)

  useSubscription(observable, newValue => setValue(newValue))

  return value
}

/**
 * Returns a stateful value that is updated (re-rendering the
 * component) when the given observable changes - can use this
 * with an observable map as the return value becasue we manually
 * re-render when the value is updated
 * @param observable the subject observable
 */
export function useObservedStateMap<T>(observable: Observable<T>): T {
  const [value, setValue] = useState(observable.value)
  const [_, setState] = useState({})

  useSubscription(observable, newValue => {
    setValue(newValue)
    //trigger a re-render by modifying an empty object
    setState({})
  })

  return value
}

/**
 * Returns a constant reference to an observable that is updated in
 * response to changes in the given observable.
 * @param observable the subject observable
 * @param derive a function which transforms the value of the subject
 *               observable to the value of the returned observable
 */
export function useDerivedObservable<T, D>(
  observable: ObservableValue<T>,
  derive: (value: T) => D,
): ObservableValue<D> {
  const derivedObservable = useObservableValue(derive(observable.value))

  useSubscription(observable, value => {
    derivedObservable.value = derive(value)
  })

  return derivedObservable
}
