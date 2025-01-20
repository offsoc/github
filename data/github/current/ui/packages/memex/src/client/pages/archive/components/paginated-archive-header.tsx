import {TrashIcon} from '@primer/octicons-react'
import {Box, Button, Checkbox, Link, Spinner, Text, Tooltip} from '@primer/react'

import type {GetPaginatedItemsResponse} from '../../../api/memex-items/paginated-views'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {ArchiveResources} from '../../../strings'
import {ArchiveHeaderWrapper} from './shared/archive-header-wrapper'

export function PaginatedArchiveHeader({
  projectItemLimit,
  canBulkRestore,
  loading,
  filteredItemCount,
  itemSelection,
  hasSelectedAllItemsInPage,
  hasMoreItemsOnServer,
  onToggleSelectAll,
  onRestoreSelectedItems,
  onRemoveSelectedItems,
  selectMatchingItemsOnServer,
  totalCount,
  previousPagesItemCount,
  removeIsMutating,
  restoreIsMutating,
}: {
  projectItemLimit: number
  canBulkRestore: boolean
  loading: boolean
  filteredItemCount: number
  itemSelection: number | 'all_on_server'
  hasSelectedAllItemsInPage: boolean
  hasMoreItemsOnServer: boolean
  onToggleSelectAll: () => void
  onRestoreSelectedItems: () => void
  onRemoveSelectedItems: () => void
  selectMatchingItemsOnServer: () => void
  totalCount: NonNullable<GetPaginatedItemsResponse['totalCount']>
  previousPagesItemCount: number
  restoreIsMutating: boolean
  removeIsMutating: boolean
}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const isSelectionPartial = itemSelection && !hasSelectedAllItemsInPage

  return (
    <ArchiveHeaderWrapper>
      <Box sx={{display: 'flex'}}>
        <div>
          {filteredItemCount > 0 ? (
            <Checkbox
              sx={{mr: 3}}
              onChange={hasWritePermissions ? onToggleSelectAll : undefined}
              aria-label="Toggle select all items"
              disabled={!hasWritePermissions || restoreIsMutating || removeIsMutating}
              {...(isSelectionPartial ? {indeterminate: true} : {checked: hasSelectedAllItemsInPage})}
            />
          ) : null}
        </div>
        <div>
          <ArchiveHeaderTitle
            itemSelection={itemSelection}
            selectMatchingItemsOnServer={
              hasMoreItemsOnServer && hasSelectedAllItemsInPage && itemSelection !== 'all_on_server'
                ? selectMatchingItemsOnServer
                : undefined
            }
            totalCount={totalCount}
            previousPagesItemCount={previousPagesItemCount}
            countForCurrentPage={filteredItemCount}
            loading={loading}
            disabled={restoreIsMutating || removeIsMutating}
          />
        </div>
      </Box>
      <ArchiveHeaderBulkActions
        projectItemLimit={projectItemLimit}
        canBulkRestore={canBulkRestore}
        itemSelection={itemSelection}
        onRestoreSelectedItems={onRestoreSelectedItems}
        onRemoveSelectedItems={onRemoveSelectedItems}
        restoreIsMutating={restoreIsMutating}
        removeIsMutating={removeIsMutating}
      />
    </ArchiveHeaderWrapper>
  )
}

function showSpinnerForAction(isMutating: boolean, itemSelection: number | 'all_on_server') {
  return isMutating && itemSelection !== 'all_on_server' && itemSelection <= 10
}

type ArchiveHeaderBulkActionsProps = {
  projectItemLimit: number
  canBulkRestore: boolean
  itemSelection: number | 'all_on_server'
  onRestoreSelectedItems: () => void
  onRemoveSelectedItems: () => void
  restoreIsMutating: boolean
  removeIsMutating: boolean
}

function ArchiveHeaderBulkActions({
  projectItemLimit,
  canBulkRestore,
  itemSelection,
  onRestoreSelectedItems,
  onRemoveSelectedItems,
  restoreIsMutating,
  removeIsMutating,
}: ArchiveHeaderBulkActionsProps) {
  if (itemSelection) {
    const disabled = restoreIsMutating || removeIsMutating
    const showSpinnerForRemove = showSpinnerForAction(removeIsMutating, itemSelection)
    const showSpinnerForRestore = showSpinnerForAction(restoreIsMutating, itemSelection)
    return (
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
        <Button
          leadingVisual={showSpinnerForRemove ? SmallSpinner : TrashIcon}
          variant="danger"
          size="small"
          onClick={onRemoveSelectedItems}
          disabled={disabled}
          aria-label={showSpinnerForRemove ? 'Deleting items from project...' : undefined}
        >
          Delete from project
        </Button>
        <Button
          leadingVisual={showSpinnerForRestore ? SmallSpinner : undefined}
          size="small"
          onClick={onRestoreSelectedItems}
          disabled={!canBulkRestore || disabled}
          aria-label={showSpinnerForRestore ? 'Restoring items in project...' : undefined}
        >
          {canBulkRestore ? (
            'Restore'
          ) : (
            <Tooltip aria-label={`This will exceed the ${projectItemLimit} project item limit`}>
              Restore unavailable
            </Tooltip>
          )}
        </Button>
      </Box>
    )
  }
  return null
}

function SmallSpinner() {
  return <Spinner size="small" />
}

type ArchiveHeaderTitleProps = {
  itemSelection: number | 'all_on_server'
  totalCount: NonNullable<GetPaginatedItemsResponse['totalCount']>
  selectMatchingItemsOnServer?: () => void
  previousPagesItemCount: number
  countForCurrentPage: number
  loading: boolean
  disabled: boolean
}

function ArchiveHeaderTitle({
  itemSelection,
  selectMatchingItemsOnServer,
  totalCount,
  previousPagesItemCount,
  countForCurrentPage,
  loading,
  disabled,
}: ArchiveHeaderTitleProps) {
  if (loading) {
    return (
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Text sx={{fontWeight: 'bold', marginRight: 2}}>Loading...</Text>
        <Spinner size="small" />
      </Box>
    )
  }
  if (itemSelection) {
    return (
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Text sx={{fontWeight: 'bold'}}>
          {itemSelection === 'all_on_server'
            ? ArchiveResources.allSelectedMatchingItems(totalCount)
            : ArchiveResources.selectedItems(itemSelection)}
        </Text>
        {selectMatchingItemsOnServer && (
          <Link disabled={disabled} sx={{ml: 2}} as="button" onClick={selectMatchingItemsOnServer}>
            {ArchiveResources.selectAllMatchingItems(totalCount)}
          </Link>
        )}
      </Box>
    )
  } else {
    return (
      <div>
        <Text sx={{fontWeight: 'bold'}}>
          {countForCurrentPage === 0
            ? ArchiveResources.noArchivedItems
            : ArchiveResources.itemCount(
                1 + previousPagesItemCount,
                countForCurrentPage + previousPagesItemCount,
                totalCount,
              )}
        </Text>
      </div>
    )
  }
}
