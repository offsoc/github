import {createContext, useCallback, useEffect, useMemo, useReducer, useRef} from 'react'

import useBodyClass from '../use-body-class'
import {type Action, createBeginDrag, createStopDrag, safeReducer, type State} from './state'
import {cleanSashState} from './transformation'

/** A map of drop IDs to their types and refs. */
type DropMap = Map<string, [dropType: string, dropRef: React.RefObject<HTMLElement | null>]>

/** A map of drag types to maps of drag IDs to metadata */
type MetaMap = Map<string, Map<string, any>>

/** An object describing pertinent properties of the dragging element. */
type DragDescriptor = {
  element: HTMLElement
  rect: DOMRect
}

/** The value of our main context. */
type ContextValue = {
  state: State
  stateRef: React.MutableRefObject<State>
  dispatch: React.Dispatch<Action>
  dragRef: React.MutableRefObject<DragDescriptor | null>
  dropMap: DropMap
  metaMap: MetaMap
  eventHandlersRef: React.MutableRefObject<{
    /**
     * A function to call when dragging begins on the given component
     */
    onDragStart: (() => void) | null

    /**
     * A function to call when dragging ends on the given component
     */
    onDragEnd: (() => void) | null
  }>
}

type StatelessContextValue = Omit<ContextValue, 'state'>
type IsDraggingContextValue = {isDragging: boolean; dragType: string | null}

type NativeHandler = (event: MouseEvent) => void

const Context = createContext<ContextValue | null>(null)
export const StatelessContext = createContext<StatelessContextValue | null>(null)
export const IsDraggingContext = createContext<IsDraggingContextValue | null>({
  isDragging: false,
  dragType: null,
})
export const DropIDContext = createContext<string | null>(null)

const MAIN_MOUSE_BUTTON = 0

/**
 * Create a context within which drag and drop of an arbitrary number of
 * component types can be performed.
 */
export function DragDropWithIdsContext(props: React.PropsWithChildren<unknown>) {
  const [state, dispatch] = useReducer(safeReducer as React.Reducer<State, Action>, {
    isDragging: false,
    isAwaitingDrag: false,

    dragID: null,
    dragAxis: null,
    dragOffset: null,
    dragType: null,
    dragOrigin: null,

    dropID: null,
    dropType: null,
    dropTarget: null,
    dropSide: null,
  })

  // A ref that keeps track of user-provided event handlers.
  const eventHandlersRef = useRef<ContextValue['eventHandlersRef']['current']>({
    onDragStart: null,
    onDragEnd: null,
  })

  // Because most of our state inspection happens in event handlers, we rarely
  // need to actually listen for state changes in our useDrag/useDrop hooks.
  // Instead, we inspect the current state ref in the handlers in those hooks,
  // and the result is no re-renders while dragging.
  const stateRef = useRef<State>(state)

  // A map of all known droppable areas used to reset any transforms globally
  // when the user drops or stops dragging.
  const dropMap = useMemo<DropMap>(() => new Map(), [])

  // A map which tracks metadata for all draggable elements
  const metaMap = useMemo<MetaMap>(() => new Map(), [])

  // A reference to the currently dragged element and its calculated client
  // rect. This rect will not be accurate if the element re-renders while being
  // dragged.
  const dragRef = useRef<DragDescriptor | null>(null)

  const {onDragStart, onDragEnd} = eventHandlersRef.current

  // React.Dispatch a state update, and remove the dragging (cloned) element.
  const stopDrag = useCallback(() => {
    dispatch(createStopDrag())

    if (onDragEnd) onDragEnd()

    const dragEl = dragRef.current?.element
    if (dragEl) dragEl.remove()

    requestAnimationFrame(() => {
      cleanSashState()
    })
  }, [onDragEnd])

  // When the mouse moves while awaiting drag, dispatch an event to say that we
  // are now dragging.
  const onWinMouseMoveAwaiting: NativeHandler = useCallback(() => {
    dispatch(createBeginDrag())
    if (onDragStart) onDragStart()
    // Prevents multiple BEGIN_DRAG dispatches
    removeEventListener('mousemove', onWinMouseMoveAwaiting)
  }, [onDragStart])

  // When the mouse moves while dragging, update the position of the dragging
  // element.
  const onWinMouseMoveDragging: NativeHandler = useCallback(
    e => {
      const drag = dragRef.current
      if (!drag) return

      requestAnimationFrame(() => {
        if (!state.dragAxis || state.dragAxis === 'vertical') {
          drag.element.style.top = `${e.clientY - (state.dragOffset?.y ?? 0)}px`
        }

        if (!state.dragAxis || state.dragAxis === 'horizontal') {
          drag.element.style.left = `${e.clientX - (state.dragOffset?.x ?? 0)}px`
        }
      })
    },
    [state.dragAxis, state.dragOffset?.x, state.dragOffset?.y],
  )

  // When the primary mouse button is released while dragging, halt dragging.
  const onWinMouseUpDragging: NativeHandler = useCallback(
    e => {
      if (e.button !== MAIN_MOUSE_BUTTON) return
      stopDrag()
    },
    [stopDrag],
  )

  // Disable user selection on the document while dragging.
  useBodyClass('is-dragging', state.isDragging)

  // Update the state ref whenever state changes.
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // If we are awaiting drag, set up handlers so that we can stop dragging or
  // begin dragging. Otherwise, tear down the handlers.
  useEffect(() => {
    if (state.isAwaitingDrag) {
      addEventListener('mousemove', onWinMouseMoveAwaiting)
      addEventListener('mouseup', stopDrag)
    } else {
      removeEventListener('mousemove', onWinMouseMoveAwaiting)
      removeEventListener('mouseup', stopDrag)
    }

    return () => {
      removeEventListener('mousemove', onWinMouseMoveAwaiting)
      removeEventListener('mouseup', stopDrag)
    }
  }, [onWinMouseMoveAwaiting, stopDrag, state.isAwaitingDrag])

  // If we are dragging, set up handlers so that we can update the dragging
  // element position, or stop dragging. Otherwise, tear down the handlers.
  useEffect(() => {
    if (state.isDragging) {
      addEventListener('mousedown', stopDrag)
      addEventListener('mousemove', onWinMouseMoveDragging)
      addEventListener('mouseup', onWinMouseUpDragging)
    }

    return () => {
      removeEventListener('mousedown', stopDrag)
      removeEventListener('mousemove', onWinMouseMoveDragging)
      removeEventListener('mouseup', onWinMouseUpDragging)
    }
  }, [stopDrag, onWinMouseMoveDragging, onWinMouseUpDragging, state.isDragging])

  const contextValue: ContextValue = useMemo(
    () => ({
      state,
      stateRef,
      dispatch,
      dragRef,
      dropMap,
      metaMap,
      eventHandlersRef,
    }),
    [dropMap, metaMap, state],
  )

  const statelessContextValue: Omit<ContextValue, 'state'> = useMemo(
    () => ({
      stateRef,
      dispatch,
      dragRef,
      dropMap,
      metaMap,
      eventHandlersRef,
    }),
    [dropMap, metaMap],
  )

  const isDraggingContextValue: IsDraggingContextValue = useMemo(
    () => ({isDragging: state.isDragging, dragType: state.isDragging ? state.dragType : null}),
    [state.dragType, state.isDragging],
  )

  return (
    <Context.Provider value={contextValue}>
      <StatelessContext.Provider value={statelessContextValue}>
        <IsDraggingContext.Provider value={isDraggingContextValue}>
          <DropIDContext.Provider value={state.dropID}>{props.children}</DropIDContext.Provider>
        </IsDraggingContext.Provider>
      </StatelessContext.Provider>
    </Context.Provider>
  )
}
