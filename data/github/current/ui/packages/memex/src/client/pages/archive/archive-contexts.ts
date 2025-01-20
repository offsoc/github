import {createContext} from 'react'

import type {StatsItemActionFromProjectUI} from '../../api/stats/contracts'
import type {UseApiRequest} from '../../hooks/use-api-request'
import type {MemexItemModel} from '../../models/memex-item-model'

export type ArchivedItemsContextValue = {
  totalCount: number | undefined
  archivedItems: Array<MemexItemModel> | undefined
  loaded: boolean
  loadAllItems: () => Promise<Array<MemexItemModel> | undefined>
  loadAllItemsStatus: 'loading' | 'loaded' | 'error' | 'idle'
}

type FilterArchiveItemsContextValue = {
  filterValue: string
  deferredFilterValue: string
  filteredItems: Array<MemexItemModel>
  setFilterValue: (value: string) => void
}

type SelectArchiveItemsContextValue = {
  selectedItems: Array<MemexItemModel>
  selectableItems: Array<MemexItemModel>
  selectItem: (memexProjectItemId: number) => void
  /** Unconditionally select all items in the given array. */
  selectAllItems: (itemsToSelect: Array<MemexItemModel>) => void
  /** Select all items in the array if any are unselected, otherwise deselect all items. */
  toggleSelectAllItems: (itemsToSelect: Array<MemexItemModel>) => void
  clearSelectedItems: () => void
  isSelected: (memexProjectItemId: number) => boolean
}

type RestoreArchiveItemsContextValue = {
  restoreItemsRequest: UseApiRequest<Array<MemexItemModel>, Array<MemexItemModel>, void>
}

type RemoveArchiveItemsContextValue = {
  removeItems: (memexProjectItemIds: Array<number>, ui: StatsItemActionFromProjectUI) => void
  removeAllSelectedItems: () => void
}

export const ArchivedItemsContext = createContext<ArchivedItemsContextValue | null>(null)
export const FilterArchiveItemsContext = createContext<FilterArchiveItemsContextValue | null>(null)
export const RestoreArchiveItemsContext = createContext<RestoreArchiveItemsContextValue | null>(null)
export const RemoveArchiveItemsContext = createContext<RemoveArchiveItemsContextValue | null>(null)
export const SelectArchiveItemsContext = createContext<SelectArchiveItemsContextValue | null>(null)
