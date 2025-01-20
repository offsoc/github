import {memo} from 'react'

import type {MemexItemModel} from '../../models/memex-item-model'
import {Omnibar} from '../omnibar/omnibar'
import {DefaultOmnibarPlaceholder} from '../omnibar/omnibar-placeholder'
import {useTableOmnibarFocus} from './hooks/use-table-omnibar-focus'

type Props = {
  onAddItem: (model: MemexItemModel) => void
  isFixed?: boolean
}

/**
 * A wrapper around the Omnibar for the table view
 *
 * Specifically, this component adds event listeners that allow keyboard
 * navigation from the Omnibar back to table cells.
 */
export const TableOmnibar = memo<Props>(function TableOmnibar({onAddItem, isFixed}) {
  const {omnibarRef, onFocus, onKeyDown} = useTableOmnibarFocus()

  return (
    <Omnibar
      ref={omnibarRef}
      role="row"
      childElementRole="gridcell"
      onAddItem={onAddItem}
      onKeyDown={onKeyDown}
      onInputFocus={onFocus}
      isFixed={isFixed}
      defaultPlaceholder={DefaultOmnibarPlaceholder}
    />
  )
})
