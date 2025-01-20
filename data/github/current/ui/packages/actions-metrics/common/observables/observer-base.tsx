// eslint-disable-next-line filenames/match-regex
import {Component, Children, cloneElement, type DetailedReactHTMLElement} from 'react'
import type {
  IObservableValue,
  IObservable,
  IObservableLikeArray,
  IObservableLikeValue,
  IReadonlyObservableArray,
  IReadonlyObservableValue,
} from './observable'
import {ObservableLike} from './observable'

type ArrayMember<T> = T extends Array<infer U> ? U : never

export type ObservedArgs<T> = T extends IObservable<infer U> ? U : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IObservableExpression<T = any> {
  /**
   * Using an observableExpression you can sign up for an action instead of
   * all actions which is the default.
   */
  action?: string

  /**
   * filter function that determines whether or not an action should affect
   * the state of the Observer.
   *
   * @param value The observable value that is being supplied for the action.
   * @param action The action that has taken place.
   *
   * @returns true if the Observer should setState, false if the change should
   * be ignored.
   */
  filter?: (value: ObservedArgs<T>, action: string) => boolean

  /**
   * The observableValue is the value being observed. When actions are fired,
   * the filter is called and the results determine whether the component
   * changes state.
   */
  observableValue: T | IObservableLikeValue<T> | IObservableLikeArray<ArrayMember<T>>
}

/** Extracts the observed type from an IReadonlyObservableValue or IReadonlyObservableArray */
type SimpleObserved<T> = T extends IReadonlyObservableArray<infer U>
  ? U[]
  : T extends IReadonlyObservableValue<infer V>
    ? V
    : T

/** Extracts the observed type from an IObservableExpression or IReadonlyObservableValue or IReadonlyObservableArray */
export type Observed<T> = T extends IObservableExpression<infer W> ? SimpleObserved<W> : SimpleObserved<T>

/** Converts all observable members of T to their observed type */
export type ObservedMembers<T> = {
  [P in keyof Omit<T, 'children'>]: Observed<T[P]>
}

/** The child of an <Observer> element. */
export type ObserverChildFunction<TObservables> = (props: ObservedMembers<TObservables>) => React.ReactNode

export type IObserverProps<TObservables> = TObservables & {
  /**
   * Called whenever componentDidUpdate is run by the Observer
   * (after subscriptions have been updated).
   * Useful in situations where you need to be notified when Observer updates
   * happen, but don't want to insert a new component just for the lifecycle methods.
   */
  onUpdate?: () => void

  /**
   * All props that should be passed down to the child element.
   * These properties are IObservableLikeValues, meaning that if they are observable,
   * we will attempt to subscribe to their changes.
   */
  children: ObserverChildFunction<TObservables>
}

export interface IUncheckedObserverProps {
  /**
   * Called whenever componentDidUpdate is run by the Observer
   * (after subscriptions have been updated).
   * Useful in situations where you need to be notified when Observer updates
   * happen, but don't want to insert a new component just for the lifecycle methods.
   */
  onUpdate?: () => void

  /**
   * All props that should be passed down to the child element.
   * These properties are IObservableLikeValues, meaning that if they are observable,
   * we will attempt to subscribe to their changes.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: IObservableLikeValue<any> | IObservableExpression
}

export interface IObserverState<TProps> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: {[propName: string]: any}
  oldProps: Partial<TProps>
}

interface ISubscribable<TProps> {
  subscribe(propName: string, props: TProps): void
  unsubscribe(propName: string, props: TProps): void
  hasSubscription(propName: string): boolean
}

interface ISubscription {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delegate: (value: any, action?: string) => void
  action: string | undefined
}

/**
 * Handles subscription to properties that are IObservableValues, so that components don't have to handle on their own.
 *
 * Usage:
 *
 * <Observer myObservableValue={observableValue}>
 *     <MyComponent myObservableValue='' />
 * </Observer>
 *
 * Your component will get re-rendered with the new value of myObservableValue whenever that value changes.
 * Additionally, any additional props set on the Observer will also get passed down.
 */
export class ObserverBase<TProps extends {onUpdate?: () => void}> extends Component<TProps, IObserverState<TProps>> {
  public static getDerivedStateFromProps<TProps>(
    props: Readonly<TProps>,
    state: Readonly<IObserverState<TProps>>,
  ): Partial<IObserverState<TProps>> {
    const newState = updateSubscriptionsAndState(state.oldProps, props, state)
    if (newState != null) {
      return {...newState, oldProps: props}
    }

    return {oldProps: props}
  }

  private subscribedProps: TProps
  private subscriptions: {[propName: string]: ISubscription}

  constructor(props: Readonly<TProps>) {
    super(props)

    this.subscriptions = {}

    // Initialize the state with the initial value of the observable.
    const state: IObserverState<TProps> = {values: {}, oldProps: {}}
    for (const propName in props) {
      state.values[propName] = getPropValue(props[propName])
    }

    this.state = state
  }

  public override render(): JSX.Element {
    const newProps: Partial<TProps> = {}

    // Copy over any properties from the observable component to the children.
    for (const key in this.state.values) {
      if (key !== 'children') {
        newProps[key as keyof TProps] = this.state.values[key]
      }
    }

    if (typeof this.props['children' as keyof TProps] === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child: (props: TProps) => JSX.Element = this.props['children' as keyof TProps] as any
      return child(newProps as TProps)
    } else {
      const child = Children.only(this.props['children' as keyof TProps]) as DetailedReactHTMLElement<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        HTMLElement
      >
      return cloneElement(child, {...child.props, ...newProps}, child.props.children)
    }
  }

  public override componentDidMount(): void {
    this.updateSubscriptionsAndStateAfterRender()
  }

  public override componentDidUpdate(): void {
    this.updateSubscriptionsAndStateAfterRender()

    if (this.props.onUpdate) {
      this.props.onUpdate()
    }
  }

  public override componentWillUnmount(): void {
    // Unsubscribe from any of the observable properties.
    for (const propName in this.subscribedProps) {
      this.unsubscribe(propName, this.subscribedProps)
    }
  }

  public subscribe(propName: string, props: TProps) {
    if (propName !== 'children') {
      let observableExpression: IObservableExpression | undefined
      let observableValue = props[propName as keyof TProps]
      let action: string | undefined

      // If this is an observableExpression, we need to subscribe to the value
      // and execute the filter on changes.
      if (observableValue && (observableValue as unknown as IObservableExpression).observableValue !== undefined) {
        observableExpression = observableValue as unknown as IObservableExpression
        observableValue = observableExpression.observableValue
        action = observableExpression.action
      }

      if (ObservableLike.isObservable(observableValue)) {
        const delegate = this.onValueChanged.bind(
          this,
          propName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          observableValue as unknown as IObservableValue<any>,
          observableExpression,
        )
        ObservableLike.subscribe(observableValue, delegate, action)
        this.subscriptions[propName] = {delegate, action} as ISubscription
      }
    }
  }

  public unsubscribe(propName: string, props: TProps) {
    if (propName !== 'children') {
      const observableValue = getObservableValue(props[propName as keyof TProps])

      if (ObservableLike.isObservable(observableValue)) {
        const subscription = this.subscriptions[propName]
        ObservableLike.unsubscribe(observableValue, subscription!.delegate, subscription!.action)
        delete this.subscriptions[propName]
      }
    }
  }

  public hasSubscription(propName: string) {
    return !!this.subscriptions[propName]
  }

  private updateSubscriptionsAndStateAfterRender() {
    const newState = updateSubscriptionsAndState(
      this.subscribedProps,
      this.props,
      this.state,
      this as ISubscribable<TProps>,
    )
    if (newState != null) {
      this.setState(newState)
    }

    this.subscribedProps = {...this.props}
  }

  private onValueChanged(
    propName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    observableValue: IObservableValue<any>,
    observableExpression: IObservableExpression | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    action: string,
  ) {
    let setState = true

    if (!(propName in this.subscriptions)) {
      return
    }

    // If this is an ObservableExpression we will call the filter before setting state.
    if (observableExpression && observableExpression.filter) {
      setState = observableExpression.filter(value, action)
    }
    if (setState) {
      this.setState((prevState: Readonly<IObserverState<TProps>>, _props: Readonly<TProps>) => {
        return {
          values: {
            ...prevState.values,
            [propName]: observableValue.value || value,
          },
        }
      })
    }
  }
}

function getObservableValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propValue: IObservableValue<any> | IObservableExpression | any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): IObservableValue<any> | any {
  if (propValue && propValue.observableValue !== undefined) {
    return propValue.observableValue
  }

  return propValue
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPropValue(propValue: IObservableValue<any> | IObservableExpression | any): any {
  return ObservableLike.getValue(getObservableValue(propValue))
}

function updateSubscriptionsAndState<TProps>(
  oldProps: TProps,
  newProps: TProps,
  state: IObserverState<TProps>,
  component?: ISubscribable<TProps>,
): IObserverState<TProps> | null {
  // We need to unsubscribe from any observable values on old props and
  // subscribe to any observable values on new props.
  // In addition, if any of the values of the observables on the new props
  // differ from the value on the state, then we need to update the state.
  // This is possible if the value of the observable changed while the value
  // was being rendered, but before we had set up the subscription.
  // If we want to unsubscribe/resubscribe, then a component should be passed,
  // since this method is always called statically.

  const newState: IObserverState<TProps> = {...state}
  let stateChanged = false
  if (oldProps) {
    for (const propName in oldProps) {
      const oldValue = getObservableValue(oldProps[propName as keyof TProps])
      const newValue = getObservableValue(newProps[propName as keyof TProps])

      if (oldValue !== newValue) {
        component && component.unsubscribe(propName, oldProps)
        if (newValue === undefined) {
          delete newState.values[propName]
          stateChanged = true
        }
      }
    }
  }

  for (const propName in newProps) {
    const oldValue = oldProps && getObservableValue(oldProps[propName])
    const newValue = getObservableValue(newProps[propName])

    if (oldValue !== newValue || (component && !component.hasSubscription(propName))) {
      component && component.subscribe(propName, newProps)

      // Look for changes in the observables between creation and now.
      if (state.values[propName] !== getPropValue(newValue)) {
        newState.values[propName] = getPropValue(newValue)
        stateChanged = true
      }
    }
  }

  // If any state updates occurred update the state now.
  if (stateChanged) {
    return newState
  }

  return null
}

/**
 * UncheckedObserver is like Observer, except that it performs less (no) typechecking on the child observer function,
 * and allows child React elements.
 *
 * Usage:
 *
 * <Observer myObservableValue={observableValue}>
 *     {(props: {myObservableValue: string}) =>
 *         <MyComponent myObservableValue={props.myObservableValue} />
 *     }
 * </Observer>
 *
 * -or-
 *
 * <Observer myObservableValue={observableValue}>
 *     <MyComponent myObservableValue='' />
 * </Observer>
 *
 * Your component will get re-rendered with the new value of myObservableValue whenever that value changes.
 * Additionally, any additional props set on the Observer will also get passed down.
 */
export class UncheckedObserver extends ObserverBase<IUncheckedObserverProps> {}
