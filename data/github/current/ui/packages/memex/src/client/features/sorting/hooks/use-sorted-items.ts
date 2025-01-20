import {useCallback} from 'react'

import {useSortedBy} from '../../../hooks/use-sorted-by'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {resolveCombinedSortFunction} from '../resolver'

/**
 * @returns An object containing a sortItems function, which sort a provided list of
 * items (grouped or flat) based on the selected sort column.
 */
export function useSortedItems() {
  const {sorts} = useSortedBy()

  const sortUngroupedItems = useCallback(
    (items: Readonly<Array<MemexItemModel>>) => [...items].sort(resolveCombinedSortFunction(sorts)),
    [sorts],
  )

  return {sortUngroupedItems}
}
