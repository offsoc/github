import type {RouteStateMap} from './use-navigator'
import {createContext} from 'react'

export const RouteStateMapContext = createContext<RouteStateMap>({})
