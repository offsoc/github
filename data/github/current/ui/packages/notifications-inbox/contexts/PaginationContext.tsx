import {createContext, type FC, type ReactNode, useContext, useMemo, useState} from 'react'

type PaginationContextType = {
  currentPage: number
  setCurrentPage: (page: number) => void
  selectedNotificationIds: Set<string>
  setSelectedNotificationIds: (ids: Set<string>) => void
}

const PaginationContext = createContext<PaginationContextType | null>(null)

export const PaginationContextProvider: FC<{children: ReactNode}> = ({children}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<Set<string>>(new Set<string>())
  const providerData = useMemo(
    () => ({
      currentPage,
      setCurrentPage,
      selectedNotificationIds,
      setSelectedNotificationIds,
    }),
    [currentPage, setCurrentPage, selectedNotificationIds, setSelectedNotificationIds],
  )

  return <PaginationContext.Provider value={providerData}>{children}</PaginationContext.Provider>
}

export function usePaginationContext(): PaginationContextType {
  const context = useContext(PaginationContext)
  if (!context) {
    throw new Error('usePaginationContext must be used within a PaginationContextProvider.')
  }

  return context
}
