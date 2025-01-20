import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useCallback, useRef} from 'react'
import type {Row} from 'react-table'

import type {MemexItemModel} from '../../../models/memex-item-model'
import {CELL_HEIGHT} from '../constants'

// A hook that determines when to scroll to a newly-added table row.
export function useScrollToNewItem(
  scrollRef: React.RefObject<HTMLElement | null>,
  rows: Array<Row<MemexItemModel>>,
  opts?: {left?: number; rowHeight: number},
): {onNewItem: (model: MemexItemModel) => void} {
  const shouldScroll = useRef<number>()
  const lastRowCount = useRef(rows.length)

  // If `shouldScroll` was set by an `onAddItem` callback and our row count has
  // changed, scroll to the bottom of the table after layout happens.
  useLayoutEffect(() => {
    if (shouldScroll.current && rows.length !== lastRowCount.current) {
      const index = rows.findIndex(row => row.original.id === shouldScroll.current)
      const scrollHeight = opts?.rowHeight ?? CELL_HEIGHT

      scrollRef.current?.scrollTo({left: opts?.left, top: index * scrollHeight, behavior: 'smooth'})
      shouldScroll.current = undefined
    }
    lastRowCount.current = rows.length
  })

  // A function called when a new items has been added to the table, which sets
  // our flag to scroll to it on the next render.
  const onNewItem = useCallback((model: MemexItemModel) => {
    shouldScroll.current = model.id
  }, [])

  return {onNewItem}
}
