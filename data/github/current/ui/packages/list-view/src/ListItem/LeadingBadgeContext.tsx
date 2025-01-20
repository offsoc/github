import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type LeadingBadgeContextProps = {
  /**
   * The badge before the title of the list item. Used for the aria-label of the list item
   */
  leadingBadge: string
  setLeadingBadge: Dispatch<SetStateAction<string>>
}

const LeadingBadgeContext = createContext<LeadingBadgeContextProps | undefined>(undefined)

export const LeadingBadgeProvider = ({children}: PropsWithChildren) => {
  const [leadingBadge, setLeadingBadge] = useState('')
  const contextProps = useMemo(
    () => ({leadingBadge, setLeadingBadge}) satisfies LeadingBadgeContextProps,
    [leadingBadge],
  )
  return <LeadingBadgeContext.Provider value={contextProps}>{children}</LeadingBadgeContext.Provider>
}
LeadingBadgeProvider.displayName = 'ListItemLeadingBadgeProvider'

export const useListItemLeadingBadge = () => {
  const context = useContext(LeadingBadgeContext)
  if (!context) throw new Error('useListItemLeadingBadge must be used with LeadingBadgeProvider.')
  return context
}
