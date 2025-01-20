import {noop} from '@github-ui/noop'
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {defaultIsSelectable} from '../constants'

const defaultSingularUnits = 'list item'
const defaultPluralUnits = 'list items'

export type SelectionContextProps = {
  /**
   * How many items are selected in the list. Only applicable when the NestedListView's isSelectable=true.
   */
  selectedCount: number

  /**
   * Update how many items are selected in the NestedListView.
   */
  setSelectedCount: Dispatch<SetStateAction<number>>

  /**
   * How many items are in the list. Should represent how many items are in all pages of results, if multiple lists
   * are shown across many pages.
   */
  totalCount?: number

  /**
   * How many list items are shown on the current page. Reflects how many items can be toggled when the 'Select all'
   * checkbox is checked or unchecked.
   */
  countOnPage: number

  /**
   * Determine if the 'Select all' checkbox is in a checked state. Will be true when all list items currently rendered
   * in the NestedListView are selected.
   */
  isSelectAllChecked: boolean

  /**
   * Determine if any list items are currently selected.
   */
  anyItemsSelected: boolean

  /**
   * What a single list item should be called. Used to customize assistive text about how many list items are
   * selected.
   */
  singularUnits: string

  /**
   * What many list items are called. Used to customize assistive text about how many list items are selected.
   */
  pluralUnits: string

  /**
   * Whether multiple items at a time or no items can be selected.
   */
  isSelectable: boolean
}

const SelectionContext = createContext<SelectionContextProps>({
  selectedCount: 0,
  setSelectedCount: noop,
  countOnPage: 0,
  isSelectAllChecked: false,
  anyItemsSelected: false,
  singularUnits: defaultSingularUnits,
  pluralUnits: defaultPluralUnits,
  isSelectable: defaultIsSelectable,
})

export type SelectionProviderProps = PropsWithChildren<
  Pick<SelectionContextProps, 'totalCount'> & {
    singularUnits?: SelectionContextProps['singularUnits']
    pluralUnits?: SelectionContextProps['pluralUnits']
    isSelectable?: SelectionContextProps['isSelectable']
    selectedCount?: SelectionContextProps['selectedCount']
    countOnPage?: SelectionContextProps['countOnPage']
  }
>

export const SelectionProvider = (
  {
    children,
    countOnPage = 0,
    singularUnits = defaultSingularUnits,
    pluralUnits = defaultPluralUnits,
    totalCount,
    selectedCount: externalSelectedCount = 0,
    isSelectable = defaultIsSelectable,
  }: SelectionProviderProps = {
    singularUnits: defaultSingularUnits,
    pluralUnits: defaultPluralUnits,
    selectedCount: 0,
    countOnPage: 0,
    isSelectable: defaultIsSelectable,
  },
) => {
  const [selectedCount, setSelectedCount] = useState(externalSelectedCount)

  useEffect(() => setSelectedCount(externalSelectedCount), [externalSelectedCount])

  // Allow for more than shown on page since some NestedListViews allow selecting all pages of items, and we want to
  // continue showing the 'Select all' checkbox as checked when more than the current page of items is selected.
  const isSelectAllChecked = selectedCount >= countOnPage
  const anyItemsSelected = selectedCount > 0
  const contextProps = useMemo(() => {
    return {
      totalCount,
      countOnPage,
      selectedCount,
      setSelectedCount,
      isSelectAllChecked,
      anyItemsSelected,
      singularUnits,
      pluralUnits,
      isSelectable,
    } satisfies SelectionContextProps
  }, [
    selectedCount,
    isSelectAllChecked,
    anyItemsSelected,
    totalCount,
    countOnPage,
    singularUnits,
    pluralUnits,
    isSelectable,
  ])

  return <SelectionContext.Provider value={contextProps}>{children}</SelectionContext.Provider>
}
SelectionProvider.displayName = 'NestedListViewSelectionProvider'

export const useNestedListViewSelection = () => {
  return useContext(SelectionContext)
}
