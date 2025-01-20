import {createContext} from 'react'
import type {AppRegistration} from './react-app-registry'
import type {History} from '@remix-run/router'

export interface AppContextType {
  routes: AppRegistration['routes']
  history: History
}

export const AppContext = createContext<AppContextType>(null as unknown as AppContextType)
