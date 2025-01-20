/* eslint eslint-comments/no-use: off */
/* eslint-disable github/no-then */
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {startTransition, useCallback, useDebugValue, useEffect, useReducer, useRef, useState} from 'react'
import {identify} from 'object-identity'

type Args = [unknown, ...unknown[]] | readonly [unknown, ...unknown[]]
type Key = string | Args

type OKStatus = 200 | 201

export type Result<T> =
  | {ok: true; status: 204; data: null}
  | {ok: true; status: OKStatus; data: T}
  | {ok: false; status: number; error: unknown}

export type Fetcher<Data = unknown, K extends Key = Key> = K extends infer _Key
  ? (key: _Key, signal: AbortSignal) => Promise<Result<Data>>
  : never

export type MutationFetcher<Data = unknown, Payload = unknown, K extends Key = Key> = K extends infer _Key
  ? (key: _Key, payload: Payload, signal: AbortSignal) => Promise<Result<Data>>
  : never

type MutationConfig<Data, Payload> = (Payload extends never ? {payload?: undefined} : {payload: Payload}) & {
  onComplete?(data: Data, status: 200 | 201): void
  onComplete?(data: null, status: 204): void
  onError?(error: Error): void
  onError?(error: unknown, status: number): void
}

type State<Value> =
  | {loading: true; data?: Value | null; error?: unknown}
  | {loading: false; data: Value | null; error?: never}
  | {loading: false; data?: never; error: unknown}

type Action<Value> =
  | {type: 'LOADING'; data?: never; error?: never}
  | {type: 'SUCCESS'; data: Value | null; error?: never}
  | {type: 'ERROR'; data?: never; error: unknown}

function dataReducer<Value>(prev: State<Value>, action: Action<Value>): State<Value> {
  switch (action.type) {
    case 'LOADING':
      return {loading: true, data: prev.data, error: prev.error}
    case 'SUCCESS':
      return {loading: false, data: action.data}
    case 'ERROR':
      return {loading: false, error: action.error}
    default:
      throw new Error('Invalid action type')
  }
}

type LazyOptions<Data> = {
  initialData?: Data
}

/**
 * A hook to fetch data on render. This hook is sensative to input parameters, so be sure to have stable references.
 *
 * #### Why lazy?
 * Named "lazy" as the data isnt attempted to fetch by the time we go to render. So its lazy.
 *
 * @example
 *
 * ```tsx
 * function MyComponent() {
 *    const {data, loading} = useLazyData('/my-api', fetcher)
 *
 *   return <p>{loading ? 'loading' : data.name}</p>
 * }
 * ```
 */
export function useLazyData<Data, K extends Key = Key>(
  key: K,
  fetcher: Fetcher<Data, K>,
  {initialData}: LazyOptions<Data> = {initialData: undefined},
) {
  const keyRef = useRef(key)
  const fetcherRef = useRef(fetcher)
  const initialFetch = useRef(!!initialData)

  useLayoutEffect(() => {
    fetcherRef.current = fetcher
    if (key !== keyRef.current && initialFetch.current) {
      initialFetch.current = false
    }
    keyRef.current = key
  })

  const initialState = initialData
    ? {error: undefined, data: initialData, loading: false}
    : {loading: true, data: undefined}
  const [state, dispatch] = useReducer(dataReducer<Data>, initialState as State<Data>)

  const id = identify(key)

  const performFetch = useCallback(
    async (abortSignal: AbortSignal) => {
      dispatch({type: 'LOADING'})
      try {
        const result = await fetcherRef.current(
          // @ts-expect-error the key is fine, public api enforces it
          keyRef.current,
          abortSignal,
        )

        if (result.ok) return void dispatch({type: 'SUCCESS', data: result.data})
        dispatch({type: 'ERROR', error: result.error})
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Do nothing
          return
        }

        dispatch({type: 'ERROR', error})
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  )

  useEffect(() => {
    if (initialFetch.current) {
      return
    }

    const abortController = new AbortController()
    performFetch(abortController.signal)

    return () => {
      // if the component unmounts, we want to abort the fetch
      // or if our input params change, and a fetch is inflight, also abort
      abortController.abort()
    }
  }, [performFetch])

  useDebugValue(state.data)

  return state
}

const COMMIT_CACHE: Record<string, Promise<unknown>> = {}

/**
 * If you wish to mutate some data for your json backed service, this method will provide you with a stable method to call this.
 *
 * @example
 *
 * ```tsx
 * function MyComponent() {
 *   const [commit, loading] = useMutation('/my-api', fetcher)
 *
 *  return <button onClick={() => commit({payload: {name: 'test'}})}>Click me</button>
 * }
 */
export function useMutation<Payload, Data = unknown, K extends Key = Key>(
  key: K,
  fetcher: MutationFetcher<Data, Payload, K>,
) {
  const fetcherRef = useRef(fetcher)
  const keyRef = useRef(key)

  useLayoutEffect(() => {
    fetcherRef.current = fetcher
    keyRef.current = key
  })

  const abortControllers = useRef(new Set<AbortController>())
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      for (const abortController of abortControllers.current) {
        abortController.abort()
      }
    }
  }, [])

  const [loading, setLoading] = useState(false)

  const commit = useCallback((mutationConfig: MutationConfig<Data, Payload>) => {
    startTransition(() => {
      setLoading(true)

      const id = keyRef.current + identify(mutationConfig.payload)

      let promise: Promise<Result<Data>> = COMMIT_CACHE[id] as Promise<Result<Data>>

      if (promise == null) {
        const abortController = new AbortController()
        abortControllers.current.add(abortController)

        COMMIT_CACHE[id] = promise = fetcherRef
          .current(
            // @ts-expect-error the key is fine, public api enforces it
            keyRef.current,
            mutationConfig.payload,
            abortController.signal,
          )
          .finally(() => {
            abortControllers.current.delete(abortController)
            delete COMMIT_CACHE[id]
          })
      }

      promise
        // purposly chaning .then to encourage the .onComplete/.onError to be called
        .then(result => {
          // @ts-expect-error ts(2769) — the types are designed for consumer (data: Data|null), this is safe to just pass
          if (result.ok) mutationConfig.onComplete?.(result.data, result.status)
          else mutationConfig.onError?.(result.error, result.status)
        })
        .catch(error => {
          if (error instanceof Error && error.name === 'AbortError') {
            // Do nothing
            return
          }

          mutationConfig.onError?.(error)
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }, [])

  return [commit, loading] as [typeof commit, typeof loading]
}

// --

export async function genericResponseHandler<Data>(response: Response): Promise<Result<Data>> {
  const status = response.status

  // If the status was 204, we don't parse the body, and simply return.
  if (response.ok && status === 204) return {ok: true, status, data: null}

  const data: Data = await response.json()
  if (response.ok) return {ok: true, status: status as OKStatus, data}
  return {ok: false, status, error: data}
}
