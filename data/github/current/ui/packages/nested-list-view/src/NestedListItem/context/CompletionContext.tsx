import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type NestedListItemCompletionContextProps = {
  /**
   * The completion of the list item.
   * NestedListItem completion is composed from the aria-label property of the NestedListItem.CompletionItem children
   * Available only when the NestedListItem.CompletionPill is included
   * Used for the aria-label of the list item
   */
  completion: string
  setCompletion: Dispatch<SetStateAction<string>>
}

const NestedListItemCompletionContext = createContext<NestedListItemCompletionContextProps | undefined>(undefined)

export const NestedListItemCompletionProvider = ({children}: PropsWithChildren) => {
  const [completion, setCompletion] = useState('')
  const contextProps = useMemo(
    () => ({completion, setCompletion}) satisfies NestedListItemCompletionContextProps,
    [completion],
  )
  return (
    <NestedListItemCompletionContext.Provider value={contextProps}>{children}</NestedListItemCompletionContext.Provider>
  )
}

export const useNestedListItemCompletion = () => {
  return useContext(NestedListItemCompletionContext)
}
