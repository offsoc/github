import {createContext, useContext} from 'react'
import type {SelectedRepositoryContextValue} from '../security-products-enablement-types'

export const SelectedRepositoryContext = createContext<SelectedRepositoryContextValue | undefined>(undefined)

export function useSelectedRepositoryContext() {
  const context = useContext(SelectedRepositoryContext)
  if (!context) {
    throw new Error('useSelectedRepositoryContext must be used within a SelectedRepositoryContext.Provider')
  }
  return context
}
