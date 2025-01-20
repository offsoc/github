import {
  DndContext,
  PointerSensor,
  pointerWithin,
  restrictToHorizontalAxis,
  useSensor,
  useSensors,
} from '@github-ui/drag-and-drop'
import {Box} from '@primer/react'
import {memo, useCallback, useMemo} from 'react'
import type {ColumnInstance, HeaderGroup} from 'react-table'

import {
  type FieldGroupUIType,
  GroupByStatKey,
  SliceByApplied,
  SliceByRemoved,
  TableHeaderMenuUI,
} from '../../api/stats/contracts'
import {useHorizontalGroupedBy} from '../../features/grouping/hooks/use-horizontal-grouped-by'
import {useSliceBy} from '../../features/slicing/hooks/use-slice-by'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useRootElement} from '../../hooks/use-root-element'
import {useViewType} from '../../hooks/use-view-type'
import {useViews} from '../../hooks/use-views'
import type {ColumnModel} from '../../models/column-model'
import {DummyHeaderCell} from './header/dummy-table-header-cell'
import {TableHeaderCell} from './header/table-header-cell'
import {useRecordComponent} from './performance-measurements'
import type {TableDataType} from './table-data-type'
import {useTableColumnResizing, useTableInstance, useTableState} from './table-provider'
import {useColumnReorderingDragHandlers} from './use-column-reordering'

type Props = {
  headerGroups: Array<HeaderGroup<TableDataType>>
  height: number
  scrollRef: React.RefObject<HTMLElement>
  tableWidth: number
}

const autoScroll = {threshold: {x: 0.3, y: 0}}
const modifiers = [restrictToHorizontalAxis]

/**
 * The row containing the table header cells.
 */
export const TableHeader = memo((props: Props) => {
  // NOTE: Escape hatch, since we don't otherwise depend on column resizing
  // state.
  useTableColumnResizing()
  const {currentView} = useViews()
  const {viewType} = useViewType()
  const {postStats} = usePostStats()
  useRecordComponent('Table', 'TableHeader', '')

  const {clearGroupedBy, setGroupedBy} = useHorizontalGroupedBy()
  const {groupByColumnIds} = useTableState()
  const {toggleGroupBy} = useTableInstance()
  const {setSliceField, clearSliceField, sliceField} = useSliceBy()

  const groupByColumn = useCallback(
    (column: ColumnInstance<TableDataType>, ui: FieldGroupUIType) => {
      const columnModel = column.columnModel
      if (!columnModel) return
      if (!currentView) return
      if (column.isGrouped) {
        clearGroupedBy(currentView.number)
      } else {
        setGroupedBy(currentView.number, columnModel)
      }

      // If the table is already grouped and we are not ungrouping, remove the
      // grouping. Currently we only group by one column but why not make this
      // more future proof?
      if (groupByColumnIds.length && !column.isGrouped) {
        for (const groupedField of groupByColumnIds) {
          toggleGroupBy(groupedField, false)
        }
      }

      postStats({
        groupByEnabled: !column.isGrouped,
        memexProjectColumnId: columnModel.id,
        key: GroupByStatKey,
        ui,
      })

      column.toggleGroupBy()
    },
    [groupByColumnIds, postStats, clearGroupedBy, currentView, setGroupedBy, toggleGroupBy],
  )

  const sliceByColumn = useCallback(
    (column: ColumnModel) => {
      if (!currentView) return

      const isSliceField = sliceField === column

      if (isSliceField) {
        clearSliceField(currentView.number)
      } else {
        setSliceField(currentView.number, column)
      }

      postStats({
        name: isSliceField ? SliceByRemoved : SliceByApplied,
        ui: TableHeaderMenuUI,
        memexProjectColumnId: column.id,
        context: JSON.stringify({layout: viewType}),
      })

      return
    },
    [clearSliceField, currentView, postStats, setSliceField, sliceField, viewType],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // constraint ensure that header menu click does not get registered as drag
      },
    }),
  )
  const dndEvents = useColumnReorderingDragHandlers()
  const rootElement = useRootElement()
  return (
    <DndContext
      modifiers={modifiers}
      sensors={sensors}
      collisionDetection={pointerWithin}
      autoScroll={autoScroll}
      accessibility={useMemo(() => ({container: rootElement}), [rootElement])}
      {...dndEvents}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          zIndex: 4,
          backgroundColor: 'canvas.default',
          height: props.height,
          minWidth: props.tableWidth,
          boxShadow: theme =>
            `inset 0 -2px 0 ${theme.colors.border.default}, inset 0 1px 0 ${theme.colors.border.default}`,
        }}
      >
        {props.headerGroups.map(headerGroup => {
          const headerProps = headerGroup.getHeaderGroupProps({
            style: {width: '100%'},
          })
          return (
            <Box
              // Ensure the first column to the right of the Toggle filter button has no border
              sx={{
                '> div:nth-child(2)': {
                  borderLeft: 'none',
                },
              }}
              {...headerProps}
              key={headerProps.key}
            >
              {headerGroup.headers.map(header =>
                header.columnModel ? (
                  <TableHeaderCell
                    key={header.id}
                    header={header}
                    headers={headerGroup.headers}
                    groupByColumn={groupByColumn}
                    sliceByColumn={sliceByColumn}
                    height={props.height}
                  />
                ) : (
                  <DummyHeaderCell header={header} height={props.height} key={header.id} />
                ),
              )}
            </Box>
          )
        })}
      </Box>
    </DndContext>
  )
})

TableHeader.displayName = 'TableHeader'
