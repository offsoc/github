import {TrashIcon} from '@primer/octicons-react'
import {Box, Button, Checkbox, Link, Spinner, Text, Tooltip} from '@primer/react'
import {useCallback, useMemo} from 'react'

import {parseTrimmedAndLowerCasedFilter} from '../../../components/filter-bar/helpers/search-filter'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useItemMatchesFilterQuery} from '../../../hooks/use-item-matches-filter-query'
import {useArchiveStatus} from '../../../state-providers/workflows/use-archive-status'
import {
  useArchivedItems,
  useFilterArchiveItems,
  useRemoveArchiveItems,
  useRestoreArchiveItems,
  useSelectArchiveItems,
} from '../archive-page-provider'
import {ArchiveHeaderWrapper} from './shared/archive-header-wrapper'

export function ArchiveHeader({projectItemLimit, canBulkRestore}: {projectItemLimit: number; canBulkRestore: boolean}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {archivedItems, loaded, loadAllItemsStatus, loadAllItems, totalCount} = useArchivedItems()
  const {selectedItems, selectableItems, selectAllItems, toggleSelectAllItems} = useSelectArchiveItems()
  const {removeAllSelectedItems} = useRemoveArchiveItems()
  const {restoreItemsRequest} = useRestoreArchiveItems()
  const {deferredFilterValue: filter} = useFilterArchiveItems()
  const {itemMatchesFilterQuery} = useItemMatchesFilterQuery()
  const {setArchiveStatus} = useArchiveStatus()

  const restoreSelectedItems = useCallback(async () => {
    await restoreItemsRequest.perform(selectedItems, selectedItems)
    setArchiveStatus()
  }, [restoreItemsRequest, selectedItems, setArchiveStatus])

  const selectAll = useCallback(() => {
    toggleSelectAllItems(selectableItems)
  }, [toggleSelectAllItems, selectableItems])

  const hasSelectedAllItems = selectedItems.length === selectableItems.length && selectableItems.length > 0
  const hasSelectedNoItems = selectedItems.length === 0
  const hasSelection = selectedItems.length > 0
  const isSelectionPartial = !hasSelectedAllItems && !hasSelectedNoItems
  const hasItems = archivedItems ? archivedItems.length > 0 : false
  const canLoadMoreItems = archivedItems && totalCount ? totalCount > archivedItems.length : false

  const {primaryText, secondaryText, loadAllText, loadAllAction} = useMemo(() => {
    const loadedAllItems = loadAllItemsStatus === 'loaded' || !canLoadMoreItems

    // Handle unloaded state
    if (!archivedItems || !totalCount) {
      return {
        primaryText: '0 archived items',
      }
    }

    if (!loadedAllItems && !hasSelection && !filter) {
      return {
        primaryText: 'Most recently archived',
        secondaryText: `of ${totalCount.toLocaleString()} archived items`,
        loadAllText: 'Show all',
        loadAllAction: loadAllItems,
      }
    } else if (!loadedAllItems && hasSelection) {
      return {
        primaryText: `${selectedItems.length.toLocaleString()} selected`,
        secondaryText: `Only selecting results from most recently archived`,
        loadAllText: 'Select all',
        loadAllAction: async () => {
          const newItems = await loadAllItems()
          if (newItems) {
            selectAllItems(
              newItems.filter(item => itemMatchesFilterQuery(item, parseTrimmedAndLowerCasedFilter(filter))),
            )
          }
        },
      }
    } else if (!loadedAllItems && Boolean(filter)) {
      return {
        primaryText: `${selectableItems.length.toLocaleString()} archived ${
          selectableItems.length === 1 ? 'item' : 'items'
        }`,
        secondaryText: 'Only filtering on most recently archived',
        loadAllText: 'Filter on all',
        loadAllAction: loadAllItems,
      }
    } else if (loadedAllItems && Boolean(filter)) {
      return {
        primaryText: `${selectableItems.length.toLocaleString()} archived ${
          selectableItems.length === 1 ? 'item' : 'items'
        }`,
      }
    } else if (loadedAllItems && hasSelection) {
      return {
        primaryText: `${selectedItems.length.toLocaleString()} selected`,
      }
    } else {
      return {
        primaryText: `${totalCount.toLocaleString()} archived ${totalCount === 1 ? 'item' : 'items'}`,
      }
    }
  }, [
    loadAllItemsStatus,
    canLoadMoreItems,
    archivedItems,
    totalCount,
    hasSelection,
    filter,
    loadAllItems,
    selectedItems.length,
    selectAllItems,
    itemMatchesFilterQuery,
    selectableItems.length,
  ])

  const isLoadingAllItems = loadAllItemsStatus === 'loading'

  return (
    <ArchiveHeaderWrapper>
      <Box sx={{display: 'flex'}}>
        <div>
          {hasItems ? (
            <Checkbox
              sx={{mr: 3}}
              onChange={selectAll}
              aria-label="Toggle select all items"
              disabled={isLoadingAllItems || !hasWritePermissions}
              {...(isSelectionPartial ? {indeterminate: true} : {checked: hasSelectedAllItems})}
            />
          ) : null}
        </div>
        <div>
          {primaryText ? <Text sx={{fontWeight: 'bold'}}>{primaryText}</Text> : null}
          {loaded && hasItems ? (
            <div>
              {secondaryText ? <Text sx={{color: 'fg.muted', mr: 2}}>{secondaryText}</Text> : null}
              {loadAllText ? (
                <Link
                  as="button"
                  onClick={loadAllAction}
                  disabled={isLoadingAllItems}
                  sx={{
                    color: isLoadingAllItems ? 'primer.fg.disabled' : undefined,
                    ['&&']: {
                      cursor: isLoadingAllItems ? 'default' : 'pointer',
                    },
                  }}
                >
                  {loadAllText}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </Box>
      {loaded && loadAllItemsStatus === 'loading' ? (
        <Spinner size="small" />
      ) : hasSelection ? (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          <Button leadingVisual={TrashIcon} variant="danger" size="small" onClick={removeAllSelectedItems}>
            Delete from project
          </Button>
          <Button size="small" onClick={restoreSelectedItems} disabled={!canBulkRestore}>
            {!canBulkRestore ? (
              <Tooltip aria-label={`This will exceed the ${projectItemLimit} project item limit`}>
                Restore unavailable
              </Tooltip>
            ) : (
              'Restore'
            )}
          </Button>
        </Box>
      ) : null}
    </ArchiveHeaderWrapper>
  )
}
