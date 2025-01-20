import {useContext} from 'react'
import {useLocation} from 'react-router-dom'
import {RouteStateMapContext} from './route-state-map-context'

export function useCurrentRouteState<T>() {
  const routeStateMap = useContext(RouteStateMapContext)
  const location = useLocation()

  return routeStateMap[location.key] as T
}
