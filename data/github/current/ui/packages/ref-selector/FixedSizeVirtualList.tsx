import {Box, type SxProp} from '@primer/react'
import React, {useCallback, useRef} from 'react'
import {useVirtual, type VirtualItem} from 'react-virtual'

interface FixedSizeVirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  renderItem: (item: T) => React.ReactNode
  makeKey: (item: T) => string
  sx?: SxProp['sx']
}

type Virtualizer = ReturnType<typeof useVirtual>

export function FixedSizeVirtualList<T>({
  items,
  itemHeight,
  sx,
  renderItem,
  makeKey,
}: FixedSizeVirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const estimateSize = useCallback(() => itemHeight, [itemHeight])
  const virtualizer = useVirtual({
    parentRef,
    size: items.length,
    estimateSize,
  })

  return (
    <ListContainer ref={parentRef} sx={sx} virtualizer={virtualizer}>
      {virtualizer.virtualItems.map(virtualRow => (
        <ItemContainer key={makeKey(items[virtualRow.index]!)} virtualRow={virtualRow}>
          {renderItem(items[virtualRow.index]!)}
        </ItemContainer>
      ))}
    </ListContainer>
  )
}

const ListContainer = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{virtualizer: Virtualizer; sx: SxProp['sx']}>
>(function VirtualListContainerInner({children, sx, virtualizer}, forwardedRef) {
  // Note: both of these containers are necesary
  return (
    <Box ref={forwardedRef} sx={sx}>
      <Box sx={{height: virtualizer.totalSize, width: '100%', position: 'relative'}}>{children}</Box>
    </Box>
  )
})

function ItemContainer({children, virtualRow}: React.PropsWithChildren<{virtualRow: VirtualItem}>) {
  // Note: all of these styles are necessary. Each item must be
  // absolutely positioned and moved around with a css transform or
  // else the list virtualization will not work.
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      {children}
    </Box>
  )
}
