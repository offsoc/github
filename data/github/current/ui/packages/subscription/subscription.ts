// TODO: Research replacing this module with a composable observable library.
// The scope of this module simply returns a finalized subscription object.

// Lightweight TC39 observable Subscription.
export class Subscription {
  constructor(cleanup: () => void) {
    this.closed = false
    this.unsubscribe = () => {
      cleanup()
      this.closed = true
    }
  }

  // A boolean value indicating whether the subscription is closed.
  closed: boolean
  // Cancels the subscription.
  unsubscribe: () => void
}

// Create a Subscription from an event.
export function fromEvent(
  target: EventTarget,
  eventName: string,
  onNext: EventListenerOrEventListenerObject,
  options: AddEventListenerOptions = {capture: false},
): Subscription {
  target.addEventListener(eventName, onNext, options)
  return new Subscription(() => {
    target.removeEventListener(eventName, onNext, options)
  })
}

// Combine several subscriptions into a single subscription.
//
// subscriptions - A list of subscriptions to combine.
//
// Returns a single, combined, subscription.
export function compose(...subscriptions: Subscription[]): Subscription {
  return new Subscription(() => {
    for (const subscription of subscriptions) {
      subscription.unsubscribe()
    }
  })
}
