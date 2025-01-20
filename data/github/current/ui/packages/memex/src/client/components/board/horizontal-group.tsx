import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Box} from '@primer/react'
import {useRef} from 'react'

import {resolveRawTitleForGroupingContext} from '../../helpers/table-group-utilities'
import type {FieldAggregate} from '../../hooks/use-aggregation-settings'
import {useDroppableGroup} from '../../hooks/use-droppable-group'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import type {ColumnModel} from '../../models/column-model'
import type {GroupedHorizontalGroup, HorizontalGrouping} from '../../models/horizontal-group'
import type {MemexItemModel} from '../../models/memex-item-model'
import type {VerticalGroup} from '../../models/vertical-group'
import {usePaginatedMemexItemsQuery} from '../../state-providers/memex-items/queries/use-paginated-memex-items-query'
import {GroupHeader} from '../common/group/group-header'
import {GroupHeaderLabel} from '../common/group/label/group-header-label'
import {GROUP_HEADER_HEIGHT} from '../common/group/styled-group-header'
import {OMNIBAR_HEIGHT} from '../omnibar/omnibar'
import {Columns} from './columns'
import {CARD_MARGIN_BOTTOM, CARD_SIZE_ESTIMATE, COLUMN_PADDING, HORIZONTAL_GROUP_CONTAINER_STYLE} from './constants'
import useIsVisible from './hooks/use-is-visible'

const SCROLL_TIMEOUT = 10

export function HorizontalGroup({
  aggregates,
  groupByField,
  groupByFieldOptions,
  groupedItems,
  headerRef,
  hideColumn,
  hideItemsCount,
  horizontalGroup,
  index,
  lastNewColumnNameRef,
  scrollToItemId,
  draggingItems,
  scrollRef,
}: {
  horizontalGroup: Readonly<GroupedHorizontalGroup>
  headerRef: React.MutableRefObject<HTMLDivElement | null>
  aggregates: Array<FieldAggregate>
  hideItemsCount: boolean
  groupByFieldOptions: Array<VerticalGroup>
  groupByField: ColumnModel | undefined
  scrollToItemId: number | undefined
  lastNewColumnNameRef: React.MutableRefObject<string | null>
  hideColumn: (verticalGroup: VerticalGroup) => boolean
  groupedItems: HorizontalGrouping
  index: number
  draggingItems: Array<MemexItemModel>
  scrollRef: React.MutableRefObject<HTMLDivElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const {memex_table_without_limits, memex_mwl_swimlanes} = useEnabledFeatures()
  const {hasNextPageForSecondaryGroups} =
    memex_table_without_limits && memex_mwl_swimlanes
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        usePaginatedMemexItemsQuery()
      : {hasNextPageForSecondaryGroups: false}

  // Find the column with the most cards in it to determine size estimate.
  const maxCards = (Object.values(horizontalGroup.itemsByVerticalGroup) || []).reduce((acc, curr) => {
    return acc > curr.items.length ? acc : curr.items.length
  }, 0)
  const defaultHeight = horizontalGroup.isCollapsed
    ? 0
    : maxCards * (CARD_SIZE_ESTIMATE + CARD_MARGIN_BOTTOM) + OMNIBAR_HEIGHT + COLUMN_PADDING * 2
  const {isVisible, size} = useIsVisible({
    ref,
    defaultHeight,
  })

  // If we're dragging a card in a current group, ensure that it is rendered
  const isDraggingInGroup = draggingItems.some(item => horizontalGroup.rows.includes(item))

  const {setNodeRef, isOver} = useDroppableGroup({
    groupId: horizontalGroup.value,
    groupedValue: horizontalGroup.value,
    isCollapsed: horizontalGroup.isCollapsed,
    isEmpty: horizontalGroup.rows.length === 0,
  })

  // When this group of columns is visible, we set the height to 'unset' so that we inherit the true
  // height of the chunk after all of its contents have been painted. Otherwise, we render a fixed
  // height as a placeholder.
  const height = isVisible ? 'unset' : `${size}px`

  const shouldRender = (isVisible || isDraggingInGroup) && !horizontalGroup.isCollapsed

  const collapsedRef = useRef(horizontalGroup.isCollapsed)
  // After a group expands or collapses, adjust the scroll position on the container so that
  // the currently sticky group remains in view.
  useLayoutEffect(() => {
    if (horizontalGroup.isCollapsed !== collapsedRef.current) {
      let forceGroupScroll = false

      const getGroupPosition = () => {
        if (!ref.current || !scrollRef.current || !headerRef.current) return 0
        // Position of scroll container, relative to the viewport
        const {top: itemsTop} = ref.current.getBoundingClientRect()
        // Position of grouped items, relative to the viewport
        const {top: containerTop} = scrollRef.current.getBoundingClientRect()
        // Height of board sticky header and group header
        const totalHeaderHeight = headerRef.current.getBoundingClientRect().height + GROUP_HEADER_HEIGHT

        return itemsTop - totalHeaderHeight - containerTop
      }

      const scrollToGroup = () => {
        requestAnimationFrame(() => {
          if (!scrollRef.current) return
          // Determine if the header position is outside of the visible scrolling area
          const groupPosition = getGroupPosition()

          if (forceGroupScroll || groupPosition < 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollTop + groupPosition
            // After our initial adjustment, call this function again in setTimeout regardless of scroll position
            // in case another layout shift has caused group position to change.
            forceGroupScroll = true
          }
        })
      }
      scrollToGroup()
      // Occasionally a second layout shift occurs right after the initial rendering of board items. This can
      // result in an incorrect original scroll adjustment. Scrolling a second time can cause a small visual flicker
      // but increases the success of scrolling to a group.
      setTimeout(() => {
        scrollToGroup()
      }, SCROLL_TIMEOUT)
    }
    collapsedRef.current = horizontalGroup.isCollapsed
  }, [horizontalGroup.isCollapsed, headerRef, scrollRef])

  const isLastGroup = !hasNextPageForSecondaryGroups && groupedItems.horizontalGroups.length - 1 === index

  return (
    <>
      <GroupHeader
        sticky
        isCollapsed={horizontalGroup.isCollapsed}
        metadata={horizontalGroup}
        itemsInGroup={horizontalGroup.rows}
        swimlanesHeaderRef={headerRef}
        ref={setNodeRef}
        isHighlighted={isOver}
      >
        <GroupHeaderLabel
          sourceObject={horizontalGroup.sourceObject}
          rowCount={horizontalGroup.rows.length}
          aggregates={aggregates}
          hideItemsCount={hideItemsCount}
        />
      </GroupHeader>
      <div ref={ref} style={{height}}>
        {shouldRender ? (
          <Box
            sx={HORIZONTAL_GROUP_CONTAINER_STYLE}
            data-board-horizontal-group={resolveRawTitleForGroupingContext(horizontalGroup.sourceObject)}
          >
            <Columns
              groupByFieldOptions={groupByFieldOptions}
              itemsGroupedByField={horizontalGroup.itemsByVerticalGroup}
              groupByField={groupByField}
              scrollToItemId={scrollToItemId}
              lastNewColumnNameRef={lastNewColumnNameRef}
              headerType="hidden"
              hideColumn={hideColumn}
              horizontalGroup={horizontalGroup}
              isLastGroup={isLastGroup}
              horizontalGroupIndex={index}
            />
          </Box>
        ) : null}
      </div>
    </>
  )
}
