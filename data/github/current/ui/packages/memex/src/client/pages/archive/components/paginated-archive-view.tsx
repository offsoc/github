import {useDebounce} from '@github-ui/use-debounce'
import {Box, Flash, Link, PageLayout} from '@primer/react'
import {useCallback, useMemo, useReducer, useRef, useState} from 'react'

import type {RemoveMemexItemRequest, UnarchiveMemexItemRequest} from '../../../api/memex-items/contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {getInitialState} from '../../../helpers/initial-state'
import {useConfirmRemoveItems} from '../../../hooks/use-remove-memex-items-with-id'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'
import {useArchiveStatus} from '../../../state-providers/workflows/use-archive-status'
import {ArchiveResources} from '../../../strings'
import {type TransformedPaginatedData, usePaginatedArchivedItemsQuery} from '../hooks/use-paginated-archive-items-query'
import {useRemoveArchivedItemsMutation} from '../hooks/use-remove-archived-item-mutation'
import {useRestoreItemsMutation} from '../hooks/use-restore-archived-item-mutation'
import {useShowToastOnError} from '../hooks/use-show-toast-on-error'
import {
  initialPaginatedArchiveState,
  paginatedArchiveReducer,
  setItemSelection,
  setNextCursor,
  setPreviousCursor,
} from '../reducers/paginated-archive-reducer'
import {ArchiveQueryBuilder} from './archive-query-builder'
import {PaginatedArchiveFooter} from './paginated-archive-footer'
import {PaginatedArchiveHeader} from './paginated-archive-header'
import {PaginatedArchiveItem} from './paginated-archive-item'
import {PaginatedArchiveMutationInProgressDialog} from './paginated-archive-mutation-in-progress-dialog'
import {ArchiveList} from './shared/archive-list'

const getDataOrDefaults = (data?: TransformedPaginatedData) => ({
  filteredItems: data?.itemModels ?? [],
  hasNextPage: data?.pageInfo.hasNextPage ?? false,
  endCursor: data?.pageInfo.endCursor,
  totalCount: data?.totalCount ?? {value: 0, isApproximate: false},
})

export function PaginatedArchiveView() {
  const [state, dispatch] = useReducer(paginatedArchiveReducer, initialPaginatedArchiveState)
  const {data, isInitialLoading, isFetching} = usePaginatedArchivedItemsQuery({
    after: state.currentCursor,
    q: state.debouncedFilterValue,
  })

  const {filteredItems, hasNextPage, endCursor, totalCount} = getDataOrDefaults(data)
  const hasPreviousPage = state.previousCursors.length > 0
  const onFetchNextPage =
    hasNextPage && endCursor ? () => dispatch(setNextCursor(endCursor, filteredItems.length)) : undefined
  const onFetchPreviousPage = hasPreviousPage ? () => dispatch(setPreviousCursor()) : undefined

  const selectedItemsState = useMemo(
    () => (state.itemSelection === 'all_on_server' ? 'all_on_server' : new Set(state.itemSelection)),
    [state.itemSelection],
  )
  const selectableItemIds = useMemo(
    () =>
      filteredItems
        .filter(item => {
          const isRedacted = item.contentType === ItemType.RedactedItem
          const wasRecentlyRestored = !item.archived?.archivedAt
          return !(isRedacted || wasRecentlyRestored)
        })
        .map(item => item.id),
    [filteredItems],
  )
  const toggleSelectAllItemsInPage = useCallback(() => {
    if (selectedItemsState === 'all_on_server' || selectableItemIds.length === selectedItemsState.size) {
      dispatch(setItemSelection([]))
    } else {
      dispatch(setItemSelection(selectableItemIds))
    }
  }, [selectableItemIds, selectedItemsState])

  const selectMatchingItemsOnServer = useCallback(() => {
    dispatch(setItemSelection('all_on_server'))
  }, [])

  const {items} = useMemexItems()
  const projectItemLimit = getInitialState().projectLimits.projectItemLimit
  const canRestoreSingleItem = items.length + 1 <= projectItemLimit
  const canBulkRestore = getCanBulkRestore(projectItemLimit, selectedItemsState, items, totalCount.value)

  const onToggleSelection = useCallback(
    (archivedItem: MemexItemModel) => {
      if (selectedItemsState === 'all_on_server') {
        dispatch(setItemSelection(selectableItemIds.filter(id => id !== archivedItem.id)))
      } else {
        const selectedIdsSet = new Set(selectedItemsState)
        if (selectedIdsSet.has(archivedItem.id)) {
          selectedIdsSet.delete(archivedItem.id)
        } else {
          selectedIdsSet.add(archivedItem.id)
        }
        dispatch(setItemSelection(Array.from(selectedIdsSet)))
      }
    },
    [selectableItemIds, selectedItemsState],
  )

  const onError = useShowToastOnError()
  const {setArchiveStatus} = useArchiveStatus()
  const {mutate: restoreItems, isPending: restoreIsMutating} = useRestoreItemsMutation()
  const onRestoreItems = useCallback(
    async (request: UnarchiveMemexItemRequest) => {
      restoreItems(request, {
        onSuccess: () => {
          if (state.itemSelection === 'all_on_server' || state.itemSelection.length === selectableItemIds.length) {
            dispatch(setItemSelection([]))
          } else {
            const ids = 'memexProjectItemIds' in request ? request.memexProjectItemIds : []
            dispatch(setItemSelection(state.itemSelection.filter(id => !ids.includes(id))))
          }
          setArchiveStatus()
        },
        onError,
      })
    },
    [onError, restoreItems, selectableItemIds.length, setArchiveStatus, state.itemSelection],
  )
  const onRestoreSelectedItems = useCallback(() => {
    if (selectedItemsState === 'all_on_server') {
      onRestoreItems({q: state.debouncedFilterValue})
    } else {
      onRestoreItems({memexProjectItemIds: Array.from(selectedItemsState)})
    }
  }, [onRestoreItems, selectedItemsState, state.debouncedFilterValue])

  const {mutate: removeItems, isPending: removeIsMutating} = useRemoveArchivedItemsMutation()
  const {confirmRemoveItems} = useConfirmRemoveItems()
  const onRemoveItems = useCallback(
    async (request: RemoveMemexItemRequest) => {
      let ids: Array<number> = []
      let content: string | undefined = undefined
      if ('memexProjectItemIds' in request) {
        ids = request.memexProjectItemIds
      } else {
        content = ArchiveResources.deleteAllMatchingItemsConfirmation
      }
      if (await confirmRemoveItems(ids, content ? {content} : undefined)) {
        removeItems(request, {
          onSuccess: () => {
            if (state.itemSelection === 'all_on_server' || state.itemSelection.length === selectableItemIds.length) {
              dispatch(setItemSelection([]))
            } else {
              dispatch(setItemSelection(state.itemSelection.filter(id => !ids.includes(id))))
            }
            setArchiveStatus()
          },
          onError,
        })
      }
    },
    [confirmRemoveItems, onError, removeItems, selectableItemIds.length, setArchiveStatus, state.itemSelection],
  )

  const onRemoveSelectedItems = useCallback(() => {
    if (selectedItemsState === 'all_on_server') {
      onRemoveItems({q: state.debouncedFilterValue, scope: 'archived'})
    } else {
      onRemoveItems({memexProjectItemIds: Array.from(selectedItemsState)})
    }
  }, [onRemoveItems, selectedItemsState, state.debouncedFilterValue])

  const renderItem = useCallback(
    (archivedItem: MemexItemModel) => (
      <PaginatedArchiveItem
        archivedItem={archivedItem}
        columnData={archivedItem.columns}
        canRestore={canRestoreSingleItem}
        projectItemLimit={projectItemLimit}
        isSelected={selectedItemsState === 'all_on_server' || selectedItemsState.has(archivedItem.id)}
        onToggleSelection={() => onToggleSelection(archivedItem)}
        onRestoreItems={onRestoreItems}
        onRemoveItems={onRemoveItems}
        mutationLoading={restoreIsMutating || removeIsMutating}
      />
    ),
    [
      canRestoreSingleItem,
      onRemoveItems,
      onRestoreItems,
      onToggleSelection,
      projectItemLimit,
      removeIsMutating,
      restoreIsMutating,
      selectedItemsState,
    ],
  )

  const [filterInputValue, setFilterInputValue] = useState('')

  const debouncedSetFilterAction = useDebounce(
    (newFilterValue: string) => dispatch({type: 'SET_DEBOUNCED_FILTER_VALUE', debouncedFilterValue: newFilterValue}),
    225,
  )

  const setFilterValue = useCallback(
    (newFilterValue: string) => {
      setFilterInputValue(newFilterValue)
      debouncedSetFilterAction(newFilterValue)
    },
    [debouncedSetFilterAction],
  )

  const searchInputRef = useRef<HTMLInputElement>(null)

  // If there is a filter, assume items exist in the archive.
  // If there's no filter, rely on the actual item count.
  // This allows ArchiveList to show the correct empty state.
  const hasArchive = filteredItems.length > 0 || !!state.debouncedFilterValue

  const lastCursor = state.previousCursors[state.previousCursors.length - 1]
  const previousPagesItemCount = lastCursor ? lastCursor.previousPagesItemCount : 0

  const showInProgressDialog =
    (restoreIsMutating || removeIsMutating) && (selectedItemsState === 'all_on_server' || selectedItemsState.size > 10)

  const feedbackUrl = getInitialState().archiveAlphaFeedbackLink

  return (
    <PageLayout sx={{pt: 4}} containerWidth="large" rowGap="condensed">
      <PageLayout.Header>
        <Flash>
          {ArchiveResources.noLimitsBannerMessage}
          {feedbackUrl && (
            <>
              {ArchiveResources.noLimitsBannerFeedback}
              <Link inline href={feedbackUrl} target="_blank" rel="noreferrer">
                {ArchiveResources.noLimitsBannerFeedbackLinkText}
              </Link>
              .
            </>
          )}
        </Flash>
      </PageLayout.Header>
      <PageLayout.Content>
        <Box sx={{position: 'sticky', top: -2, pt: 3, mt: -3, backgroundColor: 'canvas.default', zIndex: 1}}>
          <ArchiveQueryBuilder
            ref={searchInputRef}
            onChange={value => setFilterValue(value)}
            value={filterInputValue}
          />
          <PaginatedArchiveHeader
            canBulkRestore={canBulkRestore}
            projectItemLimit={projectItemLimit}
            loading={isFetching}
            restoreIsMutating={restoreIsMutating}
            removeIsMutating={removeIsMutating}
            filteredItemCount={filteredItems.length}
            itemSelection={selectedItemsState === 'all_on_server' ? 'all_on_server' : selectedItemsState.size}
            hasSelectedAllItemsInPage={
              selectedItemsState === 'all_on_server' || selectedItemsState.size === selectableItemIds.length
            }
            hasMoreItemsOnServer={hasNextPage || hasPreviousPage}
            onToggleSelectAll={toggleSelectAllItemsInPage}
            onRestoreSelectedItems={onRestoreSelectedItems}
            onRemoveSelectedItems={onRemoveSelectedItems}
            selectMatchingItemsOnServer={selectMatchingItemsOnServer}
            totalCount={totalCount}
            previousPagesItemCount={previousPagesItemCount}
          />
        </Box>
        <ArchiveList
          filteredItems={filteredItems}
          loaded={!isInitialLoading}
          hasArchive={hasArchive}
          renderItem={renderItem}
          sx={filteredItems.length > 0 ? {borderRadius: 0, borderBottom: 0} : undefined}
        />
        <PaginatedArchiveFooter
          hasResults={filteredItems.length > 0}
          onFetchNextPage={onFetchNextPage}
          onFetchPreviousPage={onFetchPreviousPage}
          mutationIsLoading={removeIsMutating || restoreIsMutating}
        />
        {showInProgressDialog && (
          <PaginatedArchiveMutationInProgressDialog
            headerText={restoreIsMutating ? 'Restoring items...' : 'Deleting items...'}
          />
        )}
      </PageLayout.Content>
    </PageLayout>
  )
}

function getCanBulkRestore(
  projectItemLimit: number,
  selectedItemsState: Set<number> | 'all_on_server',
  items: Readonly<Array<MemexItemModel>>,
  minimumTotalCount: number,
) {
  if (selectedItemsState === 'all_on_server') {
    return items.length + minimumTotalCount < projectItemLimit
  } else {
    return items.length + selectedItemsState.size <= projectItemLimit
  }
}
