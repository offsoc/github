import type {DragEndEvent, DragMoveEvent, DragStartEvent} from '@github-ui/drag-and-drop'
import {useSortable} from '@github-ui/drag-and-drop'
import {useCallback, useEffect, useMemo, useRef} from 'react'
import type {
  ActionType,
  ColumnInstance,
  HeaderGroup,
  Meta,
  ReducerTableState,
  TableHeaderProps,
  TableOptions,
  TableState,
  UseTableHooks,
} from 'react-table'

import {shallowEqual} from '../../helpers/util'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import useBodyClass from '../../hooks/use-body-class'
import {useViews} from '../../hooks/use-views'
import {useVisibleFields} from '../../hooks/use-visible-fields'
import {isDragDropColumn} from './column-ids'
import {useTableDispatch} from './table-provider'

// The half of a column header the user is dragging over.
type Side = 'left' | 'right'

// Actions and action producers

const ActionTypes = {
  SET_DRAGGING_COLUMN: 'useColumnReordering.SET_DRAGGING_COLUMN',
  SET_DRAG_TARGET: 'useColumnReordering.SET_DRAG_TARGET',
  RESET: 'useColumnReordering.RESET',
} as const
type ActionTypes = ObjectValues<typeof ActionTypes>

type Action<D extends object> = ResetAction | SetDraggingColumnAction | SetDragColumnTargetAction<D>

type ResetAction = {
  type: typeof ActionTypes.RESET
}

function reset(): ResetAction {
  return {
    type: ActionTypes.RESET,
  }
}

type SetDraggingColumnAction = {
  type: typeof ActionTypes.SET_DRAGGING_COLUMN
  columnId: string | null
}

function setDraggingColumn(columnId: SetDraggingColumnAction['columnId']): SetDraggingColumnAction {
  return {
    type: ActionTypes.SET_DRAGGING_COLUMN,
    columnId,
  }
}

type SetDragColumnTargetAction<D extends object> = {
  type: typeof ActionTypes.SET_DRAG_TARGET
  overColumn: {column: ColumnInstance<D>; side: Side} | null
}

function setDragColumnTarget<D extends object>(column: null): SetDragColumnTargetAction<D>
function setDragColumnTarget<D extends object>(column: ColumnInstance<D>, side: Side): SetDragColumnTargetAction<D>
function setDragColumnTarget<D extends object>(
  column: ColumnInstance<D> | null,
  side?: Side,
): SetDragColumnTargetAction<D> {
  if (!column || !side) {
    return {
      type: ActionTypes.SET_DRAG_TARGET,
      overColumn: null,
    }
  }

  return {
    type: ActionTypes.SET_DRAG_TARGET,
    overColumn: {column, side},
  }
}

export type UseColumnReorderingTableState<D extends object> = {
  /**
   * The ID of the column currently being dragged for reordering.
   */
  draggingColumnId: string | null

  /**
   * The column being dragged over, and on which side.
   */
  overColumn?: {column: ColumnInstance<D>; side: Side} | null
}

export type UseColumnReorderingColumnOptions<_D extends object> = {
  /**
   * Whether this column can be dragged by the user to reorder it.
   */
  canReorder?: boolean

  /**
   * Whether this column can be shifted to the right by the user
   * reordering another column over it.
   *
   * This only applies when this column is being dragged over and does
   * not prevent the column being shifted by other means.
   */
  canBeShifted?: boolean
}

type DragMetadata<D extends object> = {
  column: HeaderGroup<any>
  columnOrder: Array<string>
  overColumn?: {column: ColumnInstance<D>; side: Side} | null
}

export function useColumnReorderingDragHandlers<D extends object>() {
  const {moveField, visibleFields} = useVisibleFields()
  const {currentView} = useViews()
  const dispatch = useTableDispatch()

  // There appears to be a race condition where a drag move event is
  // is occasionally triggered after a drag end event.
  // This ref is used to ensure a move does cause a dispatch
  // after the drag has ended.
  const isDraggingRef = useRef(false)

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      const {column} = e.active.data.current as DragMetadata<D>

      isDraggingRef.current = true
      dispatch(setDraggingColumn(column.id))
    },
    [dispatch],
  )

  const pointerXRef = useRef<number>(0)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => (pointerXRef.current = e.clientX)
    document.addEventListener('mousemove', onMouseMove)
    return () => document.removeEventListener('mousemove', onMouseMove)
  })

  const onDragMove = useCallback(
    (e: DragMoveEvent) => {
      if (!e.over || !isDraggingRef.current) {
        dispatch(reset())
        return
      }

      const {column: overColumn} = e.over.data.current as DragMetadata<D>
      const side = getTargetSide(e, overColumn, pointerXRef.current)
      dispatch(setDragColumnTarget(overColumn, side))
    },
    [dispatch],
  )

  const onDragCancel = useCallback(() => {
    isDraggingRef.current = false
    dispatch(reset())
  }, [dispatch])

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      isDraggingRef.current = false

      const {columnOrder, column: draggingColumn, overColumn} = e.active.data.current as DragMetadata<D>

      if (!currentView || !overColumn || draggingColumn.id === overColumn.column.id) {
        dispatch(reset())
        return
      }

      const side = getTargetSide(e, overColumn.column, pointerXRef.current)

      const movingColumnIndex = columnOrder.indexOf(draggingColumn.id)
      const overColumnIndex = columnOrder.indexOf(overColumn.column.id)

      let newPosition: number
      if (side === 'left') {
        newPosition = movingColumnIndex < overColumnIndex ? overColumnIndex - 1 : overColumnIndex
      } else {
        newPosition = movingColumnIndex < overColumnIndex ? overColumnIndex : overColumnIndex + 1
      }

      dispatch(reset())
      const field = visibleFields.find(f => `${f.id}` === draggingColumn.id)

      if (!field) {
        throw new Error('No field found for dragging column')
      }

      // Column position is zero-indexed.
      moveField(currentView.number, field, newPosition - 1)
    },
    [currentView, dispatch, moveField, visibleFields],
  )

  return {
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
  }
}

/**
 * Allow columns to be reordered by dragging and dropping them.
 */
export function useColumnReordering<D extends object>(hooks: UseTableHooks<D>) {
  const {visibleFields} = useVisibleFields()
  const columnOrder = useMemo(() => visibleFields.map(column => column.id.toString()), [visibleFields])

  hooks.useOptions.push(useOptions(columnOrder))
  hooks.getHeaderProps.push(useGetHeaderProps)
  hooks.stateReducers.push(reducer)
}

function useOptions<D extends object>(columnOrder: Array<string>): (opts: TableOptions<D>) => TableOptions<D> {
  return (opts: TableOptions<D>) => ({...opts, initialState: {...opts.initialState, columnOrder}})
}

/**
 * Attach handlers to header props to update dragging state based on user mouse
 * events.xx
 */
function useGetHeaderProps<D extends object>(
  props: Partial<TableHeaderProps>,
  meta: Meta<D, {column: HeaderGroup<D>}>,
) {
  const {hasWritePermissions} = ViewerPrivileges()
  const disabled = !hasWritePermissions || meta.column.canReorder === false
  const dragMetadata: DragMetadata<D> = {
    column: meta.column,
    columnOrder: meta.instance.state.columnOrder,
    overColumn: meta.instance.state.overColumn,
  }
  const dragProps = useSortable({disabled, id: meta.column.id, data: dragMetadata})
  useBodyClass('is-dragging', dragProps.isDragging)

  return [props, {dragProps}]
}

/**
 * Update table state when receiving an action defined by this plugin.
 */
function reducer<D extends object>(state: TableState<D>, action: ActionType): ReducerTableState<D> {
  if (!isPluginAction<D>(action)) {
    return state
  }

  // We do shallow state comparisons in each branch here in order to prevent
  // unnecessary state updates.
  switch (action.type) {
    case ActionTypes.RESET: {
      const newState: ReducerTableState<D> = {...state, draggingColumnId: null, overColumn: null}

      if (shallowEqual(state, newState)) {
        return state
      }

      return newState
    }
    case ActionTypes.SET_DRAGGING_COLUMN: {
      const newState: ReducerTableState<D> = {...state, draggingColumnId: action.columnId}

      if (shallowEqual(state, newState)) {
        return state
      }

      return newState
    }
    case ActionTypes.SET_DRAG_TARGET: {
      const newState: ReducerTableState<D> = {...state, overColumn: action.overColumn}

      if (shallowEqual(state.overColumn ?? {}, newState.overColumn ?? {})) {
        return state
      }

      return newState
    }
  }
}

/**
 * @param pointerX Current x-position of the mouse. This can't be obtained from the dnd-kit event because the
 * `activatorEvent.clientX` is always the _start_ of the drag. And `activatorEvent.clientX + e.delta.x` has error that
 * increases over the length of the drag.
 */
function getTargetSide<D extends object>(
  e: DragMoveEvent | DragEndEvent,
  column: ColumnInstance<D>,
  pointerX: number,
): Side {
  if (column.canBeShifted === false) {
    // we have two columns that are considered special related to column
    // reordering:
    //
    // - row-drag-handle - first column - no column can go before it
    // - add-column - last column - no column can go after it
    //
    // check which column we have here and ensure this is locked to the
    // situation we support
    return isDragDropColumn(column) ? 'right' : 'left'
  } else {
    const clientRect = e.over?.rect
    if (!clientRect || !(e.activatorEvent instanceof PointerEvent)) return 'right'

    const centerX = clientRect.left + clientRect.width / 2

    if (pointerX > centerX) {
      return 'right'
    } else {
      return 'left'
    }
  }
}

const actionTypeValues: Array<string> = Object.values(ActionTypes)

function isPluginAction<D extends object>(action: ActionType): action is Action<D> {
  return actionTypeValues.includes(action.type)
}
