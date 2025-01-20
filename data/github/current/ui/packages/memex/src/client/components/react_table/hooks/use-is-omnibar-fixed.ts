import {useSyncExternalStore} from 'react'
import type {TableInstance} from 'react-table'

import {OMNIBAR_HEIGHT} from '../../omnibar/omnibar'
import type {TableDataType} from '../table-data-type'

/**
 * The omnibar should be fixed when:
 * 1. The table is not grouped (each group will have its own add item row instead)
 * 2. The height of the table view exceeds the viewport height
 */
export function useIsOmnibarFixed({
  totalHeight,
  scrollRef,
  table,
}: {
  table: TableInstance<TableDataType>
  totalHeight: number
  scrollRef: React.RefObject<HTMLDivElement>
}) {
  return useSyncExternalStore(subscribe, () => {
    const isTableGrouped = table.groupedRows !== undefined
    const doesProjectHeightOverflowScreen = totalHeight + OMNIBAR_HEIGHT > (scrollRef.current?.clientHeight ?? 0)
    return !isTableGrouped && doesProjectHeightOverflowScreen
  })
}
function subscribe(notify: () => void) {
  window.addEventListener('resize', notify)
  return () => window.removeEventListener('resize', notify)
}
