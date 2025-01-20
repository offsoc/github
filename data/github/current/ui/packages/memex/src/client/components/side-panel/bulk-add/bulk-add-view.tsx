import {testIdProps} from '@github-ui/test-id-props'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {SearchIcon} from '@primer/octicons-react'
import {Box, Button, Text, TextInput} from '@primer/react'
import {memo, useCallback, useEffect, useRef, useState} from 'react'

import type {SuggestedRepository} from '../../../api/repository/contracts'
import {BulkAddSidePanelAddItems} from '../../../api/stats/contracts'
import {shortcutFromEvent, SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useSidePanel} from '../../../hooks/use-side-panel'
import {Resources} from '../../../strings'
import type {OmnibarItemAttrs} from '../../omnibar/types'
import {SidePanelToolbar} from '../header'
import {ItemSuggestionsList} from '../item-suggestions-list'
import {RepoSuggestions} from '../repo-suggestions'
import {useBulkAddItems} from './bulk-add-items-provider'

const SearchButton = memo(function SearchButton({onClick, disabled}: {onClick: () => void; disabled: boolean}) {
  return (
    <Button
      variant="invisible"
      size="small"
      onClick={onClick}
      aria-label="Search"
      disabled={disabled}
      sx={{
        margin: '0 2px',
        color: disabled ? 'accent.muted' : 'accent.fg',
        border: 'none',
        height: '24px',
      }}
      {...testIdProps('bulk-add-search-button')}
    >
      Search ⏎
    </Button>
  )
})

type BulkAddViewProps = {
  targetRepository?: SuggestedRepository
  newItemAttributes?: OmnibarItemAttrs
}

export const BulkAddView = ({targetRepository, newItemAttributes}: BulkAddViewProps) => {
  const {postStats} = usePostStats()
  const {isPaneOpened} = useSidePanel()
  const {
    addSelectedItemsRequest,
    selectedItems,
    hasFetchedRepos,
    selectedRepo,
    setSelectedRepo,
    setHasFetchedRepos,
    loading,
    addingItems,
    items,
    searchQuery,
    setSearchQuery,
    setAreAllItemsAdded,
    setUpdateColumnsAction,
    MAX_ITEM_NUM,
  } = useBulkAddItems()
  const [searchHasFocus, setSearchHasFocus] = useState(false)
  const [hasSearchInput, setHasSearchInput] = useState(false)
  const [currentSearchValue, setCurrentSearchValue] = useState(searchQuery)
  const hasRepos = hasFetchedRepos && selectedRepo
  const inputRef = useRef<HTMLInputElement>(null)

  const wasPaneOpened = useRef(isPaneOpened)
  useEffect(
    function resetStateOnClose() {
      if (wasPaneOpened.current && !isPaneOpened) {
        setSelectedRepo(null)
        setSearchQuery('')
        setUpdateColumnsAction([])
        setHasFetchedRepos(false)
      }
      wasPaneOpened.current = isPaneOpened
    },
    [setHasFetchedRepos, setSearchQuery, setSelectedRepo, setUpdateColumnsAction, isPaneOpened],
  )

  const onSearchInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const shortcut = shortcutFromEvent(e)
      const query = e.currentTarget.value.trim()
      if (shortcut === SHORTCUTS.ENTER) {
        setSearchQuery(query)
      }
    },
    [setSearchQuery],
  )

  const searchInputProps = useIgnoreKeyboardActionsWhileComposing(onSearchInputKeyDown)

  const onSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSearchValue(e.currentTarget.value)
    setHasSearchInput(e.currentTarget.value.trim().length > 0)
  }, [])

  const onSearchButtonClick = useCallback(() => {
    const query = inputRef.current?.value ?? ''
    setSearchQuery(query)
  }, [setSearchQuery])

  const onSearchInputFocus = useCallback(() => {
    setSearchHasFocus(true)
  }, [])

  const onSearchInputBlur = useCallback(() => {
    setSearchHasFocus(false)
  }, [])

  useEffect(() => {
    setUpdateColumnsAction(newItemAttributes?.updateColumnActions ?? [])
  }, [setUpdateColumnsAction, newItemAttributes])

  const addSelectedItems = useCallback(async () => {
    await addSelectedItemsRequest.perform(selectedItems)
    postStats({name: BulkAddSidePanelAddItems, context: selectedItems.length.toString()})
    // if there are less items than 25, there will be no "refill" coming in anyway
    if (selectedItems.length === MAX_ITEM_NUM) {
      setAreAllItemsAdded(true)
    }
  }, [addSelectedItemsRequest, selectedItems, postStats, MAX_ITEM_NUM, setAreAllItemsAdded])

  const searchButtonVisible = hasSearchInput || searchHasFocus || searchQuery !== currentSearchValue // the last one is for when the user deletes the last executed search
  const searchButtonDisabled = (!hasSearchInput && !searchQuery) || searchQuery === currentSearchValue

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'canvas.default',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        justifyContent: 'space-between',
      }}
      {...testIdProps('bulk-add-view')}
    >
      <Box sx={{mt: 4, mx: [3, '', 4]}}>
        <Box sx={{display: 'flex', mb: 3, flexDirection: 'row-reverse'}}>
          <SidePanelToolbar showCloseButton />
          <Box sx={{flex: 1}} />
          <Text sx={{fontWeight: '600', fontSize: 3}} as="h2">
            {Resources.sidePanelBulkAddLabel}
          </Text>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'flex-start'}}>
          <RepoSuggestions key="repoSuggestions" targetRepository={targetRepository} />
          <TextInput
            sx={{flex: 1, ml: 2}}
            disabled={!hasRepos}
            leadingVisual={SearchIcon}
            aria-label="Search for issues and pull requests"
            ref={inputRef}
            type="text"
            placeholder="Search for issues and pull requests"
            onChange={onSearchInputChange}
            onFocus={onSearchInputFocus}
            onBlur={onSearchInputBlur}
            {...searchInputProps}
            size="small"
            value={currentSearchValue}
            trailingAction={
              searchButtonVisible ? (
                <SearchButton onClick={onSearchButtonClick} disabled={searchButtonDisabled} />
              ) : undefined
            }
            {...testIdProps('suggested-items-search-input')}
          />
        </Box>
        <ItemSuggestionsList />
      </Box>
      <Box
        sx={{
          position: 'sticky',
          zIndex: '1',
          display: 'flex',
          justifyContent: 'flex-end',
          bottom: '0',
          backgroundColor: 'canvas.default',
          borderTop: '1px solid',
          borderColor: 'border.default',
          width: '100%',
        }}
      >
        <Button
          variant="primary"
          onClick={addSelectedItems}
          {...testIdProps('bulk-add-button')}
          disabled={loading || addingItems || items?.length === 0 || selectedItems.length === 0}
          sx={{my: 3, mr: 4}}
        >
          {!addingItems ? 'Add selected items' : selectedItems.length === 1 ? 'Adding item...' : 'Adding items...'}
        </Button>
      </Box>
    </Box>
  )
}
