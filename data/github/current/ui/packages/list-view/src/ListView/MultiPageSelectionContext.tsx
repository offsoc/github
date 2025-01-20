import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

type MultiPageSelectionContextProps = {
  /**
   * Indicate whether list items from multiple pages of ListView items can be selected by the user at a time. Used to
   * determine when the 'Select all' checkbox should be rendered in an indeterminate state, to indicate when some but
   * not all selectable items are selected.
   */
  multiPageSelectionAllowed: boolean
  setMultiPageSelectionAllowed?: Dispatch<SetStateAction<boolean>>
}

const MultiPageSelectionContext = createContext<MultiPageSelectionContextProps>({
  multiPageSelectionAllowed: false,
})

export type MultiPageSelectionProviderProps = PropsWithChildren<{
  /**
   * Indicate whether list items from multiple pages of ListView items can be selected by the user at a time. Used to
   * determine when the 'Select all' checkbox should be rendered in an indeterminate state, to indicate when some but
   * not all selectable items are selected. Defaults to false.
   */
  multiPageSelectionAllowed?: MultiPageSelectionContextProps['multiPageSelectionAllowed']
}>

export const MultiPageSelectionProvider = ({
  children,
  multiPageSelectionAllowed: externalMultiPageSelectionAllowed = false,
}: MultiPageSelectionProviderProps) => {
  const [multiPageSelectionAllowed, setMultiPageSelectionAllowed] = useState(externalMultiPageSelectionAllowed)
  const contextProps = useMemo(() => {
    return {
      multiPageSelectionAllowed,
      setMultiPageSelectionAllowed,
    } satisfies MultiPageSelectionContextProps
  }, [multiPageSelectionAllowed])

  return <MultiPageSelectionContext.Provider value={contextProps}>{children}</MultiPageSelectionContext.Provider>
}

MultiPageSelectionProvider.displayName = 'ListViewMultiPageSelectionProvider'

export const useListViewMultiPageSelection = () => {
  return useContext(MultiPageSelectionContext)
}
