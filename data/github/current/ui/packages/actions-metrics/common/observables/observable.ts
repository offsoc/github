import React from 'react'

/**
 * Core client interface for an IObservable collection keyed by K with values of type V.
 */
export interface IObservable<T, TAction extends string = string> {
  /**
   * subscribe should be called when the caller wants to be notified about changes to
   * the underlying data. The caller should only call once per delegate, but will
   * get notified N times (once for each call to subscribe).
   *
   * @param observer - This is the delegate to be notified when the underlying data changes.
   *
   * @param action - Optional argument that allows the consumer to supply a action
   *  with the delegate. If the action is supplied only those actions are delievered,
   *  while all actions are delivered is no action is supplied.
   *
   * @returns observer parameter, unchanged
   */
  subscribe: (observer: (value: T, action?: TAction) => void, action?: TAction) => (value: T, action?: TAction) => void

  /**
   * unsubscribe should be called with a previously supplied delegate to subscribe.
   * The client MUST call unsubscribe once for every call to subscribe with the
   * appropriate delegates.
   *
   * @param observer - This is the delegate that was previously registered with subscribe.
   *
   * @param action - Optional argument that defines the action that was subscribed to.
   */
  unsubscribe: (observer: (value: T, action?: TAction) => void, action?: TAction) => void
}

/**
 * IObservableEvent<T> encapsulates the data used to send a notification.
 */
interface IObservableEvent<T, TAction extends string = string> {
  // An IObservableEvent should ALWAYS have the _action value ...
  action: TAction

  // along with any other properties that are valid for the event type
  value: T
}

/**
 * An Observable implementation that will track a set of subscribers and supports
 * notifications when the underlying system changes.
 */
export class Observable<T, TAction extends string = string> implements IObservable<T, TAction> {
  private observers: {[action: string]: Array<(value: T, action: TAction) => void>} = {}
  private events?: Array<IObservableEvent<T, TAction>>
  protected subscriberCount = 0

  /**
   * notify is used to send the event to all subscribers that have signed up for this events
   * action. This means they have subscribed directly to this action, or to all actions.
   * If the caller requested the event be persisted the event will be fired in order to new
   * subscribers as well when they subscribe.
   *
   * @param value - The object that represents the event data.
   *
   * @param action - The action that happened on this observable to produce the event.
   *
   * @param persistEvent - Optional value that determines if all future subscribers will
   *  recieve the event as well.
   */
  public notify(value: T, action: TAction, persistEvent?: boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const executeObserverAction = (observer: (value: T, action: TAction) => void, value: T, action: TAction) => {
      try {
        observer(value, action)
      } catch (ex) {
        if (ex && typeof ErrorEvent === 'function') {
          window.dispatchEvent(
            new ErrorEvent('error', {
              error: ex,
              filename: 'Observable.ts',
              message: (ex as Error).message,
            }),
          )
        }
      }
    }

    // NOTE: We need to make a copy of the observers since they may change during notification.
    if (this.observers[action]) {
      const observers = this.observers[action].slice()
      for (let observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        executeObserverAction(observers[observerIndex]!, value, action)
      }
    }

    if (this.observers['']) {
      const observers = this.observers[''].slice()
      for (let observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        executeObserverAction(observers[observerIndex]!, value, action)
      }
    }

    // If the caller wants this event sent to all subscribers, even future ones, track it.
    if (persistEvent) {
      if (!this.events) {
        this.events = []
      }

      this.events.push({action, value})
    }
  }

  public subscribe(
    observer: (value: T, action: TAction) => void,
    action?: string,
  ): (value: T, action?: TAction) => void {
    action = action || ''
    if (!this.observers[action]) {
      this.observers[action] = []
    }

    this.observers[action]!.push(observer)
    this.subscriberCount++

    // Fire the callback for any events that were persisted when they were sent.
    if (this.events) {
      for (const event of this.events) {
        if (!action || event.action === action) {
          observer(event.value, event.action)
        }
      }
    }

    return observer as (value: T, action?: TAction) => void
  }

  public unsubscribe(observer: (value: T, action: TAction) => void, action?: string): void {
    action = action || ''
    if (this.observers[action]) {
      const observerIndex = this.observers[action]!.indexOf(observer)
      if (observerIndex >= 0) {
        this.observers[action]!.splice(observerIndex, 1)
        this.subscriberCount--
      }
    }
  }
}

export type IObservableLikeValue<T> = IObservableValue<T> | T
export type IObservableLikeArray<T> = IObservableArray<T> | IReadonlyObservableArray<T> | T[]

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ObservableLike {
  /**
   * Check whether the specified object is an observable or not.
   *
   * @param observableLike Object to perform observable check.
   */
  export function isObservable<T>(observableLike: IObservable<T> | unknown): observableLike is IObservable<T> {
    return !!observableLike && typeof (observableLike as IObservable<T>).subscribe === 'function'
  }

  /**
   * Gets the value of the specified observable like. If not observable, returns the passed argument.
   *
   * @param observableLike Object to get the value.
   * @returns Observable value or the observable like itself.
   */
  export function getValue<T>(observableLike: IObservableLikeValue<T>): T

  /**
   * Gets the value of the specified observable like. If not observable, returns the passed argument.
   *
   * @param observableLikeArray Object to get the value.
   * @returns Observable value or the observable like itself.
   */
  export function getValue<T>(observableArrayLike: IObservableLikeArray<T>): T[]

  export function getValue<T>(observableLike: IObservableLikeValue<T> | IObservableLikeArray<T>): T | T[] {
    if (isObservable(observableLike)) {
      return (observableLike as unknown as IObservableValue<T>).value
    }

    return observableLike as T
  }

  /**
   * Subscribes to the specified object if it is an observable.
   *
   * @param observableLike Object to subscribe its value change if applicable.
   * @param observer Delegate to be executed when the underlying data changes.
   * @param action Optional argument that allows the consumer to supply a action
   *  with the delegate. If the action is supplied only those actions are delievered,
   *  while all actions are delivered is no action is supplied.
   * @returns observer
   */
  export function subscribe<T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    observableLike: IObservable<T> | any,
    observer: (value: T, action: string) => void,
    action?: string,
  ): (value: T, action: string | undefined) => void {
    if (isObservable(observableLike)) {
      return (observableLike as IObservable<T>).subscribe(
        observer as (value: T, action?: string | undefined) => void,
        action,
      )
    }

    return () => {}
  }

  /**
   * Unsubscribes from the specified object if it is an observable.
   *
   * @param observableLike Object to subscribe its value change if applicable.
   * @param observer Delegate to be executed when the underlying data changes.
   * @param action Optional argument that allows the consumer to supply a action
   *  with the delegate. If the action is supplied only those actions are delievered,
   *  while all actions are delivered is no action is supplied.
   */
  export function unsubscribe<T>(
    observableLike: IObservable<T> | unknown,
    observer: (value: T, action: string) => void,
    action?: string,
  ): void {
    if (isObservable(observableLike)) {
      ;(observableLike as IObservable<T>).unsubscribe(observer as (value: T, action?: string) => void, action)
    }
  }
}

/**
 * An IReadonlyObservableValue<T> gives a readonly view of an IObservableValue<T>.
 *
 * The normal pattern to follow is for a parent object/component creates an IObservableValue<T>
 * and pass it to dependants as an IReadonlyObservableValue<T>. This prevents the callee
 * from changing the value and treating the relationship as a two way binding. Observables
 * are intended to be used as a one way binding where the object owner uses the observable to
 * notify others about changes to the value without giving them control over the value.
 */
export interface IReadonlyObservableValue<T> extends IObservable<T> {
  /**
   * Read access to the value being observed.
   */
  readonly value: T
}

/**
 * Given a type, returns the type that it is observing.
 */
export type ObservedValue<T> = T extends IReadonlyObservableValue<infer U> ? U : T

/**
 * An IObservableValue<T> tracks an instance of type T and allows consumers
 * be notified with the value is changed.
 *
 * EventTypes:
 *  set - T
 */
export interface IObservableValue<T> extends IReadonlyObservableValue<T> {
  /**
   * This is the current value of the observable.
   */
  value: T
}

export class ObservableValue<T> extends Observable<T> implements IObservableValue<T> {
  private v: T

  constructor(value: T) {
    super()
    this.v = value
  }

  public get value(): T {
    return this.v
  }

  public set value(value: T) {
    this.v = value
    this.notify(this.v, 'set')
  }
}

/**
 * When an action occurs on an IObservableObject the event should take the form
 * of an IObjectProperty<T> where T is the type of the value being stored.
 */
export interface IObjectProperty<T> {
  key: string
  value?: T
}

/**
 * An Observable collection is used to track a set of objects by name and offer notifications
 * for consumers when the collection has changed.
 *
 * EventTypes:
 *  add - ICollectionEvent<V>
 */
export interface IObservableObject<V> extends IObservable<IObjectProperty<V>> {
  /**
   * Adding an object to the collection will notify all observers of the collection
   * and keep track of the objects.
   *
   * @param objectName - name of the object be registered.
   *
   * @param objectDefinition - details of the object being registered
   */
  add: (objectName: string, objectDefinition: V) => void

  /**
   * get is used to retrieve the objectDefinition for named object.
   *
   * @param objectName - name of the object to get the definition.
   */
  get: (objectName: string) => V | undefined

  /**
   * Adds an object to the collection, overwriting the old
   *
   * @param objectName - name of the object be registered.
   *
   * @param objectDefinition - details of the object being registered
   */
  set: (objectName: string, objectDefinition: V) => void

  /**
   * A read-only collection of the existing objects.
   */
  keys: () => string[]
}

/**
 * An ObservableObject can be used to key a named collection of properties
 * and offer an observable endpoint.
 */
export class ObservableObject<V> extends Observable<IObjectProperty<V>> implements IObservableObject<V> {
  private objects: {[objectName: string]: V} = {}

  public add(objectName: string, objectDefinition: V): void {
    if (!this.objects.hasOwnProperty(objectName)) {
      this.objects[objectName] = objectDefinition
      this.notify({key: objectName, value: objectDefinition}, 'add')
    }
  }

  public get(objectName: string): V | undefined {
    return this.objects[objectName]
  }

  public set(objectName: string, objectDefinition: V): void {
    if (this.objects.hasOwnProperty(objectName)) {
      this.objects[objectName] = objectDefinition
      this.notify({key: objectName, value: objectDefinition}, 'replace')
    } else {
      this.add(objectName, objectDefinition)
    }
  }

  public keys(): string[] {
    return Object.keys(this.objects)
  }
}

/**
 * List of actions that are notified on the ObservableArray.
 */
export type ObservableArrayAction = 'change' | 'push' | 'pop' | 'splice' | 'removeAll'

/**
 * All ObservableArray events will have an action associated with them.
 */
export interface IObservableArrayEventArgs<T> {
  /**
   * Items added to ObservableArray.
   */
  addedItems?: T[]

  /**
   * Items that were changed.
   */
  changedItems?: T[]

  /**
   * The index that the operation started.
   */
  index: number

  /**
   * Items removed from ObservableArray.
   */
  removedItems?: T[]
}

/**
 * An Observable array is used to track an array of items and offer notifications
 * for consumers when the array has changed.
 *
 * EventTypes:
 *  change - { changedItems, index }
 *  push - {addedItems, index }
 *  pop - { index, removedItems}
 *  removeAll - {index, removedItems }
 *  splice - { addedItems, index, removedItems }
 */
export interface IReadonlyObservableArray<T> extends IObservable<IObservableArrayEventArgs<T>, ObservableArrayAction> {
  /**
   * Gets the number of the items in the ObservableArray.
   */
  readonly length: number

  /**
   * Gets all the items in the ObservableArray.
   */
  readonly value: T[]
}

/**
 * An Observable array is used to track an array of items and offer notifications
 * for consumers when the array has changed.
 *
 * EventTypes:
 *  change - { changedItems, index }
 *  push - {addedItems, index }
 *  pop - { index, removedItems}
 *  removeAll - {index, removedItems }
 *  splice - { addedItems, index, removedItems }
 */
export interface IObservableArray<T> extends IReadonlyObservableArray<T> {
  /**
   * Change can be used to update a set of items in the array. Using change instead
   * of splice allows any observers to potentially optimize the updates to only the
   * affected data.
   *
   * @param start Zero based index of the first item to change.
   * @param items The set of items to change.
   */
  change: (start: number, ...items: T[]) => number

  /**
   * The length property can be used to determine the number of elements in
   * the observable array.
   */
  readonly length: number

  /**
   * Appends new elements to an array, and returns the new length of the array.
   *
   * NOTE: Use of ...array places all items onto the stack which can cause the
   * browser to run out of stack space if you pass more than 32K/64K items (browser dependent).
   * Use "value" or add items in batches in this case.
   *
   * @param items - new elements of the ObservableArray.
   *
   * @returns - number of the newly inserted items.
   */
  push: (...items: T[]) => number

  /**
   * Removes the last element from an array and returns it.
   *
   * @returns - removed element or undefined if ObservableArray has no items.
   */
  pop: () => T | undefined

  /**
   * Remove all items from the array that match the specified filter
   *
   * @param filter - Delegate which returns true for each item to remove. If undefined, all items in the array are removed.
   */
  removeAll: (filter?: (item: T) => boolean) => void

  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   *
   * NOTE: Use of ...array places all items onto the stack which can cause the
   * browser to run out of stack space if you pass more than 32K/64K items (browser dependent).
   * Use "value" or add items in batches in this case.
   *
   * @param start - Zero-based location in the array from which to start removing elements.
   *
   * @param deleteCount - Number of elements to remove.
   *
   * @param items - Elements to insert into the array in place of the deleted elements.
   *
   * @returns - deleted elements.
   */
  splice: (start: number, deleteCount: number, ...items: T[]) => T[]

  /**
   * Gets all the items in ObservableArray.
   */
  value: T[]
}

/**
 * EventTypes:
 *  change - { changedItems, index }
 *  push - {addedItems, index }
 *  pop - { index, removedItems}
 *  removeAll - {index, removedItems }
 *  splice - { addedItems, index, removedItems }
 */
export class ObservableArray<T>
  extends Observable<IObservableArrayEventArgs<T>, ObservableArrayAction>
  implements IObservableArray<T>
{
  protected internalItems: T[]

  constructor(items: T[] = []) {
    super()
    this.internalItems = [...items] || []
  }

  public change(start: number, ...items: T[]): number {
    this.internalItems.splice(start, items.length, ...items)
    this.notify({index: start, changedItems: items}, 'change')

    return items.length
  }

  public changeOrderedBatch(batch: Array<{start: number; items?: T[]}>): number {
    const changedItems: T[] = []
    for (const el of batch) {
      if (el.items !== undefined && el.items.length) {
        this.internalItems.splice(el.start, el.items.length, ...el.items)
        changedItems.push(...el.items)
      }
    }

    this.notify({index: this.getMinItemIndexByBatch(batch), changedItems}, 'change')
    return batch.reduce((acc, val) => (acc += val.items ? val.items.length : 0), 0)
  }

  public get length(): number {
    return this.internalItems.length
  }

  public push(...items: T[]): number {
    if (items.length) {
      const index = this.internalItems.length
      this.internalItems.push(...items)
      this.notify({addedItems: items, index}, 'push')
    }

    return items.length
  }

  public pop(): T | undefined {
    const item = this.internalItems.pop()
    if (item !== undefined) {
      this.notify({index: this.internalItems.length, removedItems: [item]}, 'pop')
    }

    return item
  }

  public removeAll(filter?: (item: T) => boolean): T[] {
    const removedItems: T[] = []
    const remainingItems: T[] = []

    for (const item of this.internalItems) {
      if (!filter || filter(item)) {
        removedItems.push(item)
      } else {
        remainingItems.push(item)
      }
    }

    if (removedItems.length > 0) {
      this.internalItems.splice(0, this.internalItems.length)
      for (const item of remainingItems) {
        this.internalItems.push(item)
      }
      this.notify({index: 0, removedItems}, 'removeAll')
    }

    return removedItems
  }

  public splice(start: number, deleteCount: number, ...itemsToAdd: T[]): T[] {
    const removedItems = this.internalItems.splice(start, deleteCount, ...itemsToAdd)
    this.notify({addedItems: itemsToAdd, index: start, removedItems}, 'splice')

    return removedItems
  }

  public spliceOrderedBatch(batch: Array<{start: number; deleteCount: number; itemsToAdd?: T[]}>): T[] {
    const added: T[] = []
    const removed: T[] = []
    for (const el of batch) {
      let removedItems
      if (el.itemsToAdd !== undefined && el.itemsToAdd.length) {
        removedItems = this.internalItems.splice(el.start, el.deleteCount, ...el.itemsToAdd)
        added.push(...el.itemsToAdd)
      } else {
        removedItems = this.internalItems.splice(el.start, el.deleteCount)
      }

      removed.push(...removedItems)
    }

    this.notify({addedItems: added, index: this.getMinItemIndexByBatch(batch), removedItems: removed}, 'splice')

    return removed
  }

  public get value(): T[] {
    return this.internalItems
  }

  public set value(items: T[]) {
    // Preserve the original array, but avoid the "..." arguments issue with splice/push
    let removedItems: T[]
    if (items === this.internalItems) {
      // Special case for someone passing us the same internal array that we are already using
      // We don't need to modify the internalItems. The "removedItems" in the event is
      // not going to be accurate in the case that someone modified this internal array
      // outside of the observable -- we won't know the prior state in that case.
      removedItems = this.internalItems
    } else {
      // Clear out the existing items
      removedItems = this.internalItems.slice()
      this.internalItems.length = 0

      // Add all new items
      if (items.length) {
        for (const item of items) {
          this.internalItems.push(item)
        }
      }
    }
    this.notify({addedItems: items, index: 0, removedItems}, 'splice')
  }

  private getMinItemIndexByBatch(batch: Array<{start: number; items?: T[]}>): number {
    const itemChangesStartedAt = batch.reduce((minObject, currentObject) => {
      if (currentObject.start < minObject.start) {
        return currentObject
      }
      return minObject
    })

    return itemChangesStartedAt.start
  }
}

interface IObservableCollectionInternalEntry<T, TInput> {
  items: T[]
  observable?: IReadonlyObservableArray<TInput>
  subscriber?: (args: IObservableArrayEventArgs<TInput>) => void
  transformItems?: (input: TInput) => T | undefined
}

/**
 * An Observable Collection takes an arry of arrays or observable arrays
 * and flattens out the items into a single readonly observable array
 * (with all the underlying array values aggregated together).
 *
 * This handles subscribing to any underlying observable arrays and
 * updating the aggregate array as appropriate (and notifying subscribers)
 */
export class ObservableCollection<T>
  extends Observable<IObservableArrayEventArgs<T>, ObservableArrayAction>
  implements IReadonlyObservableArray<T>
{
  public get length(): number {
    if (!this.subscriberCount) {
      this.recalculateItems()
    }

    return this.items.length
  }

  public get value(): T[] {
    if (!this.subscriberCount) {
      this.recalculateItems()
    }

    return this.items
  }
  private collections: Array<IObservableCollectionInternalEntry<T, unknown>> = []
  private items: T[] = []

  /**
   * Adds an additional collection of items to the end of the array
   *
   * @param collection Array of items or an observable array of items
   * @params transformItems Delegate to process each item that is pulled from the given collection
   */
  public push<TInput = T>(
    collection: TInput[] | IReadonlyObservableArray<TInput>,
    transformItems?: (input: TInput) => T | undefined,
  ): void {
    let collectionEntry: IObservableCollectionInternalEntry<T, TInput> | undefined
    let pushedItems: TInput[] | undefined

    if (ObservableLike.isObservable(collection)) {
      const observable = collection as IReadonlyObservableArray<TInput>
      const subscriber = this.getSubscriber<TInput>(this.collections.length, transformItems)
      collectionEntry = {observable, subscriber, transformItems, items: []}
      pushedItems = observable.value

      if (this.subscriberCount) {
        ObservableLike.subscribe(collectionEntry.observable, subscriber)
      }
    } else if ((collection as TInput[]).length) {
      pushedItems = collection as TInput[]
      collectionEntry = {items: this.transformItems(pushedItems, transformItems)}
    }

    if (collectionEntry) {
      this.collections.push(collectionEntry as IObservableCollectionInternalEntry<T, unknown>)

      if (this.subscriberCount && pushedItems!.length) {
        const newItems = this.transformItems(pushedItems, transformItems)
        for (const newItem of newItems) {
          this.items.push(newItem)
        }
        this.notify({addedItems: newItems, index: this.items.length - newItems.length}, 'push')
      }
    }
  }

  public override subscribe(
    observer: (value: IObservableArrayEventArgs<T>, action: ObservableArrayAction) => void,
    action?: ObservableArrayAction,
  ): (value: IObservableArrayEventArgs<T>, action?: ObservableArrayAction) => void {
    const subscription = super.subscribe(observer, action)
    if (this.subscriberCount === 1) {
      this.recalculateItems()

      for (const collection of this.collections) {
        if (collection.subscriber) {
          collection.observable!.subscribe(collection.subscriber)
        }
      }
    }

    return subscription
  }

  public override unsubscribe(
    observer: (value: IObservableArrayEventArgs<T>, action: ObservableArrayAction) => void,
    action?: ObservableArrayAction,
  ): void {
    super.unsubscribe(observer, action)
    if (this.subscriberCount === 0) {
      for (const collection of this.collections) {
        if (collection.subscriber) {
          collection.observable!.unsubscribe(collection.subscriber)
        }
      }
    }
  }

  /**
   * Recalculate items. This is necessary while we work without subscribers, as we're not listening to changes in observable inner collections.
   * Once the first subscriber joins, items collection will be in sync real-time.
   */
  private recalculateItems() {
    this.items.length = 0
    for (const collection of this.collections) {
      if (collection.observable) {
        collection.items = this.transformItems(collection.observable.value, collection.transformItems)
      }
      for (const item of collection.items) {
        this.items.push(item)
      }
    }
  }

  private transformItems<TInput>(
    inputItems: TInput[] | undefined,
    transformInput: {(input: TInput): T | undefined} | undefined,
  ): T[] {
    let transformedItems: T[]
    if (!inputItems) {
      transformedItems = []
    } else if (transformInput) {
      transformedItems = []
      for (const inputItem of inputItems) {
        const transformedItem = transformInput(inputItem)
        if (transformedItem !== undefined) {
          transformedItems.push(transformedItem)
        }
      }
    } else {
      transformedItems = inputItems as unknown[] as T[]
    }
    return transformedItems
  }

  private getSubscriber<TInput>(
    collectionIndex: number,
    transformInput?: (input: TInput) => T | undefined,
  ): (args: IObservableArrayEventArgs<TInput>) => void {
    return (args: IObservableArrayEventArgs<TInput>) => {
      // Find the index in our aggregate array
      let index = args.index
      for (let i = 0; i < collectionIndex; i++) {
        index += this.collections[i]!.items.length
      }

      if (args.changedItems) {
        // Handle change event
        const changedItems = this.transformItems(args.changedItems, transformInput)
        this.items.splice(index, args.changedItems.length, ...changedItems)
        this.notify({changedItems, index}, 'change')
      } else {
        // Handle splice, push, pop events
        const removedItems = this.transformItems(args.removedItems, transformInput)
        const addedItems = this.transformItems(args.addedItems, transformInput)

        // We would normally just call splice here with 3 arguments, but splice takes a "..." argument for added items
        // which passes array elements on the stack and is therefore limited (to 32K/64K on some browsers)

        // Remove the removedItems first
        this.items.splice(index, removedItems.length)

        // Slice-off any remaining items past where we want to insert
        const endItems = this.items.splice(index)

        // Push the addedItems followed by the endItems that we just removed
        for (const item of addedItems) {
          this.items.push(item)
        }
        for (const item of endItems) {
          this.items.push(item)
        }

        this.notify({removedItems, addedItems, index}, 'splice')
      }
    }
  }
}

/**
 * Indicates an object that has a ready property to let consumers know when the object is ready.
 */
export interface IReadyable {
  /**
   * An observable which lets the consumer know when the object is ready
   */
  ready: IObservableValue<boolean>
}

/**
 * Indicates an object that has a ready property to let consumers know when the object is ready.
 */
export interface IReadonlyReadyable {
  /**
   * An observable which lets the consumer know when the object is ready
   */
  ready: IReadonlyObservableValue<boolean>
}

/**
 * An observable array which lets consumers know when its initial items have been populated and it is ready to use.
 */
export interface IReadyableReadonlyObservableArray<T> extends IReadonlyObservableArray<T>, IReadonlyReadyable {}

/**
 * An observable array which lets consumers know when its initial items have been populated and it is ready to use.
 */
export interface IReadyableObservableArray<T> extends IObservableArray<T>, IReadyable {}

export class ReadyableObservableArray<T> extends ObservableArray<T> implements IReadyableObservableArray<T> {
  public readonly ready: ObservableValue<boolean>
  constructor(items: T[] = [], ready = false) {
    super(items)
    this.ready = new ObservableValue(ready)
  }
}

/**
 * React Hooks extension that allows the consumer to track Observables with a useState like
 * hooks API.
 *
 * @param initialState Initial value for the state, or a function that will resolve the value
 * the when the value is initialized.
 */
export function useObservable<T>(
  initialState: T | (() => T),
): [ObservableValue<T>, React.Dispatch<React.SetStateAction<T>>] {
  const [underlyingState] = React.useState<T>(initialState)

  const [observable] = React.useState<ObservableValue<T>>(() => new ObservableValue<T>(underlyingState))
  const updateState = (updatedState: T | ((prevState: T) => T)) => {
    if (typeof updatedState === 'function') {
      observable.value = (updatedState as (prevState: T) => T)(observable.value)
    } else {
      observable.value = updatedState
    }
  }

  return [observable, updateState]
}

/**
 * React Hooks extension that allows the consmer to track ObservableArrays with a useState like
 * hooks API.
 *
 * @param initialState Initial value for the state, or a function that will resolve the value
 * the when the value is initialized.
 */
export function useObservableArray<T>(
  initialState: T[] | (() => T[]),
): [IObservableArray<T>, React.Dispatch<React.SetStateAction<T[]>>] {
  const [underlyingState] = React.useState<T[]>(initialState)

  const reactState = React.useState<ObservableArray<T>>(new ObservableArray<T>(underlyingState))
  const updateState = (updatedState: T[] | ((prevState: T[]) => T[])) => {
    if (typeof updatedState === 'function') {
      reactState[0].value = (updatedState as (prevState: T[]) => T[])(reactState[0].value)
    } else {
      reactState[0].value = updatedState
    }
  }

  return [reactState[0], updateState]
}

/**
 * React Hooks extension that provides a constant reference to an ObservableValue which will update
 * based on another observable.
 *
 * @remarks
 * The subscription will be safely unsubscribed any time:
 * - The source observable points to a new object
 * - The callback dependencies array changes
 * - The component is unmounted
 *
 * @param sourceObservable
 * @param getDerivedValue
 * @param callbackDependencies
 */
export function useDerivedObservable<TSource, T>(
  sourceObservable: IObservableValue<TSource>,
  getDerivedValue: (source: TSource) => T,
  callbackDependencies: unknown[],
): IReadonlyObservableValue<T> {
  const initialValue = getDerivedValue(sourceObservable.value)
  const [observable, setValue] = useObservable<T>(initialValue)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getDerivedValueCallback = React.useCallback(getDerivedValue, callbackDependencies)

  // Update the observable's value when the source observable changes its value
  useSubscription(
    sourceObservable,
    (newValue: TSource) => {
      const derivedValue = getDerivedValueCallback(newValue)
      setValue(derivedValue)
    },
    callbackDependencies,
  )

  return observable
}

/**
 * React Hooks extension that fires a callback whenever the provided observable changes.
 * Note that when an observable array is provided, the callback will be called with the entire array rather
 * than with the usual observable array subscription args.
 *
 * @remarks
 * The subscription will be safely unsubscribed any time:
 * - The source observable points to a new object
 * - The callback dependencies array changes
 * - The component is unmounted
 *
 * @param sourceObservable
 * @param callbackFn
 * @param callbackDependencies
 */
export function useSubscription<T>(
  sourceObservable: IObservableValue<T>,
  callbackFn: (value: T) => void,
  callbackDependencies?: unknown[],
): void
export function useSubscription<T>(
  sourceObservable: IObservableArray<T>,
  callbackFn: (value: T[]) => void,
  callbackDependencies?: unknown[],
): void
export function useSubscription<T>(
  sourceObservable: IObservableValue<T> | IObservableArray<T>,
  callbackFn: (value: T) => void,
  callbackDependencies: unknown[] = [],
): void {
  const isFirstRenderFinished = React.useRef(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = React.useCallback(callbackFn, callbackDependencies)

  // Call the callback when the source observable points to a new object, but not on the first render with the first observable
  React.useEffect(() => {
    if (!isFirstRenderFinished.current) {
      isFirstRenderFinished.current = true
      return
    }
    callback(sourceObservable.value as T)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceObservable])

  // Call the callback when the source observable changes its value
  React.useEffect(() => {
    const doCallback = () => callback(sourceObservable.value as T)
    sourceObservable.subscribe(doCallback)
    return () => sourceObservable.unsubscribe(doCallback)
  }, [sourceObservable, callback])
}

/**
 * React Hooks extension that debounces the firing of a callback whenever the provided observable changes.
 * Note that when an observable array is provided, the callback will be called with the entire array rather
 * than with the usual observable array subscription args.
 *
 * @remarks
 * The subscription will be safely unsubscribed any time:
 * - The source observable points to a new object
 * - The timeout value changes
 * - The callback dependencies array changes
 * - The component is unmounted
 *
 * @param sourceObservable
 * @param callbackFn
 * @param callbackDependencies
 */
export function useDebouncedSubscription<T>(
  sourceObservable: IObservableValue<T>,
  debounceMs: number,
  callbackFn: (value: T) => void,
  callbackDependencies?: unknown[],
): void
export function useDebouncedSubscription<T>(
  sourceObservable: IObservableArray<T>,
  debounceMs: number,
  callbackFn: (value: T[]) => void,
  callbackDependencies?: unknown[],
): void
export function useDebouncedSubscription<T>(
  sourceObservable: IObservableValue<T> | IObservableArray<T>,
  debounceMs: number,
  callbackFn: (value: T) => void,
  callbackDependencies: unknown[] = [],
): void {
  const timeoutRef = React.useRef<number | null>(null)

  useSubscription(
    sourceObservable as IObservableValue<T>,
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callbackFn(value)
        timeoutRef.current = null
      }, debounceMs) as unknown as number
    },
    [debounceMs, ...callbackDependencies],
  )
}
