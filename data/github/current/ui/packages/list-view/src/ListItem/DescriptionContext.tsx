import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type DescriptionContextProps = {
  /**
   * The description of the list item.
   * ListItem description is composed from the aria-label property of the ListItem.DescriptionItem children
   * Available only when the ListItem.DescriptionItem is included
   * Used for the aria-label of the list item
   */
  description: string
  setDescription: Dispatch<SetStateAction<string>>
}

const DescriptionContext = createContext<DescriptionContextProps | undefined>(undefined)

export const DescriptionProvider = ({children}: PropsWithChildren) => {
  const [description, setDescription] = useState('')
  const contextProps = useMemo(() => ({description, setDescription}) satisfies DescriptionContextProps, [description])
  return <DescriptionContext.Provider value={contextProps}>{children}</DescriptionContext.Provider>
}
DescriptionProvider.displayName = 'ListItemDescriptionProvider'

export const useListItemDescription = () => {
  const context = useContext(DescriptionContext)
  if (!context) throw new Error('useListItemDescription must be used with DescriptionProvider.')
  return context
}
