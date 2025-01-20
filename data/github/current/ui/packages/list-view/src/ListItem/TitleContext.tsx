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

type TitleContextProps = {
  /**
   * The main heading of the list item. Used for the aria-label of the list item and displayed visually.
   */
  title: SafeHTMLString
  setTitle: (newTitle: SafeHTMLString | string) => void
  titleAction: ((e: KeyboardEvent<HTMLLIElement>) => void) | null
  setTitleAction: Dispatch<SetStateAction<((e: KeyboardEvent<HTMLLIElement>) => void) | null>>
}

const TitleContext = createContext<TitleContextProps | undefined>(undefined)

export const TitleProvider = ({children}: PropsWithChildren) => {
  const [title, setTitle] = useState('' as SafeHTMLString)
  const [titleAction, setTitleAction] = useState<TitleContextProps['titleAction']>(null)
  const contextProps = useMemo(
    () =>
      ({
        title,
        setTitle: newTitle => setTitle(newTitle.trim() as SafeHTMLString),
        titleAction,
        setTitleAction,
      }) satisfies TitleContextProps,
    [title, titleAction],
  )
  return <TitleContext.Provider value={contextProps}>{children}</TitleContext.Provider>
}
TitleProvider.displayName = 'ListItemTitleProvider'

export const useListItemTitle = () => {
  const context = useContext(TitleContext)
  if (!context) throw new Error('useListItemTitle must be used with TitleProvider.')
  return context
}
