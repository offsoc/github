import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo} from 'react'

interface NavigationContextState {
  basePath: string
  enterpriseContactUrl: string
  isStafftools: boolean
}

const NavigationContext = createContext<NavigationContextState>({
  basePath: '',
  enterpriseContactUrl: '',
  isStafftools: false,
})

interface NavigationProviderProps {
  enterpriseContactUrl: string
  isStafftools: boolean
  slug: string
}

export const NavigationContextProvider = ({
  children,
  enterpriseContactUrl,
  isStafftools,
  slug,
}: PropsWithChildren<NavigationProviderProps>) => {
  const basePath = isStafftools ? `/stafftools/enterprises/${slug}` : `/enterprises/${slug}`
  const contextValue = useMemo<NavigationContextState>(
    () => ({basePath, enterpriseContactUrl, isStafftools}),
    [basePath, enterpriseContactUrl, isStafftools],
  )
  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
