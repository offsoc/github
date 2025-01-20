import {Box, type BoxProps} from '@primer/react'
import {memo, useCallback, useEffect, useMemo, useState} from 'react'

import type {RepositoryItem, SuggestedRepository} from '../api/repository/contracts'
import {OmnibarAddItemSuggestionsUI} from '../api/stats/contracts'
import {useRepositoryItems} from '../hooks/use-repository-items'
import {useSidePanel} from '../hooks/use-side-panel'
import {repositoryWithOwnerFromString} from '../models/repository'
import {useStartIssueCreator} from './issue-creator'
import type {OmnibarItemAttrs} from './omnibar/types'
import {SelectedRepositoryPill} from './react_table/selected-repository-pill'
import {
  type ADD_MULTIPLE_ITEMS,
  ADD_MULTIPLE_ITEMS_KEY,
  type CREATE_ISSUE,
  CREATE_ISSUE_KEY,
} from './suggested-item-list'
import {type ItemPickerInteractionsProps, SuggestedItemPicker} from './suggested-item-picker'

export interface SuggestionsForRepositoryProps extends ItemPickerInteractionsProps, BoxProps {
  /** The selected repository to search for suggestions */
  repository: SuggestedRepository
  filteredItemIds?: Array<number>
  newItemAttributes?: OmnibarItemAttrs
}

const defaultFilteredItemIds: Array<number> = []
export const SuggestionsForRepository: React.FC<SuggestionsForRepositoryProps> = memo(
  function SuggestionsForRepository(props) {
    const {
      repository,
      filteredItemIds = defaultFilteredItemIds,
      newItemAttributes,
      inputRef,
      onItemSelected,
      onRemovePicker,
      renderInput,
      ...flexProps
    } = props
    const [loading, setLoading] = useState(true)
    const {refresh, items, removeItem} = useRepositoryItems(setLoading)
    const {openPaneBulkAdd} = useSidePanel()

    const filteredItems = useMemo(() => {
      if (items) {
        return items.filter(item => {
          return !filteredItemIds.includes(item.id)
        })
      } else {
        return []
      }
    }, [filteredItemIds, items])

    const updateSearchResults = useCallback(
      (query: string) => {
        return refresh(repository.id, query)
      },
      [refresh, repository],
    )

    const startIssueCreator = useStartIssueCreator()

    const selectItemAndRefreshSearchResults: typeof onItemSelected = useCallback(
      async (item: RepositoryItem | CREATE_ISSUE | ADD_MULTIPLE_ITEMS) => {
        setLoading(true)
        if (item.type === ADD_MULTIPLE_ITEMS_KEY) {
          openPaneBulkAdd(OmnibarAddItemSuggestionsUI, repository, item.title, newItemAttributes)
        } else if (item.type === CREATE_ISSUE_KEY) {
          startIssueCreator?.start(
            {issueTitle: item.title, repo: repositoryWithOwnerFromString(item.repository.nameWithOwner)},
            newItemAttributes,
            inputRef,
          )
        } else {
          await onItemSelected(item)
          await refresh(repository.id, '', true)
          removeItem(item)
        }
        setLoading(false)
      },
      [
        repository,
        openPaneBulkAdd,
        newItemAttributes,
        onItemSelected,
        refresh,
        removeItem,
        startIssueCreator,
        inputRef,
      ],
    )

    useEffect(() => {
      startIssueCreator?.prefetch(repositoryWithOwnerFromString(repository.nameWithOwner))
      updateSearchResults('')
    }, [repository.nameWithOwner, startIssueCreator, updateSearchResults])

    return (
      <>
        <Box {...flexProps} sx={{flexShrink: 0, display: 'flex', ...flexProps.sx}}>
          <SelectedRepositoryPill repository={repository} />
        </Box>
        <SuggestedItemPicker
          onRemovePicker={onRemovePicker}
          onItemSelected={selectItemAndRefreshSearchResults}
          inputRef={inputRef}
          renderInput={renderInput}
          loading={loading}
          filteredItems={filteredItems}
          onFilterTextChanged={updateSearchResults}
          repository={repository}
        />
      </>
    )
  },
)

SuggestionsForRepository.displayName = 'SuggestionsForRepository'
