import {createContext, memo, type ReactNode, useCallback, useContext, useMemo, useRef, useState} from 'react'

type InsightsConfigurationPaneContextValue = {
  openPane: () => void
  closePane: () => void
  isClosing: boolean
  isOpen: boolean
}

const InsightsConfigurationPaneContext = createContext<InsightsConfigurationPaneContextValue | null>(null)

export const InsightsConfigurationPaneProvider = memo(function InsightsConfigurationPaneProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const closeTimeout = useRef<number>(0)

  const openPane = useCallback(() => {
    clearTimeout(closeTimeout.current)
    setIsClosing(false)
    setIsOpen(true)
  }, [])

  const closePane = useCallback(() => {
    setIsClosing(true)
    closeTimeout.current = window.setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 300)
  }, [])

  const contextValue = useMemo(
    () => ({
      openPane,
      closePane,
      isClosing,
      isOpen,
    }),
    [openPane, closePane, isClosing, isOpen],
  )

  return (
    <InsightsConfigurationPaneContext.Provider value={contextValue}>
      {children}
    </InsightsConfigurationPaneContext.Provider>
  )
})

export const useInsightsConfigurationPane = () => {
  const context = useContext(InsightsConfigurationPaneContext)
  if (context === null) {
    throw new Error('useInsightsConfigurationPane must be used within a InsightsConfigurationPaneProvider')
  }

  return context
}
