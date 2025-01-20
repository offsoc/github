import {createContext, useContext} from 'react'
import type {Organization} from '../types'

const OrganizationContext = createContext<Organization | undefined>(undefined)

export function OrganizationProvider({organization, children}: React.PropsWithChildren<{organization: Organization}>) {
  return <OrganizationContext.Provider value={organization}> {children} </OrganizationContext.Provider>
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be within OrganizationProvider')
  }
  return context
}
