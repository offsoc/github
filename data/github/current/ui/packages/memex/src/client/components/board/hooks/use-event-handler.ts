import {useCallback} from 'react'

/**
 * Options passed to `useEventHandler`
 */
type Opts = {
  /**
   * Whether to prevent default behavior (default `true`)
   */
  preventDefault?: boolean

  /**
   * Whether to stop propagation (default `true`)
   */
  stopPropagation?: boolean
}

type SomeEvent = Event | React.SyntheticEvent
type Handler<E extends SomeEvent> = (e: E) => void

/**
 * Create an event handler that prevents default behavior and stops propagation
 * if the handler returns `true`, meaning that it handled the event.
 *
 * Note that the `opts` need not be added to the `deps` list—the hook will do
 * this for you, automatically (and separately for each option value, so no
 * there's need to memoize the `opts` object).
 *
 * @param handler The event handler
 * @param deps The dependencies in the handler, the same as you'd pass to `useCallback`
 * @param opts Options for disabling default behaviour prevention or disabling
 * propagation prevention
 */
export function useEventHandler<E extends SomeEvent>(handler: Handler<E>, deps: Array<any>, opts?: Opts): Handler<E> {
  return useEventHandlerImpl(handler, deps, opts)
}

/**
 * Create an event handler that stops event propagation.
 */
export function useStopPropagation<E extends SomeEvent>(): Handler<E> {
  return useEventHandlerImpl(null, [], {stopPropagation: true, preventDefault: false})
}

function useEventHandlerImpl<E extends SomeEvent>(
  handler: Handler<E> | null,
  deps: Array<any>,
  opts?: Opts,
): Handler<E> {
  const preventDefault = opts?.preventDefault ?? true
  const stopPropagation = opts?.stopPropagation ?? true

  return useCallback(
    (e: E) => {
      if (!handler || (handler && Boolean(handler(e)))) {
        if (preventDefault) e.preventDefault()
        if (stopPropagation) e.stopPropagation()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preventDefault, stopPropagation, ...deps],
  )
}
