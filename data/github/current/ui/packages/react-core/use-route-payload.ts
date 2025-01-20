import {useCurrentRouteState} from './use-current-route-state'

export function useRoutePayload<T>(): T {
  const state = useCurrentRouteState<{type: 'loaded'; data: unknown}>()
  const data = (state && state.type === 'loaded' ? state.data : undefined) as {payload: unknown} | undefined

  return data?.payload as T
}
