import {usePreviousValue} from '@github-ui/use-previous-value'
import type {PropsWithChildren} from 'react'
import {createContext, useCallback, useContext, useMemo, useReducer, useRef, useState} from 'react'

import type {FilterData} from '../helpers/filter-files'
import {filterFiles} from '../helpers/filter-files'
import useQueryParam from '../hooks/use-query-param'

function areSetsEqual(a: Set<string> | undefined, b: Set<string> | undefined): boolean {
  if (!a || !b || a.size !== b.size) return false

  return !Array.from(a).some(value => !b.has(value))
}

/**
 * Represents the data in the FilteredFilesContext
 */
interface FilteredFilesContextData {
  /** Set of path digests belonging to files that will be shown */
  filteredFileAnchors?: Set<string>
  /** String text to filter the diffs by */
  filterText?: string
  /** Function that handles updating the filter text */
  setFilterText?: (filterText: string) => void
  fileExtensions?: Set<string>
  /** The state of the file filter */
  state?: FilterState
  /** Function to handle updating the state of the file filter */
  setFilterState?: (action: FilterAction) => void
  setFilterData?: (data: FilterData | undefined) => void
}

export const FilteredFilesContext = createContext<FilteredFilesContextData>({})

/**
 * Hook returning data used for filtering the files of a pull request
 */
export function useFilteredFilesContext(): FilteredFilesContextData {
  return useContext(FilteredFilesContext)
}

/**
 * FilterState represents the state of the file filter
 * * showViewed: whether viewed files should be shown, true by default
 * * showOnlyFilesCodeownedByUser: whether to only show files codeowned by the user, false by default
 * * selectedFileExtensions: which file extensions to show, all included in Set by default
 */
export interface FilterState {
  showViewed: boolean
  showOnlyFilesCodeownedByUser: boolean
  unselectedFileExtensions: Set<string>
}

function initialState(): FilterState {
  return {
    showViewed: true,
    showOnlyFilesCodeownedByUser: false,
    unselectedFileExtensions: new Set<string>(),
  }
}

type FilterAction =
  | {type: 'unselectViewed'}
  | {type: 'selectViewed'}
  | {type: 'unselectCodeownersOwnedOnly'}
  | {type: 'selectCodeownersOwnedOnly'}
  | {type: 'selectFileExtension'; payload: {extension: string}}
  | {type: 'unselectFileExtension'; payload: {extension: string}}

function fileFilterReducer(state: FilterState, action: FilterAction) {
  const unselectedFileExtensions = new Set(state.unselectedFileExtensions)
  switch (action.type) {
    case 'unselectViewed':
      return {...state, showViewed: false}
    case 'selectViewed':
      return {...state, showViewed: true}
    case 'unselectCodeownersOwnedOnly':
      return {...state, showOnlyFilesCodeownedByUser: false}
    case 'selectCodeownersOwnedOnly':
      return {...state, showOnlyFilesCodeownedByUser: true}
    case 'selectFileExtension':
      unselectedFileExtensions.delete(action.payload.extension)
      return {
        ...state,
        unselectedFileExtensions,
      }
    case 'unselectFileExtension':
      unselectedFileExtensions.add(action.payload.extension)
      return {
        ...state,
        unselectedFileExtensions,
      }
    default:
      return state
  }
}

export function FilteredFilesContextProvider({
  children,
  initialFilterText = '',
}: PropsWithChildren<{initialFilterText?: string}>) {
  const [filterData, setFilterData] = useState<FilterData>()
  const [intialFilter, updateQueryParamValue] = useQueryParam('filter')
  const [filterText, setFilterText] = useState(intialFilter || initialFilterText)
  const [state, dispatch] = useReducer(fileFilterReducer, initialState())
  const updateContextValue = useRef(0)

  const updateFilterText = useCallback(
    (value: string) => {
      setFilterText(value)
      updateQueryParamValue(value)
    },
    [updateQueryParamValue],
  )

  const fileExtensions = useMemo(() => (filterData ? new Set(filterData.fileExtensions) : undefined), [filterData])
  const fileAnchors = useMemo(() => {
    let filteredFileAnchors: Set<string> | undefined = undefined

    if (filterData?.files) {
      filteredFileAnchors = new Set<string>()
      for (const file of filterData.files) {
        if (file.pathDigest && filterFiles(state, filterText, file)) {
          filteredFileAnchors.add(file.pathDigest)
        }
      }
    }

    return filteredFileAnchors
  }, [filterData?.files, filterText, state])
  const prevFileAnchors = usePreviousValue(fileAnchors)
  const prevFileExtensions = usePreviousValue(fileExtensions)

  const dataChanged = !areSetsEqual(prevFileAnchors, fileAnchors) || !areSetsEqual(prevFileExtensions, fileExtensions)
  if (dataChanged) updateContextValue.current++

  // Recalculate filtered files whenever filter text, form state, or file data changes
  const filteredFilesData = useMemo(() => {
    return {
      filterText,
      filteredFileAnchors: fileAnchors,
      setFilterText: updateFilterText,
      fileExtensions,
      state,
      setFilterState: dispatch,
      setFilterData,
    }
    // Rather than updating every time the reference to fileAnchors or fileExtensions changes,
    // we update when the content of those lists is changed. This keeps our context data stable
    // when file data gets updated, but the filtered list remains the same. We do this by incrementing a counter
    // whenever we detect a change in either list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterText, updateFilterText, state, updateContextValue.current])

  return <FilteredFilesContext.Provider value={filteredFilesData}>{children}</FilteredFilesContext.Provider>
}
