import type {SharedBulkActionsItemPickerProps} from '@github-ui/item-picker/ItemPicker'
import {useListViewSelection} from '@github-ui/list-view/ListViewSelectionContext'

import type {ItemNodeType} from '../ListItems'
import {ListItemsHeaderWithBulkActions} from './ListItemsHeaderWithBulkActions'
import {ListItemsHeaderWithoutBulkActions} from './ListItemsHeaderWithoutBulkActions'

export type ListItemsHeaderProps = {
  checkedItems: Map<string, ItemNodeType>
  issueCount: number
  issueNodes: ItemNodeType[]
  sortingItemSelected: string
  setCheckedItems: (checkedItems: Map<string, ItemNodeType>) => void
  setReactionEmojiToDisplay: (arg: {reaction: string; reactionEmoji: string}) => void
  setSortingItemSelected: (sortingItemSelected: string) => void
  setCurrentPage: (page: number) => void
  useBulkActions: boolean
}

export type SharedListHeaderActionProps = {
  repo: string
  owner: string
  disabled: boolean
  singleKeyShortcutsEnabled: boolean
  /**
   * Whether to render the 'Add <property>' select panel as a nested select panel (true) versus a standalone select
   * panel (false; default).
   */
  nested?: boolean
} & SharedBulkActionsItemPickerProps

export function ListItemsHeader({...props}: ListItemsHeaderProps) {
  const {anyItemsSelected} = useListViewSelection()

  if (anyItemsSelected) {
    return <ListItemsHeaderWithBulkActions {...props} />
  }

  return <ListItemsHeaderWithoutBulkActions {...props} />
}
