import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type StatusContextProps = {
  /**
   * A text description of the ListItem.LeadingVisual in the list item
   * Available only when the ListItem.LeadingVisual is included
   * Used for the aria-label of the list item
   */
  status: string
  setStatus: Dispatch<SetStateAction<string>>
}

const StatusContext = createContext<StatusContextProps | undefined>(undefined)

export const StatusProvider = ({children}: PropsWithChildren) => {
  const [status, setStatus] = useState('')
  const contextProps = useMemo(() => ({status, setStatus}) satisfies StatusContextProps, [status])
  return <StatusContext.Provider value={contextProps}>{children}</StatusContext.Provider>
}
StatusProvider.displayName = 'ListItemStatusProvider'

export const useListItemStatus = () => {
  const context = useContext(StatusContext)
  if (!context) throw new Error('useListItemStatus must be used with StatusProvider.')
  return context
}
