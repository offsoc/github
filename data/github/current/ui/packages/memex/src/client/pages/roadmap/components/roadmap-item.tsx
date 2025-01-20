import {DndContext, PointerSensor, restrictToHorizontalAxis, useSensor, useSensors} from '@github-ui/drag-and-drop'
import {testIdProps} from '@github-ui/test-id-props'
import {useRefObjectAsForwardedRef} from '@primer/react'
import {memo, useMemo, useRef, useState} from 'react'
import type {Row} from 'react-table'

import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../api/memex-items/item-type'
import {RoadmapDateFieldNone} from '../../../api/view/contracts'
import useIsVisible from '../../../components/board/hooks/use-is-visible'
import {RowDragHandleColumnId} from '../../../components/react_table/column-ids'
import {useReorderableRow} from '../../../components/react_table/row-reordering/reorderable-rows'
import type {TableDataType} from '../../../components/react_table/table-data-type'
import {RowContext} from '../../../components/react_table/table-row'
import {rowTestId} from '../../../components/react_table/test-identifiers'
import type {ItemDataType} from '../../../components/react_table/use-item-data'
import {ROADMAP_PILL_COLUMN_ID} from '../../../components/react_table/use-roadmap-pill-area'
import {useUserSettings} from '../../../components/user-settings'
import {parseTitleNumber} from '../../../helpers/parsing'
import {useRoadmapSettings} from '../../../hooks/use-roadmap-settings'
import {useRootElement} from '../../../hooks/use-root-element'
import {EmptyValue, withValue} from '../../../models/column-value'
import {useMouseState} from '../hooks/use-mouse-state'
import {RoadmapPillAreaFocusProvider} from '../hooks/use-roadmap-pill-area-focus'
import {RoadmapPillArea} from './roadmap-pill-area'
import {RoadmapNumberCell, RoadmapTimeSpanCells, RoadmapTitleCell} from './roadmap-table-cells'
import {RoadmapRow} from './roadmap-table-layout'

type RoadmapItemProps = {
  row: Row<TableDataType>
  itemData: ItemDataType
}

export const RoadmapItem = memo(function RoadmapItem({row, itemData}: RoadmapItemProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const {isVisible} = useIsVisible({ref})
  const [isDraggingPill, setIsDraggingPill] = useState(false)
  const {showDateFields} = useRoadmapSettings()
  const {dateFields} = useRoadmapSettings()

  const {mouseState, ...mouseProps} = useMouseState()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require movement before activating drag state
      activationConstraint: {
        distance: 2,
      },
    }),
  )
  const modifiers = [restrictToHorizontalAxis]

  const item = row.original
  const titleHtml = item.getHtmlTitle()

  const url = item.getUrl()
  const columnData = item.columns

  const titleValue = columnData[SystemColumnId.Title]
  const titleColumnValue = useMemo(() => (titleValue ? withValue(titleValue) : EmptyValue), [titleValue])
  const assignees = columnData[SystemColumnId.Assignees]
  const number = parseTitleNumber(titleValue)

  const rootElement = useRootElement()
  const {roadmapShowDateFields} = useUserSettings()

  itemData.prepareRow(row)

  const numberCell = row.cells.find(c => c.column.id === RowDragHandleColumnId)
  const titleCell = row.cells.find(c => c.column.columnModel?.id === SystemColumnId.Title)
  const startCell = showDateFields
    ? row.cells.find(c => dateFields[0] !== RoadmapDateFieldNone && c.column.columnModel?.id === dateFields[0]?.id)
    : undefined
  const endCell = showDateFields
    ? row.cells.find(c => dateFields[1] !== RoadmapDateFieldNone && c.column.columnModel?.id === dateFields[1]?.id)
    : undefined
  const pill = row.cells.find(c => c.column.id === ROADMAP_PILL_COLUMN_ID)

  const dndAccessibility = useMemo(
    () => ({
      container: rootElement,
      screenReaderInstructions: {
        draggable: roadmapShowDateFields.enabled
          ? 'To update the start and target dates, drag item or edit date fields'
          : 'To update the start and target dates, drag item or enable the user setting "Show date fields" in the views options menu to edit date fields',
      },
    }),
    [rootElement, roadmapShowDateFields.enabled],
  )

  const {setNodeRef, setActivatorNodeRef, listeners, isSorting, isDragging, isDropped} = useReorderableRow(row)

  const context = useMemo(
    () => ({
      rowNumber: row.index + 1,
      setSortActivatorNodeRef: setActivatorNodeRef,
      sortListeners: listeners,
    }),
    [row.index, setActivatorNodeRef, listeners],
  )
  useRefObjectAsForwardedRef(setNodeRef, ref)

  // Return early with an empty roadmap row placeholder if not within the viewport or if title cell has not loaded
  // Unlike in table view, we don't need to check `isDragging` because the `useReorderableRow` hook is still called
  // and that's all that's necessary for dnd-kit to provide the drop data.
  if (!isVisible || !titleCell || !pill || !numberCell) return <RoadmapRow aria-hidden="true" ref={ref} />

  return (
    <RoadmapRow
      ref={ref}
      row={row}
      {...testIdProps(rowTestId(row.index))}
      isDraggingPill={isDraggingPill}
      isHighlighted={isDragging || isDropped}
      {...(isSorting ? {} : mouseProps)}
    >
      <RowContext.Provider value={context}>
        <RoadmapNumberCell cell={numberCell} focusCellElement={itemData.focusCellElement} isDragging={isSorting} />
        <RoadmapTitleCell
          cell={titleCell}
          focusCellElement={itemData.focusCellElement}
          number={number}
          isLastCell={!showDateFields || (!startCell && !endCell)}
        />
        {showDateFields && (
          <RoadmapTimeSpanCells
            startCell={startCell}
            endCell={endCell}
            focusCellElement={itemData.focusCellElement}
            number={number}
          />
        )}
      </RowContext.Provider>
      <DndContext sensors={sensors} autoScroll={false} modifiers={modifiers} accessibility={dndAccessibility}>
        <RoadmapPillAreaFocusProvider cell={pill} rowRef={ref}>
          <RoadmapPillArea
            titleHtml={titleHtml}
            renderLink={item.contentType !== ItemType.RedactedItem}
            url={url}
            titleColumnValue={titleColumnValue}
            number={number}
            assignees={assignees}
            index={row.index}
            item={item}
            mouseState={mouseState}
            setIsDragging={setIsDraggingPill}
          />
        </RoadmapPillAreaFocusProvider>
      </DndContext>
    </RoadmapRow>
  )
})
