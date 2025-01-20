import type {IObserverProps} from './observer-base'
import {ObserverBase} from './observer-base'

/**
 * Handles subscription to properties that are IObservableValues, so that components don't have to handle on their own.
 *
 * Usage:
 *
 * <Observer myObservableValue={observableValue}>
 *     {(props: {myObservableValue: string}) =>
 *         <MyComponent myObservableValue={props.myObservableValue} />
 *     }
 * </Observer>
 *
 * Your component will get re-rendered with the new value of myObservableValue whenever that value changes.
 */
export class Observer<TObservables> extends ObserverBase<IObserverProps<TObservables>> {}
