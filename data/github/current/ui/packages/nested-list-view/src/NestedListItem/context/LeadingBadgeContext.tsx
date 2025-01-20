import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type NestedListItemLeadingBadgeContextProps = {
  /**
   * The badge before the title of the list item. Used for the aria-label of the list item
   */
  leadingBadge: string
  setLeadingBadge: Dispatch<SetStateAction<string>>
}

const NestedListItemLeadingBadgeContext = createContext<NestedListItemLeadingBadgeContextProps | undefined>(undefined)

export const NestedListItemLeadingBadgeProvider = ({children}: PropsWithChildren) => {
  const [leadingBadge, setLeadingBadge] = useState('')
  const contextProps = useMemo(
    () => ({leadingBadge, setLeadingBadge}) satisfies NestedListItemLeadingBadgeContextProps,
    [leadingBadge],
  )
  return (
    <NestedListItemLeadingBadgeContext.Provider value={contextProps}>
      {children}
    </NestedListItemLeadingBadgeContext.Provider>
  )
}

export const useNestedListItemLeadingBadge = () => {
  const context = useContext(NestedListItemLeadingBadgeContext)
  if (!context) throw new Error('useNestedListItemLeadingBadge must be used with NestedListItemLeadingBadgeProvider.')
  return context
}
