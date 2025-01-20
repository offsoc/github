import {createContext, memo, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react'

import type {UpdateColumnValueAction} from '../../../api/columns/contracts/domain'
import type {ColumnUpdateData} from '../../../api/columns/contracts/storage'
import {apiBulkAddItems} from '../../../api/memex-items/api-bulk-add-items'
import {apiBulkAddItemsFromMultipleRepos} from '../../../api/memex-items/api-bulk-add-items-from-multiple-repos'
import type {BulkAddItem} from '../../../api/memex-items/contracts'
import type {RepositoryItem, SuggestedRepository} from '../../../api/repository/contracts'
import {type UseApiRequest, useApiRequest} from '../../../hooks/use-api-request'
import {useRepositoryItems} from '../../../hooks/use-repository-items'
import {mapToRemoteUpdate} from '../../../state-providers/column-values/column-value-payload'

type BulkAddItemsContextValue = {
  loading: boolean
  addingItems: boolean
  selectedItems: Array<RepositoryItem | BulkAddItem>
  selectItem: (item: RepositoryItem) => void
  updateColumnsAction: Array<UpdateColumnValueAction>
  setUpdateColumnsAction: (columnUpdates: Array<UpdateColumnValueAction>) => void
  clearSelectedItems: () => void
  items: Array<RepositoryItem> | null
  isSelected: (memexProjectItemId: number) => boolean
  addSelectedItemsRequest: UseApiRequest<Array<RepositoryItem | BulkAddItem>, void>
  selectedRepo: SuggestedRepository | null | undefined
  setSelectedRepo: (repo: SuggestedRepository | null | undefined) => void
  hasFetchedRepos: boolean
  setHasFetchedRepos: (hasFetchedRepo: boolean) => void
  finishedFetchingRepoItems: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectAllItems: () => void
  areAllItemsSelected: boolean
  setAreAllItemsAdded: (areAllItemsAdded: boolean) => void
  areAllItemsAdded: boolean
  MAX_ITEM_NUM: number
}

const BulkAddItemsContext = createContext<BulkAddItemsContextValue | null>(null)

export const BulkAddItemsProvider = memo(function BulkAddItemsProvider({
  children,
  selectedRepository,
  query: initialQuery,
}: {
  children: ReactNode
  selectedRepository?: SuggestedRepository
  query?: string
}) {
  const NO_REPOS_PRESENT = null
  const MAX_ITEM_NUM = 25
  const [loading, setLoading] = useState<boolean>(true)
  const [addingItems, setAddingItems] = useState<boolean>(false)
  const [selectedItems, setSelectedItems] = useState<Array<RepositoryItem | BulkAddItem>>([])
  const [updateColumnsAction, setUpdateColumnsAction] = useState<Array<UpdateColumnValueAction>>([])
  const [areAllItemsAdded, setAreAllItemsAdded] = useState<boolean>(false)
  const [selectedRepo, setSelectedRepo] = useState<SuggestedRepository | undefined | typeof NO_REPOS_PRESENT>(
    selectedRepository,
  )
  const [searchQuery, setSearchQuery] = useState(initialQuery ?? '')
  const [hasFetchedRepos, setHasFetchedRepos] = useState<boolean>(false)
  const [finishedFetchingRepoItems, setFinishedFetchingRepoItems] = useState<boolean>(false)

  // Passing 25 as a limit to let dotcom know to disregard the hardcoded limit of 8 returned items
  const {refresh, items, removeItems} = useRepositoryItems(setLoading, {limit: MAX_ITEM_NUM})

  const selectedItemsSet = useMemo(() => new Set(selectedItems.map(item => item.number)), [selectedItems])

  const selectItem = useCallback(
    (selectedItem: RepositoryItem) => {
      // When the item is already selected, deselect it; otherwise, select it.
      const isItemSelected = selectedItems.some(item => item.number === selectedItem.number)
      if (isItemSelected) {
        setSelectedItems(selectedItems.filter(item => item.number !== selectedItem.number))
      } else {
        setSelectedItems(alreadySelectedItems => [...alreadySelectedItems, selectedItem])
      }
    },
    [selectedItems],
  )

  const areAllItemsSelected = useMemo(() => selectedItems.length === items?.length, [items, selectedItems])

  const selectAllItems = useCallback(() => {
    if (!areAllItemsSelected) {
      if (items) {
        setSelectedItems(items)
      }
    } else {
      setSelectedItems([])
    }
  }, [areAllItemsSelected, items])

  const isSelected = useCallback(
    (selectedItemId: number) => {
      return selectedItemsSet.has(selectedItemId)
    },
    [selectedItemsSet],
  )

  const clearSelectedItems = useCallback(() => {
    setSelectedItems([])
  }, [])

  const updateSearchResults = useCallback(
    async (query: string) => {
      setFinishedFetchingRepoItems(false)
      setAreAllItemsAdded(false)
      if (selectedRepo) {
        clearSelectedItems()
        // passing `force` as `true` to `refresh` will make sure the items get updated when switching between selected repos
        await refresh(selectedRepo.id, query, true)
        // when `selectedRepo` is `null` we know that the fetching process has ended and that the return value was `null`/there were no repos
      } else if (hasFetchedRepos && selectedRepo === NO_REPOS_PRESENT) {
        // Setting it to true for the edge case of when user has no repos (otherwise it happens in the `refresh` function).
        // It has to be set to true to signal that the fetching process has finished and loading can be set to false on l93
        setFinishedFetchingRepoItems(true)
      }
    },
    [clearSelectedItems, hasFetchedRepos, refresh, selectedRepo],
  )

  useEffect(() => {
    if (items) {
      setFinishedFetchingRepoItems(true)
    }
  }, [items])

  useEffect(() => {
    updateSearchResults(searchQuery)
  }, [updateSearchResults, searchQuery])

  // Re-fetch items in the case if all 25 available were added and we want to check whether repo has more items to offer
  useEffect(() => {
    if (areAllItemsAdded) {
      updateSearchResults(searchQuery)
    }
  }, [areAllItemsAdded, updateSearchResults, searchQuery])

  useEffect(() => {
    // if there is at least one repo, we want to to set loading to false when we have fetched both the repos and the items (including
    // if there are no items in the repo)
    // if there are no repos at all, we want to set loading to false when we have fetched the repos and are sure the return value is null/empty/none
    if (finishedFetchingRepoItems && hasFetchedRepos) {
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [finishedFetchingRepoItems, hasFetchedRepos, loading, setLoading])

  const request = useCallback(
    async (itemsToAdd: Array<RepositoryItem | BulkAddItem>) => {
      const memexProjectColumnValues: Array<ColumnUpdateData> = []
      for (const action of updateColumnsAction) {
        const remoteUpdate = mapToRemoteUpdate(action)
        if (remoteUpdate) memexProjectColumnValues.push(remoteUpdate)
      }

      const numbersSet = new Set(itemsToAdd.map(item => item.number))
      setAddingItems(true)

      let isJobFinished
      if (selectedRepo) {
        isJobFinished = await apiBulkAddItems(
          selectedRepo,
          itemsToAdd as Array<RepositoryItem>,
          memexProjectColumnValues,
        )
      } else {
        isJobFinished = await apiBulkAddItemsFromMultipleRepos(
          itemsToAdd as Array<BulkAddItem>,
          memexProjectColumnValues,
        )
      }

      if (isJobFinished) {
        removeItems(numbersSet)
        setSelectedItems(selected => selected.filter(itemModel => !numbersSet.has(itemModel.number)))
        setAddingItems(false)
        // addressing the case when all items are added and we are checking whether repo has more and whether the side panel
        // will be refilled. in this case there is a moment before `finishedFetchingRepoItems` state gets set to false
        // in `refresh` in `use-repository-items`. during this moment the conditions to show blank state in `item-suggestion-list` evaluate to true.
        // this way we set it immediately to false avoiding this short moment of confusion
        if (itemsToAdd.length === MAX_ITEM_NUM) {
          setFinishedFetchingRepoItems(false)
        }
      }
    },
    [selectedRepo, updateColumnsAction, removeItems],
  )

  const rollback = useCallback(() => {
    setAddingItems(false)
  }, [])

  const addSelectedItemsRequest = useApiRequest({request, rollback})

  return (
    <BulkAddItemsContext.Provider
      value={useMemo(() => {
        return {
          addSelectedItemsRequest,
          clearSelectedItems,
          isSelected,
          selectItem,
          selectedItems,
          selectedRepo,
          setSelectedRepo,
          updateColumnsAction,
          setUpdateColumnsAction,
          hasFetchedRepos,
          setHasFetchedRepos,
          items,
          loading,
          addingItems,
          finishedFetchingRepoItems,
          searchQuery,
          setSearchQuery,
          selectAllItems,
          areAllItemsSelected,
          areAllItemsAdded,
          setAreAllItemsAdded,
          MAX_ITEM_NUM,
        }
      }, [
        addSelectedItemsRequest,
        clearSelectedItems,
        isSelected,
        selectItem,
        selectedItems,
        selectedRepo,
        setSelectedRepo,
        updateColumnsAction,
        setUpdateColumnsAction,
        hasFetchedRepos,
        setHasFetchedRepos,
        items,
        loading,
        addingItems,
        finishedFetchingRepoItems,
        searchQuery,
        setSearchQuery,
        selectAllItems,
        areAllItemsSelected,
        areAllItemsAdded,
        setAreAllItemsAdded,
        MAX_ITEM_NUM,
      ])}
    >
      {children}
    </BulkAddItemsContext.Provider>
  )
})

export const useBulkAddItems = () => {
  const context = useContext(BulkAddItemsContext)
  if (context === null) {
    throw new Error('useBulkAddItems must be used within an BulkAddItemsContext')
  }

  return context
}
