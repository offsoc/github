/**
 * An interface representing a value that can be observed for changes.
 */
export interface Observable<T> {
  /**
   * The current value of the observable.
   */
  get value(): T

  /**
   * Adds a callback to run in response to changes in the observable.
   * @param onChange a callback to run in response to changes in the observable
   * @returns a function to unsubscribe from the observable
   */
  subscribe(onChange: Subscription<T>): () => void
}

/**
 * A callback that is invoked when an observable changes.
 */
type Subscription<T> = (value: T) => void

class ObservableBase<T> {
  #subscriptions: Set<Subscription<T>> = new Set()

  /**
   * Adds a callback to run in response to changes in the observable.
   * @param onChange a callback to run in response to changes in the observable
   * @returns a function to unsubscribe from the observable
   */
  subscribe(onChange: Subscription<T>) {
    this.#subscriptions.add(onChange)
    return () => {
      this.#subscriptions.delete(onChange)
    }
  }

  protected notify(value: T) {
    for (const onChange of this.#subscriptions) {
      onChange(value)
    }
  }
}

/**
 * A value that can be observed for changes.
 */
export class ObservableValue<T> extends ObservableBase<T> implements Observable<T> {
  #value: T

  constructor(value: T) {
    super()
    this.#value = value
  }

  /**
   * The current value of the observable.
   */
  get value() {
    return this.#value
  }

  /**
   * Updates the value of the observable.
   */
  set value(value: T) {
    if (this.#value === value) return

    this.#value = value
    this.notify(value)
  }
}

/**
 * A Set that can be observed for changes to its contents.
 */
export class ObservableSet<T> extends ObservableBase<Set<T>> implements Observable<Set<T>> {
  #value: Set<T>
  #memberObservables: Map<T, ObservableValue<boolean>> = new Map()

  constructor(...args: ConstructorParameters<typeof Set<T>>) {
    super()
    this.#value = new Set(...args)
  }

  /**
   * The Set underlying the observable.
   */
  get value() {
    return this.#value
  }

  /**
   * Returns an observable boolean that indicates whether the Set contains a
   * given value. This observable will be updated if the given value is added
   * to or removed from the Set.
   * @param value the value to check for
   */
  has(value: T): ObservableValue<boolean> {
    if (!this.#memberObservables.has(value)) {
      const observable = new ObservableValue(this.#value.has(value))
      this.#memberObservables.set(value, observable)
    }
    return this.#memberObservables.get(value)!
  }

  /**
   * Adds the given value to the Set.
   * Updates subscribers to the Set if the value was added.
   * Updates subscribers to the given value's membership via `has` if it was added.
   * @param value the value to add
   */
  add(value: T): void {
    if (this.#value.has(value)) return

    this.#value.add(value)

    if (this.#memberObservables.has(value)) {
      this.#memberObservables.get(value)!.value = true
    }

    this.notify(this.#value)
  }

  /**
   * Removes the given value from the Set.
   * Updates subscribers to the Set if the value was removed.
   * Updates subscribers to the given value's membership via `has` if it was removed.
   * @param value the value to remove
   */
  delete(value: T): void {
    if (!this.#value.has(value)) return

    this.#value.delete(value)

    if (this.#memberObservables.has(value)) {
      this.#memberObservables.get(value)!.value = false
    }

    this.notify(this.#value)
  }

  /**
   * Removes all values from the Set.
   * Updates subscribers to the Set if any values were removed.
   * Updates subscribers to each value that was removed.
   */
  clear(): void {
    if (this.#value.size === 0) return

    this.#value.clear()

    for (const observable of this.#memberObservables.values()) {
      observable.value = false
    }

    this.notify(this.#value)
  }
}

/**
 * A Map that can be observed for changes to its contents.
 */
export class ObservableMap<K, V> extends ObservableBase<Map<K, V>> implements Observable<Map<K, V>> {
  #value: Map<K, V>
  #keyObservables: Map<K, ObservableValue<boolean>> = new Map()
  #valueObservables: Map<K, ObservableValue<V | undefined>> = new Map()

  constructor(...args: ConstructorParameters<typeof Map<K, V>>) {
    super()
    this.#value = new Map(...args)
  }

  /**
   * The Map underlying the observable.
   */
  get value() {
    return this.#value
  }

  /**
   * Returns an observable boolean that indicates whether the Map contains a
   * given key. This observable will be updated if the given value is added
   * to or removed from the Map.
   * @param key the key to check for
   */
  has(key: K): ObservableValue<boolean> {
    if (!this.#keyObservables.has(key)) {
      const observable = new ObservableValue(this.#value.has(key))
      this.#keyObservables.set(key, observable)
    }
    return this.#keyObservables.get(key)!
  }

  /**
   * Returns an observable value that contains the value associated with the
   * given key, or undefined if the Map does not contain the key. This observable
   * will be updated if the key is added to or removed from the Map, or if the
   * value associated with the key changes.
   * @param key the key for which to retrieve the value
   */
  get(key: K): ObservableValue<V | undefined> {
    if (!this.#valueObservables.has(key)) {
      const observable = new ObservableValue(this.#value.get(key))
      this.#valueObservables.set(key, observable)
    }
    return this.#valueObservables.get(key)!
  }

  /**
   * Associates the given value with the given key in the Map.
   * Updates subscribers to the Map if the key did not already have this value.
   * Updates subscribers to the given key's membership via `has` if it was newly added.
   * Updates subscribers to the given key's value via `get` if it changed.
   * @param key the key for which to add the value
   * @param value the value to add
   */
  set(key: K, value: V): void {
    if (this.#value.get(key) === value) return

    this.#value.set(key, value)

    if (this.#keyObservables.has(key)) {
      this.#keyObservables.get(key)!.value = true
    }

    if (this.#valueObservables.has(key)) {
      this.#valueObservables.get(key)!.value = value
    }

    this.notify(this.#value)
  }

  /**
   * Removes the value associated with the given key from the Map.
   * Updates subscribers to the Map if the key was removed.
   * Updates subscribers to the given key's membership via `has` if it was removed.
   * Updates subscribers to the given key's value via `get` if it was removed.
   * @param key the key to remove
   */
  delete(key: K): void {
    if (!this.#value.has(key)) return

    this.#value.delete(key)

    if (this.#keyObservables.has(key)) {
      this.#keyObservables.get(key)!.value = false
    }

    if (this.#valueObservables.has(key)) {
      this.#valueObservables.get(key)!.value = undefined
    }

    this.notify(this.#value)
  }

  /**
   * Removes all keys and their values from the Map.
   * Updates subscribers to the Map if any keys were removed.
   * Updates subscribers to each removed key's membership via `has`.
   * Updates subscribers to each removed key's value via `get`.
   */
  clear(): void {
    if (this.#value.size === 0) return

    this.#value.clear()

    for (const observable of this.#keyObservables.values()) {
      observable.value = false
    }

    for (const observable of this.#valueObservables.values()) {
      observable.value = undefined
    }

    this.notify(this.#value)
  }
}
