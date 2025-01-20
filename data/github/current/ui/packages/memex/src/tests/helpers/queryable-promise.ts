type QueryablePromise<T> = PromiseLike<T> & {
  isFulfilled: () => boolean
  isPending: () => boolean
  isRejected: () => boolean
}

/**
 * This function allow you to modify a JS Promise by adding some status properties.
 * Based on: http://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 *
 * But modified according to the specs of promises : https://promisesaplus.com/
 *
 * Source: https://ourcodeworld.com/articles/read/317/how-to-check-if-a-javascript-promise-has-been-fulfilled-rejected-or-resolved
 *
 * Adapted to support Typescript
 */
export function wrapQueryablePromise<T>(promise: PromiseLike<T> | QueryablePromise<T>): QueryablePromise<T> {
  // Don't modify any promise that has been already modified.
  if ('isFulfilled' in promise) {
    return promise
  }

  // Set initial state
  let isPending = true
  let isRejected = false
  let isFulfilled = false

  // Observe the promise, saving the fulfillment in a closure scope.
  const result = promise.then(
    function (v) {
      isFulfilled = true
      isPending = false
      return v
    },
    function (e) {
      isRejected = true
      isPending = false
      throw e
    },
  )

  const wrappedPromise = {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    ...result,
    isFulfilled() {
      return isFulfilled
    },
    isPending() {
      return isPending
    },
    isRejected() {
      return isRejected
    },
  }

  return wrappedPromise
}
