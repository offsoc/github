import {createContext, useContext} from 'react'
import type {RepositoryContextValue} from '../security-products-enablement-types'

export const RepositoryContext = createContext<RepositoryContextValue | undefined>(undefined)

export function useRepositoryContext() {
  const context = useContext(RepositoryContext)
  if (!context) {
    throw new Error('useRepositoryContext must be used within a RepositoryContext.Provider')
  }
  return context
}
