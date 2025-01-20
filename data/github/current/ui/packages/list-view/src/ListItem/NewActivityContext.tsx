import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type NewActivityContextProps = {
  /**
   * Available only when the ListItem.LeadingVisual is included with the newActivity prop set.
   * Used for setting the aria-label of the list item.
   */
  hasNewActivity: boolean
  setHasNewActivity: Dispatch<SetStateAction<boolean>>
}

const NewActivityContext = createContext<NewActivityContextProps | undefined>(undefined)

export const NewActivityProvider = ({children}: PropsWithChildren) => {
  const [hasNewActivity, setHasNewActivity] = useState(false)
  const contextProps = useMemo(
    () => ({hasNewActivity, setHasNewActivity}) satisfies NewActivityContextProps,
    [hasNewActivity],
  )

  return <NewActivityContext.Provider value={contextProps}>{children}</NewActivityContext.Provider>
}
NewActivityProvider.displayName = 'ListItemNewActivityProvider'

export const useListItemNewActivity = () => {
  const context = useContext(NewActivityContext)
  if (!context) throw new Error('useListItemNewActivity must be used with NewActivityProvider.')
  return context
}
