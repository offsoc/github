import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react'

type NavigationContextType = {
  isNavigationOpen: boolean
  openNavigation: () => void
  closeNavigation: () => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

type NavigationContextProviderType = {
  children: ReactNode
}

export function NavigationContextProvider({children}: NavigationContextProviderType) {
  const [isNavigationOpen, setIsNavigationOpen] = useState<boolean>(false)

  const closeNavigation = useCallback(() => {
    setIsNavigationOpen(false)
  }, [])

  const openNavigation = useCallback(() => {
    setIsNavigationOpen(true)
  }, [])

  const contextValue: NavigationContextType = useMemo(() => {
    return {
      isNavigationOpen,
      openNavigation,
      closeNavigation,
    }
  }, [isNavigationOpen, openNavigation, closeNavigation])

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>
}

export const useNavigationContext = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationContextProvider.')
  }

  return context
}
