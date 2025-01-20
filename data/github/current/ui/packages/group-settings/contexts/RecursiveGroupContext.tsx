import {createContext, useContext, useMemo} from 'react'

export type RecursiveGroupContextProps = {
  collapse?: boolean
  hideGroupActions?: boolean
  onRemoveGroup?: (id: number) => void
}

const defaultValue: RecursiveGroupContextProps = {
  collapse: undefined,
  hideGroupActions: undefined,
  onRemoveGroup: undefined,
}

const RecursiveGroupContext = createContext<RecursiveGroupContextProps>(defaultValue)

export function RecursiveGroupProvider({
  children,
  collapse,
  hideGroupActions,
  onRemoveGroup,
}: React.PropsWithChildren<RecursiveGroupContextProps>) {
  const value = useMemo(
    () => ({
      collapse,
      hideGroupActions,
      onRemoveGroup,
    }),
    [collapse, hideGroupActions, onRemoveGroup],
  )
  return <RecursiveGroupContext.Provider value={value}>{children}</RecursiveGroupContext.Provider>
}

export function useRecursiveGroupContext() {
  const context = useContext(RecursiveGroupContext)
  if (context === undefined) {
    throw new Error('useRecursiveGroupContext must be within RecursiveGroupProvider')
  }
  return context
}
