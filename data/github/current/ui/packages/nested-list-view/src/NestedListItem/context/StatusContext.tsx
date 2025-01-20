import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type NestedListItemStatusContextProps = {
  /**
   * A text description of the NestedListItem.LeadingVisual in the list item
   * Available only when the NestedListItem.LeadingVisual is included
   * Used for the aria-label of the list item
   */
  status: string
  setStatus: Dispatch<SetStateAction<string>>
}

const NestedListItemStatusContext = createContext<NestedListItemStatusContextProps | undefined>(undefined)

export const NestedListItemStatusProvider = ({children}: PropsWithChildren) => {
  const [status, setStatus] = useState('')
  const contextProps = useMemo(() => ({status, setStatus}) satisfies NestedListItemStatusContextProps, [status])
  return <NestedListItemStatusContext.Provider value={contextProps}>{children}</NestedListItemStatusContext.Provider>
}

export const useNestedListItemStatus = () => {
  const context = useContext(NestedListItemStatusContext)
  if (!context) throw new Error('useNestedListItemStatus must be used with NestedListItemStatusProvider.')
  return context
}
