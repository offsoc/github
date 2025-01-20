export interface DebouncedAsyncFunction<Callback extends (...args: Array<any>) => Promise<any>> {
  /** The function that was debounced */
  (...args: Parameters<Callback>): Promise<Awaited<ReturnType<Callback>>>
  /** method that cancels the currently awaiting invocation of the function */
  cancel: () => void
}

class DebounceAsyncCancellation extends Error {
  constructor() {
    super('this invocation was cancelled')
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'DebounceAsyncCancellation'
  }
}

/**
 *
 * A custom debouncing impl that handles waiting for the last invocation of a promise
 * before resolving
 *
 * This is used instead of lodash.debounce, as the behavior of that call on a 'trailing' promise
 * is to only return the result of the last invocation, immediately, which will potentially return stale data
 * instead of properly waiting for the next incoming data
 *
 * @param callback An async fn to debounce
 * @param wait the time to wait before calling the fn
 * @returns a wrapped function, with a cancel method, that will only call the function after
 * the wait time expires without another call, assuming it has not been cancelled
 */
export function debounceAsync<Callback extends (...args: Array<any>) => Promise<any>>(
  callback: Callback,
  wait: number,
): DebouncedAsyncFunction<Callback> {
  let timeoutId: number | null = null

  const cancel = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const wrappedFunction = (...args: Parameters<Callback>) => {
    /**
     * When we call `wrapped function`, we want to immediately cancel any pending
     * timers, and then set a new timer to call the function after the wait time
     *
     * we only resolve the promise when the current timer hasn't changed from the
     * initial call to the function, when it's resolved, to avoid potentially
     * consuming stale data
     */
    return new Promise<Awaited<ReturnType<Callback>>>((resolve, reject) => {
      cancel()
      const currentTimeoutId = window.setTimeout(async () => {
        if (timeoutId === currentTimeoutId) {
          try {
            const response: Awaited<ReturnType<Callback>> = await callback(...args)
            if (timeoutId === currentTimeoutId) {
              return resolve(response)
            }
          } catch (err) {
            reject(err)
          }
        } else {
          reject(new DebounceAsyncCancellation())
        }
      }, wait)
      timeoutId = currentTimeoutId
    })
  }

  wrappedFunction.cancel = cancel

  return wrappedFunction
}
