import {createContext, useContext, useMemo, type ReactNode, type FC} from 'react'
import type {NameWithOwnerRepository} from './RepositoryContext'

type RepositroyGroupContextType = {
  isGrouped: boolean
  repository: NameWithOwnerRepository | null
}

type RepositoryGroupContextProviderProps = {
  children?: ReactNode
} & Partial<RepositroyGroupContextType>

const RepositoryGroupContext = createContext<RepositroyGroupContextType | null>(null)

export const RepositoryGroupContextProvider: FC<RepositoryGroupContextProviderProps> = ({children, ...value}) => {
  const providerData = useMemo(
    () => ({
      isGrouped: value.isGrouped ?? (value.repository ? true : false),
      repository: value.repository ?? null,
    }),
    [value],
  )

  return <RepositoryGroupContext.Provider value={providerData}>{children}</RepositoryGroupContext.Provider>
}

export function useRepositoryGroupContext(): RepositroyGroupContextType {
  const context = useContext(RepositoryGroupContext)
  if (!context) {
    return {
      isGrouped: false,
      repository: null,
    }
  }
  return context
}
