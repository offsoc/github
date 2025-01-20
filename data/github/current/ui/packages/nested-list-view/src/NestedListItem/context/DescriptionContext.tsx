import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type NestedListItemDescriptionContextProps = {
  /**
   * The description of the list item.
   * NestedListItem description is composed from the aria-label property of the NestedListItem.DescriptionItem children
   * Used for the aria-label of the list item
   */
  description: string
  setDescription: Dispatch<SetStateAction<string>>
}

const NestedListItemDescriptionContext = createContext<NestedListItemDescriptionContextProps | undefined>(undefined)

export const NestedListItemDescriptionProvider = ({children}: PropsWithChildren) => {
  const [description, setDescription] = useState('')
  const contextProps = useMemo(
    () => ({description, setDescription}) satisfies NestedListItemDescriptionContextProps,
    [description],
  )
  return (
    <NestedListItemDescriptionContext.Provider value={contextProps}>
      {children}
    </NestedListItemDescriptionContext.Provider>
  )
}

export const useNestedListItemDescription = () => {
  const context = useContext(NestedListItemDescriptionContext)
  if (!context) throw new Error('useNestedListItemDescription must be used with NestedListItemDescriptionProvider.')
  return context
}
