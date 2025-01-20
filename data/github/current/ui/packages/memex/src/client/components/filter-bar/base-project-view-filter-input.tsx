import {useSyncedState} from '@github-ui/use-synced-state'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import debounce from 'lodash-es/debounce'
import {memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef} from 'react'

import {SearchBarUI} from '../../api/stats/contracts'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useFetchFilterSuggestedIssueTypes} from '../../hooks/use-fetch-filter-suggested-issue-types'
import {useViews} from '../../hooks/use-views'
import {useMemexItems} from '../../state-providers/memex-items/use-memex-items'
import {FilterSuggestionsItemsContext, type FilterSuggestionsItemsContextProps} from './filter-suggestions'
import {useSearch} from './search-context'
import {TokenizedFilterInput, type TokenizedFilterInputProps} from './tokenized-filter-input'
import {useHandleFilterBarShortcut} from './use-handle-filter-bar-shortcut'

type BaseProjectViewFilterInputProps = {
  /** A callback invoked when a keydown occurs in the input **/
  onInputKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  /** A callback invoked when a keydown occurs on the clear button **/
  onClearButtonKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
  /** A callback to dispatch a navigation event when the input is focused **/
  dispatchInputFocusEvent?: () => void
  /** Whether the input is currently focused  **/
  isFocused?: boolean
  /** Optional style overrides for the filter container */
  containerSx?: BetterSystemStyleObject

  filterCount?: number
}
const baseProjectViewFilterContainerSx = {display: 'flex', alignItems: 'center', p: '12px 16px', gridArea: '1/2'}

export const BaseProjectViewFilterInput = memo(function BaseProjectViewFilterInput({
  isFocused,
  ...props
}: BaseProjectViewFilterInputProps) {
  const {searchInputRef} = useSearch()

  useEffect(() => {
    if (isFocused) searchInputRef.current?.focus()
  }, [isFocused, searchInputRef])

  return <BaseProjectInputWithActions {...props} />
})

/** The primary project filter input, which includes save and discard functionality **/
const BaseProjectInputWithActions = memo(function BaseProjectInputWithActions(
  props: Omit<BaseProjectViewFilterInputProps, 'isFocused'>,
) {
  const {currentView, isViewStateDirty, saveCurrentViewState, resetViewState} = useViews()
  const {hasWritePermissions} = ViewerPrivileges()

  const currentViewNumber = currentView?.number

  const handleSaveView = useCallback(async () => {
    if (currentViewNumber === undefined) return
    await saveCurrentViewState(currentViewNumber, {
      ui: SearchBarUI,
    })
  }, [currentViewNumber, saveCurrentViewState])

  const handleResetChanges = useCallback(async () => {
    if (currentViewNumber === undefined) return
    resetViewState(currentViewNumber, {
      ui: SearchBarUI,
    })
  }, [currentViewNumber, resetViewState])

  return (
    <>
      <ProjectInputWithSearchContext
        onResetChanges={isViewStateDirty ? handleResetChanges : undefined}
        onSaveChanges={!currentView?.isDeleted && isViewStateDirty ? handleSaveView : undefined}
        hideSaveButton={!hasWritePermissions}
        {...props}
      />
    </>
  )
})

type ProjectInputWithSearchContextProps = Partial<TokenizedFilterInputProps> &
  Pick<BaseProjectViewFilterInputProps, 'dispatchInputFocusEvent'> & {
    children?: React.ReactNode
  }

/** Suggestion wrapped filter input that uses search context for managing query state **/
export const ProjectInputWithSearchContext = memo(function ProjectInputWithSearchContext({
  dispatchInputFocusEvent,
  filterCount,
  children,
  ...props
}: ProjectInputWithSearchContextProps) {
  const {currentView} = useViews()
  const {query, setQuery, searchInputRef, addSpaceToQuery, clearSearchQuery} = useSearch()
  const searchRef = useRef<HTMLInputElement | null>(null)
  const debouncedSearch = useMemo(() => debounce(setQuery, 200), [setQuery])

  const currentViewNumber = currentView?.number

  useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(searchInputRef, () => searchRef.current)

  // LocalQuery is used for a better user experience
  // Because the search is debounced, using the actual query for setting value on TextInput will be perceived as laggy
  const [localQuery, setLocalQuery] = useSyncedState(query)

  const trackingAddSpaceToQuery = useTrackingRef(addSpaceToQuery)
  const handleFocus = useCallback(() => {
    searchContainerRef.current?.classList.add('is-focused')
    if (dispatchInputFocusEvent) {
      dispatchInputFocusEvent()
    }
  }, [dispatchInputFocusEvent])

  const onBlur = useCallback(() => {
    searchContainerRef.current?.classList.remove('is-focused')
    return
  }, [])

  const handleValueChange = useCallback(
    (value: string) => {
      if (currentViewNumber === undefined) return
      debouncedSearch.cancel()
      setLocalQuery(value)
      debouncedSearch(currentViewNumber, value)
    },
    [currentViewNumber, debouncedSearch, setLocalQuery],
  )

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleValueChange(e.target.value)
    },
    [handleValueChange],
  )

  const onChangeValue = useCallback(
    (value: string) => {
      handleValueChange(value)
    },
    [handleValueChange],
  )

  const onFilterBarShortcut = useCallback(() => {
    handleFocus()
    trackingAddSpaceToQuery.current()
  }, [handleFocus, trackingAddSpaceToQuery])

  useHandleFilterBarShortcut(onFilterBarShortcut)

  const searchContainerRef = useRef<HTMLDivElement>(null)

  const handleClearButtonClick = useCallback(() => {
    if (currentViewNumber === undefined) return
    clearSearchQuery(currentViewNumber)
  }, [clearSearchQuery, currentViewNumber])

  const handleInputClick = useCallback(() => {
    if (!searchInputRef.current) return
    // if the cursor is at the end of the input, potentially add a space
    if (
      searchInputRef.current.selectionStart &&
      searchInputRef.current.value.length &&
      searchInputRef.current.selectionStart >= searchInputRef.current.value.length
    ) {
      trackingAddSpaceToQuery.current()
    }
  }, [searchInputRef, trackingAddSpaceToQuery])

  return (
    <Box sx={baseProjectViewFilterContainerSx}>
      <MemexItemsSuggestionsProvider>
        <TokenizedFilterInput
          height="32px"
          containerRef={searchContainerRef}
          value={localQuery}
          onChange={onChange}
          onChangeValue={onChangeValue}
          onBlur={onBlur}
          onFocus={handleFocus}
          onInputClick={handleInputClick}
          inputRef={searchRef}
          filterCount={query.length > 0 ? filterCount : null}
          onClearButtonClick={handleClearButtonClick}
          setValueFromSuggestion={handleValueChange}
          {...props}
        >
          {children}
        </TokenizedFilterInput>
      </MemexItemsSuggestionsProvider>
    </Box>
  )
})

BaseProjectViewFilterInput.displayName = 'BaseProjectViewFilterInput'

const MemexItemsSuggestionsProvider = memo<React.PropsWithChildren>(function MemexItemsSuggestionsProvider({children}) {
  const {items} = useMemexItems()
  const {suggestedIssueTypeNames} = useFetchFilterSuggestedIssueTypes()

  const contextValue: FilterSuggestionsItemsContextProps = useMemo(() => {
    return {
      items,
      issueTypeSuggestedNames: suggestedIssueTypeNames,
    }
  }, [items, suggestedIssueTypeNames])

  return (
    <FilterSuggestionsItemsContext.Provider value={contextValue}>{children}</FilterSuggestionsItemsContext.Provider>
  )
})
