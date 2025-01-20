import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import type {PropsWithChildren} from 'react'
import {createContext, useCallback, useContext, useMemo, useState} from 'react'

interface NavigationPaneLocalSettings {
  isOpenDefault: boolean
  isOpenViewerPreference: boolean
  hasDefinedViewerPreference: boolean
}

interface NavigationPaneContextData {
  isNavigationPaneExpanded: boolean
  toggleNavigationPaneExpanded: () => void
}

const NavigationPaneContext = createContext<NavigationPaneContextData | null>(null)

export function NavigationPaneContextProvider({children}: PropsWithChildren) {
  const [navigationPaneLocalSettings, setNavigationPaneLocalSetting] = useLocalStorage<NavigationPaneLocalSettings>(
    'prx-navigation-pane-settings',
    {
      isOpenDefault: true,
      isOpenViewerPreference: false,
      hasDefinedViewerPreference: false,
    },
  )
  const [isNavigationPaneExpanded, setIsNavigationPaneExpanded] = useState<boolean>(() =>
    navigationPaneLocalSettings.hasDefinedViewerPreference
      ? navigationPaneLocalSettings.isOpenViewerPreference
      : navigationPaneLocalSettings.isOpenDefault,
  )

  const handleViewerClosingNavigationPane = useCallback(() => {
    setNavigationPaneLocalSetting({
      isOpenDefault: false,
      isOpenViewerPreference: false,
      hasDefinedViewerPreference: true,
    })
  }, [setNavigationPaneLocalSetting])

  const handleViewerOpeningNavigationPane = useCallback(() => {
    setNavigationPaneLocalSetting({isOpenDefault: true, isOpenViewerPreference: true, hasDefinedViewerPreference: true})
  }, [setNavigationPaneLocalSetting])

  const toggleNavigationPaneExpanded = useCallback(() => {
    if (isNavigationPaneExpanded) {
      handleViewerClosingNavigationPane()
      setIsNavigationPaneExpanded(false)
    } else {
      handleViewerOpeningNavigationPane()
      setIsNavigationPaneExpanded(true)
    }
  }, [handleViewerClosingNavigationPane, handleViewerOpeningNavigationPane, isNavigationPaneExpanded])

  const value = useMemo(
    () => ({
      isNavigationPaneExpanded,
      toggleNavigationPaneExpanded,
    }),
    [isNavigationPaneExpanded, toggleNavigationPaneExpanded],
  )

  return <NavigationPaneContext.Provider value={value}>{children}</NavigationPaneContext.Provider>
}

export function useNavigationPaneContext(): NavigationPaneContextData {
  const contextData = useContext(NavigationPaneContext)
  if (!contextData) {
    throw new Error('useNavigationPaneContext must be used within a NavigationPaneContextProvider')
  }

  return contextData
}
