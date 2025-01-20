import {noop} from '@github-ui/noop'
import {createContext, type PropsWithChildren, useContext, useMemo, useState} from 'react'

export type ItemsContextProps = {
  /**
   * Whether any of the items in the NestedListView include an action bar. Will be used to ensure consistent
   * alignment of the ListItem's trailing content.
   */
  anyItemsWithActionBar: boolean
  /**
   * Register whether any ListItem includes an action bar or not.
   */
  setAnyItemsWithActionBar: (hasActionBar: boolean) => void
  /**
   * Whether any of the items in the NestedListView includes actions that will move into a dropdown menu when the screen isn't big enough to
   * fit them side by side.. Will be used to ensure consistent alignment of the ListItem's trailing content.
   */
  hasResizableActionsWithActionBar: boolean
  setHasResizableActionsWithActionBar: (hasActionBar: boolean) => void
}

const ItemsContext = createContext<ItemsContextProps>({
  anyItemsWithActionBar: false,
  setAnyItemsWithActionBar: noop,
  hasResizableActionsWithActionBar: false,
  setHasResizableActionsWithActionBar: noop,
})

export const ItemsProvider = ({children}: PropsWithChildren) => {
  const [anyItemsWithActionBar, setAnyItemsWithActionBar] = useState(false)
  const [hasResizableActionsWithActionBar, setHasResizableActionsWithActionBar] = useState(false)
  const contextProps = useMemo<ItemsContextProps>(
    () => ({
      anyItemsWithActionBar,
      setAnyItemsWithActionBar,
      hasResizableActionsWithActionBar,
      setHasResizableActionsWithActionBar,
    }),
    [anyItemsWithActionBar, hasResizableActionsWithActionBar],
  )
  return <ItemsContext.Provider value={contextProps}>{children}</ItemsContext.Provider>
}
ItemsProvider.displayName = 'NestedListViewItemsProvider'

export const useNestedListViewItems = () => {
  return useContext(ItemsContext)
}
