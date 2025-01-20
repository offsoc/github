import {createContext, useContext} from 'react'
import type {AppContextValue} from '../security-products-enablement-types'

export const AppContext = createContext<AppContextValue | undefined>(undefined)

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within a AppContext.Provider')
  }
  return context
}
