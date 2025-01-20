import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type NestedListItemNewActivityContextProps = {
  /**
   * Available only when the NestedListItem.LeadingVisual is included with the newActivity prop set.
   * Used for setting the aria-label of the list item.
   */
  hasNewActivity: boolean
  setHasNewActivity: Dispatch<SetStateAction<boolean>>
}

const NestedListItemNewActivityContext = createContext<NestedListItemNewActivityContextProps | undefined>(undefined)

export const NestedListItemNewActivityProvider = ({children}: PropsWithChildren) => {
  const [hasNewActivity, setHasNewActivity] = useState(false)
  const contextProps = useMemo(
    () => ({hasNewActivity, setHasNewActivity}) satisfies NestedListItemNewActivityContextProps,
    [hasNewActivity],
  )

  return (
    <NestedListItemNewActivityContext.Provider value={contextProps}>
      {children}
    </NestedListItemNewActivityContext.Provider>
  )
}

export const useNestedListItemNewActivity = () => {
  const context = useContext(NestedListItemNewActivityContext)
  if (!context) throw new Error('useNestedListItemNewActivity must be used with NewActivityProvider.')
  return context
}
