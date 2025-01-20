import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {memo, useMemo, useRef} from 'react'
import type {Row} from 'react-table'

import {getGroupTestId} from '../../helpers/table-group-utilities'
import {useAggregationSettings} from '../../hooks/use-aggregation-settings'
import {useDroppableGroup} from '../../hooks/use-droppable-group'
import {useViews} from '../../hooks/use-views'
import useIsVisible from '../board/hooks/use-is-visible'
import {GroupHeader} from '../common/group/group-header'
import {GroupHeaderLabel} from '../common/group/label/group-header-label'
import {GROUP_HEADER_HEIGHT} from '../common/group/styled-group-header'
import {CELL_HEIGHT, GROUP_SEPARATOR_HEIGHT} from './constants'
import {
  TABLE_GROUP_FOOTER_HEIGHT,
  TABLE_GROUP_FOOTER_MARGIN_TOP,
  TableGroupContents,
} from './group/table-group-contents'
import {isCellFocus, isGroupOmnibarFocus, type TableFocus, useTableNavigation} from './navigation'
import {useIsDraggingRows} from './row-reordering/hooks/use-is-dragging-rows'
import {ReorderableRowsContext} from './row-reordering/reorderable-rows'
import type {TableDataType} from './table-data-type'
import type {TableGroupProps} from './table-group-props'
import {TableGroupSeparator} from './table-group-separator'

const BORDER_WIDTH = 1
const TABLE_GROUP_FIXED_HEIGHT = GROUP_HEADER_HEIGHT + BORDER_WIDTH + GROUP_SEPARATOR_HEIGHT
const ADD_ITEM_ROW_HEIGHT = TABLE_GROUP_FOOTER_HEIGHT + TABLE_GROUP_FOOTER_MARGIN_TOP + BORDER_WIDTH

function isFocused(focus: TableFocus, rows: Array<Row<TableDataType>>, groupId: string) {
  if (isCellFocus(focus)) {
    return rows.some(row => row.id === focus.details.y)
  }

  return isGroupOmnibarFocus(focus, groupId)
}

/**
 * This is used to display a grouped set of rows as the output of a group-by operation.
 */
export const TableGroup = memo(function TableGroup({
  groupId,
  metadata,
  rows,
  firstRowIndex,
  itemData,
  scrollRef,
  isCollapsed,
  shouldDisableFooter,
  footerPlaceholder,
  isEditable,
  totalCount,
}: TableGroupProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const {missingRequiredColumnData} = useViews()
  const title = getGroupTestId(metadata.sourceObject)

  // Estimate the rendered size of the group by summing the variable height of
  // rows with the fixed height of headers, footers and spacing.
  const variableHeight = isCollapsed ? 0 : rows.length * CELL_HEIGHT + ADD_ITEM_ROW_HEIGHT
  const defaultHeight = variableHeight + TABLE_GROUP_FIXED_HEIGHT

  const {isVisible, size} = useIsVisible({ref, defaultHeight})

  // When this group of rows is visible, we set the height to 'unset' so that we inherit the true
  // height of the group after all of its contents have been painted. Otherwise, we render a fixed
  // height as a placeholder.
  const height = isVisible ? 'unset' : `${size}px`
  const style = useMemo(() => ({height}), [height])

  const {
    state: {focus},
  } = useTableNavigation()

  const {hideItemsCount, getAggregatesForItems} = useAggregationSettings()
  const items = useMemo(() => rows.map(row => row.original), [rows])
  const aggregates = useMemo(() => getAggregatesForItems(items), [getAggregatesForItems, items])

  // If we don't render the rows when dragging, the `useReorderableRow` hook will get unmounted and dnd-kit will not
  // provide any drop data
  const isDragging = useIsDraggingRows(rows)

  // It's important that we render the element if it's focused, even if it is
  // eligible for virtualization, because if we don't, programmatic `focus()`
  // will cause Safari to auto-scroll to the focused element. See
  // https://github.com/github/memex/issues/2772 for more context.
  const shouldRender = isVisible || isDragging || (focus && isFocused(focus, rows, groupId))

  const {setNodeRef, isOver} = useDroppableGroup({
    groupId,
    groupedValue: metadata.value,
    isCollapsed,
    isEmpty: rows.length === 0,
  })

  return (
    <Box sx={style} ref={ref} {...testIdProps(`table-group-${title}`)} role="rowgroup">
      {shouldRender ? (
        <>
          <Box
            sx={{
              boxShadow: 'shadow.medium',
              borderTop: `${BORDER_WIDTH}px solid`,
              borderBottom: `${BORDER_WIDTH}px solid`,
              borderColor: isOver ? 'accent.fg' : 'border.muted',
              cursor: isOver ? 'grabbing' : 'auto',
              position: 'relative',
              zIndex: 0,
            }}
            ref={setNodeRef}
          >
            <GroupHeader isCollapsed={isCollapsed} metadata={metadata} itemsInGroup={rows.map(row => row.original)}>
              <GroupHeaderLabel
                sourceObject={metadata.sourceObject}
                rowCount={totalCount}
                aggregates={aggregates}
                hideItemsCount={hideItemsCount}
              />
            </GroupHeader>
            {missingRequiredColumnData ? null : (
              <ReorderableRowsContext rows={rows} groupedValue={metadata.value}>
                <TableGroupContents
                  groupId={groupId}
                  firstRowIndex={firstRowIndex}
                  isCollapsed={isCollapsed}
                  itemData={itemData}
                  metadata={metadata}
                  rows={rows}
                  scrollRef={scrollRef}
                  shouldDisableFooter={shouldDisableFooter}
                  footerPlaceholder={footerPlaceholder}
                  isEditable={isEditable}
                />
              </ReorderableRowsContext>
            )}
          </Box>
          <TableGroupSeparator />
        </>
      ) : null}
    </Box>
  )
})
