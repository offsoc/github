import type {SafeHTMLString} from '@github-ui/safe-html'
import {
  createContext,
  type Dispatch,
  type KeyboardEvent,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

type NestedListItemTitleContextProps = {
  /**
   * The main heading of the list item. Used for the aria-label of the list item and displayed visually.
   */
  title: SafeHTMLString
  setTitle: (newTitle: SafeHTMLString | string) => void
  titleAction: ((e: KeyboardEvent<HTMLElement>) => void) | null
  setTitleAction: Dispatch<SetStateAction<((e: KeyboardEvent<HTMLElement>) => void) | null>>
}

const NestedListItemTitleContext = createContext<NestedListItemTitleContextProps | undefined>(undefined)

export const NestedListItemTitleProvider = ({children}: PropsWithChildren) => {
  const [title, setTitle] = useState('' as SafeHTMLString)
  const [titleAction, setTitleAction] = useState<NestedListItemTitleContextProps['titleAction']>(null)
  const contextProps = useMemo(
    () =>
      ({
        title,
        setTitle: newTitle => setTitle(newTitle.trim() as SafeHTMLString),
        titleAction,
        setTitleAction,
      }) satisfies NestedListItemTitleContextProps,
    [title, titleAction],
  )
  return <NestedListItemTitleContext.Provider value={contextProps}>{children}</NestedListItemTitleContext.Provider>
}

export const useNestedListItemTitle = () => {
  const context = useContext(NestedListItemTitleContext)
  if (!context) throw new Error('useNestedListItemTitle must be used with NestedListItemTitleProvider.')
  return context
}
