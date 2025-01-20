import {type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react'

import {apiUnarchiveItems} from '../../api/memex-items/api-unarchive-items'
import {ItemType} from '../../api/memex-items/item-type'
import {ArchivePageBulkActionMenu, type StatsItemActionFromProjectUI} from '../../api/stats/contracts'
import {parseTrimmedAndLowerCasedFilter} from '../../components/filter-bar/helpers/search-filter'
import {useApiRequest} from '../../hooks/use-api-request'
import {useItemMatchesFilterQuery} from '../../hooks/use-item-matches-filter-query'
import {useRemoveMemexItemWithConfirmation} from '../../hooks/use-remove-memex-items-with-id'
import {useValueDelayedByTimeout} from '../../hooks/use-value-delayed-by-timeout'
import type {MemexItemModel} from '../../models/memex-item-model'
import {
  ArchivedItemsContext,
  FilterArchiveItemsContext,
  RemoveArchiveItemsContext,
  RestoreArchiveItemsContext,
  SelectArchiveItemsContext,
} from './archive-contexts'
import {useFetchArchivedItems} from './hooks/use-fetch-archived-items'

export function ArchivedItemsProvider({children}: {children: ReactNode}) {
  const [selectedItems, setSelectedItems] = useState<Array<MemexItemModel>>([])

  const {itemMatchesFilterQuery} = useItemMatchesFilterQuery()
  const [filterValue, setFilterValue] = useState('')
  const deferredFilterValue = useValueDelayedByTimeout(filterValue.trim())

  const {state, optimisticRemoveItems, optimisticRollbackRemoveItems, loadAllItems, loadAllItemsStatus} =
    useFetchArchivedItems({filter: deferredFilterValue})

  const clearSelectedItems = useCallback(() => {
    setSelectedItems([])
  }, [])

  const selectItem = useCallback(
    (memexProjectItemId: number) => {
      // When the item is already selected, deselect it; otherwise, select it.
      const isItemSelected = selectedItems.some(item => item.id === memexProjectItemId)
      if (isItemSelected) {
        setSelectedItems(selectedItems.filter(item => item.id !== memexProjectItemId))
      } else {
        const selectedItem = state?.archivedItems?.find(item => item.id === memexProjectItemId)
        // Redacted items should not be able to be selected
        if (selectedItem?.contentType === ItemType.RedactedItem) {
          return
        }
        if (selectedItem) {
          setSelectedItems(alreadySelectedItems => [...alreadySelectedItems, selectedItem])
        }
      }
    },
    [state?.archivedItems, selectedItems],
  )

  const selectAllItems = useCallback((itemsToSelect: Array<MemexItemModel>) => {
    // Redacted items should not be able to be selected
    setSelectedItems(withoutRedactedItems(itemsToSelect))
  }, [])

  const toggleSelectAllItems = useCallback(
    (itemsToSelect: Array<MemexItemModel>) => {
      // Redacted items should not be able to be selected
      const itemsWithoutRedacted = withoutRedactedItems(itemsToSelect)
      // Case 1. If there are no items selected, select all items.
      // Case 2. If there are some items selected, select all items.
      // Case 3. If all items are selected, deselect all items.
      const isAllItemsSelected = selectedItems.length === itemsWithoutRedacted.length
      if (isAllItemsSelected) {
        setSelectedItems([])
      } else {
        setSelectedItems(itemsWithoutRedacted)
      }
    },
    [selectedItems.length],
  )

  const selectedItemsSet = useMemo(() => new Set(selectedItems.map(item => item.id)), [selectedItems])

  const isSelected = useCallback(
    (memexProjectItemId: number) => {
      return selectedItemsSet.has(memexProjectItemId)
    },
    [selectedItemsSet],
  )

  const onRemoveSelectedItems = useCallback(
    (removedItemIds: Array<number>) => {
      optimisticRemoveItems(removedItemIds)
      setSelectedItems(items => items.filter(item => !removedItemIds.includes(item.id)))
    },
    [optimisticRemoveItems],
  )

  const {openRemoveConfirmationDialog} = useRemoveMemexItemWithConfirmation(undefined, onRemoveSelectedItems)

  const removeAllSelectedItems = useCallback(() => {
    openRemoveConfirmationDialog(
      selectedItems.map(item => item.id),
      ArchivePageBulkActionMenu,
    )
  }, [openRemoveConfirmationDialog, selectedItems])

  const removeItems = useCallback(
    (memexProjectItemIds: Array<number>, ui: StatsItemActionFromProjectUI) => {
      openRemoveConfirmationDialog(memexProjectItemIds, ui)
    },
    [openRemoveConfirmationDialog],
  )

  const request = useCallback(
    async (memexProjectItems: Array<MemexItemModel>) => {
      const idsSet = new Set(memexProjectItems.map(item => item.id))
      // Optimistically update the archived items, assuming that the items will be restored
      optimisticRemoveItems(Array.from(idsSet))
      setSelectedItems(items => items.filter(itemModel => !idsSet.has(itemModel.id)))

      await apiUnarchiveItems({memexProjectItemIds: Array.from(idsSet)})
    },
    [optimisticRemoveItems],
  )

  const rollback = useCallback(
    async (failedItems: Array<MemexItemModel>) => {
      // If the optimistic UI fails, then we should rollback by re-adding the items we tried to restore
      optimisticRollbackRemoveItems(failedItems)
    },
    [optimisticRollbackRemoveItems],
  )

  const restoreItemsRequest = useApiRequest({request, rollback})

  const filteredItems = useMemo(() => {
    if (deferredFilterValue) {
      return (
        state?.archivedItems?.filter(item =>
          itemMatchesFilterQuery(item, parseTrimmedAndLowerCasedFilter(deferredFilterValue)),
        ) ?? []
      )
    }
    return state?.archivedItems ?? []
  }, [deferredFilterValue, state?.archivedItems, itemMatchesFilterQuery])

  // Redacted items should not count as selectable, since they cannot be managed
  const selectableItems = useMemo(() => withoutRedactedItems(filteredItems), [filteredItems])

  useEffect(() => {
    if (deferredFilterValue) {
      // Clear the selected items whenever the filter changes
      clearSelectedItems()
    }
  }, [clearSelectedItems, deferredFilterValue])

  return (
    <ArchivedItemsContext.Provider
      value={useMemo(() => {
        return {
          archivedItems: state?.archivedItems,
          totalCount: state?.totalCount,
          loaded: state !== null,
          filteredItems,
          loadAllItemsStatus,
          loadAllItems,
        }
      }, [filteredItems, loadAllItems, loadAllItemsStatus, state])}
    >
      <FilterArchiveItemsContext.Provider
        value={useMemo(() => {
          return {filteredItems, filterValue, deferredFilterValue, setFilterValue}
        }, [deferredFilterValue, filterValue, filteredItems, setFilterValue])}
      >
        <SelectArchiveItemsContext.Provider
          value={useMemo(() => {
            return {
              selectedItems,
              selectableItems,
              selectItem,
              selectAllItems,
              toggleSelectAllItems,
              isSelected,
              clearSelectedItems,
            }
          }, [
            clearSelectedItems,
            isSelected,
            selectAllItems,
            selectItem,
            selectableItems,
            selectedItems,
            toggleSelectAllItems,
          ])}
        >
          <RestoreArchiveItemsContext.Provider
            value={useMemo(() => {
              return {restoreItemsRequest}
            }, [restoreItemsRequest])}
          >
            <RemoveArchiveItemsContext.Provider
              value={useMemo(() => {
                return {removeAllSelectedItems, removeItems}
              }, [removeAllSelectedItems, removeItems])}
            >
              {children}
            </RemoveArchiveItemsContext.Provider>
          </RestoreArchiveItemsContext.Provider>
        </SelectArchiveItemsContext.Provider>
      </FilterArchiveItemsContext.Provider>
    </ArchivedItemsContext.Provider>
  )
}

export const useArchivedItems = () => {
  const context = useContext(ArchivedItemsContext)
  if (context === null) {
    throw new Error('useArchiveItems must be used within an ArchivedItemsContext')
  }

  return context
}

export const useRestoreArchiveItems = () => {
  const context = useContext(RestoreArchiveItemsContext)
  if (context === null) {
    throw new Error('useRestoreArchiveItems must be used within an RestoreArchiveItemsContext')
  }

  return context
}

export const useSelectArchiveItems = () => {
  const context = useContext(SelectArchiveItemsContext)
  if (context === null) {
    throw new Error('useSelectArchiveItems must be used within an SelectArchiveItemsContext')
  }

  return context
}

export const useRemoveArchiveItems = () => {
  const context = useContext(RemoveArchiveItemsContext)
  if (context === null) {
    throw new Error('useRemoveArchiveItems must be used within an RemoveArchiveItemsContext')
  }

  return context
}

export const useFilterArchiveItems = () => {
  const context = useContext(FilterArchiveItemsContext)
  if (context === null) {
    throw new Error('useFilterArchiveItems must be used within an FilterArchiveItemsContext')
  }

  return context
}

const withoutRedactedItems = <Item extends MemexItemModel>(items: Array<Item>): Array<Item> => {
  return items.filter(itemModel => itemModel.contentType !== ItemType.RedactedItem)
}
