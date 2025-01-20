import {useCallback, useContext, useEffect, useRef} from 'react'

import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {
  DRAG_ID_ATTRIBUTE,
  DRAG_INDEX_ATTRIBUTE,
  DRAG_TRANSFORM_DISABLE,
  DRAG_TYPE_ATTRIBUTE,
  DROP_ID_ATTRIBUTE,
  DROP_TYPE_ATTRIBUTE,
} from './attributes'
import {DropIDContext, IsDraggingContext, StatelessContext} from './context'
import {
  type Action,
  type Axis,
  createBeginAwaitingDrag,
  createBeginAwaitingDrop,
  createSetDropTarget,
  createStopAwaitingDrop,
  type Point,
  type State,
} from './state'
import {cleanSashState, getClosestDraggableElementOfType, setSashState} from './transformation'

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

type IsDraggingContextValue = {isDragging: boolean; dragType: string | null}

type SyntheticHandler = React.MouseEventHandler<HTMLElement>

const MAIN_MOUSE_BUTTON = 0

/** Options for configuring a drag handle. */
type UseDragHandleWithIdsOpts = {
  dragID: string
  dragType: string
  dragRef: React.RefObject<HTMLElement | null>
  dragAxis?: Axis
  dragOrigin?: string
  disable?: boolean

  onDragStart?: () => void
  onDragEnd?: () => void
}

/**
 * Create a drag handle.
 *
 * Returns props that should be spread onto the handle component.
 */
function useDragHandleWithIds(opts: UseDragHandleWithIdsOpts) {
  const {dispatch, dragRef, eventHandlersRef} = useStatelessDragDrop()

  // When the user mousedowns on a drag handle, prepare for dragging by telling
  // the provider we are awaiting a possible drag event. Update the drag ref
  // with the possibly-dragged element and client rect. Also, update the drag
  // offset so that we can move the element relative to the original pointer
  // position within the element.
  const onMouseDown: SyntheticHandler = useCallback(
    e => {
      const eventTargetNodeName = (e.nativeEvent.target as HTMLElement | null)?.nodeName
      // We don't want to start a drag operation if an input element is the target of the
      // mousedown event
      if (
        e.nativeEvent.button !== MAIN_MOUSE_BUTTON ||
        eventTargetNodeName === 'INPUT' ||
        eventTargetNodeName === 'TEXTAREA' ||
        e.defaultPrevented
      ) {
        return
      }

      // If the active element is an input/textarea when we start to drag a card
      // we will not fire a blur event when we call e.preventDefault()
      // To limit the impact of this issue, we only want to call e.preventDefault()
      // if we're not blurring a input.
      const activeElementNodeName = document.activeElement?.nodeName
      if (activeElementNodeName !== 'INPUT' && activeElementNodeName !== 'TEXTAREA') {
        // This is necessary to prevent selection from appearing after the user
        // has dragged. This can happen even with user select disabled *while*
        // dragging. Without this we will not get a grabbing cursor in Safari or Firefox
        // while dragging.
        e.preventDefault()
      }

      if (opts.dragRef.current && opts.dragType === 'card') {
        const rect = opts.dragRef.current.getBoundingClientRect()
        const element = opts.dragRef.current
        const clone = element.cloneNode(true) as HTMLElement
        clone.style.position = 'fixed'
        clone.style.top = `${rect.top}px` // needed for column dragging
        clone.style.left = `${rect.left}px` // needed for column dragging
        clone.style.opacity = '0.5'
        clone.style.display = 'none'

        // TODO: Make the dragging z-index customizable?
        // One greater than AvatarStack's max z-index.
        // https://github.com/primer/components/blob/62f09251a9171257ca1af1fa64cbb63063ecaf55/src/AvatarStack.js#L131
        clone.style.zIndex = '11'

        // Set width and height to their original value to preserve the
        // element's shape.
        clone.style.width = `${rect.width}px`
        clone.style.height = `${rect.height}px`

        // Disable pointer events on the clone.
        clone.style.pointerEvents = 'none'

        requestAnimationFrame(() => {
          //Attaching to the same parent saves us from cloning the styles of the original element.
          const parentEl = opts.dragRef.current?.parentElement
          if (parentEl) parentEl.appendChild(clone)
        })

        dragRef.current = {
          element: clone,
          rect,
        }
      } else {
        dragRef.current = null
      }

      const dragOffset: Point = {
        x: e.clientX - (dragRef.current?.rect.left ?? 0),
        y: e.clientY - (dragRef.current?.rect.top ?? 0),
      }

      eventHandlersRef.current = {
        ...eventHandlersRef.current,
        onDragStart: opts.onDragStart ?? null,
        onDragEnd: opts.onDragEnd ?? null,
      }

      dispatch(createBeginAwaitingDrag(opts.dragID, opts.dragType, dragOffset, opts.dragOrigin, opts.dragAxis))
    },
    [
      dispatch,
      dragRef,
      eventHandlersRef,
      opts.dragAxis,
      opts.dragID,
      opts.dragOrigin,
      opts.dragRef,
      opts.dragType,
      opts.onDragEnd,
      opts.onDragStart,
    ],
  )

  return {
    props: opts.disable ? {} : {onMouseDown},
  }
}

/** Options for configuring a draggable component */
type UseDragWithIdsOpts<Metadata> = UseDragHandleWithIdsOpts & {
  dragIndex: number
  metadata: Metadata
}

/**
 * Create a draggable component.
 *
 * Returns both props to spread onto the drag handle (or the element itself)
 * and props to spread onto the draggable element.
 *
 * When a component is dragged, we use the dragged component's height and
 * margins to calculate transformations of other components, as well as the
 * size of our `<Placeholder />` component. Because margins collapse between
 * sibling components, it is recommended in a list of draggable components to
 * use, for example, a bottom margin on each, instead of y-margins that
 * collapse into one another.
 */
export function useDragWithIds<Metadata>(opts: UseDragWithIdsOpts<Metadata>) {
  const handle = useDragHandleWithIds(opts)
  const {metaMap} = useStatelessDragDrop()
  const {dragType, dragID, metadata} = opts

  useEffect(() => {
    setMetadata(metaMap, dragType, dragID, metadata)

    return () => {
      deleteMetadata(metaMap, dragType, dragID)
    }
  }, [dragID, dragType, metaMap, metadata])

  return {
    handle,
    props: {
      [DRAG_ID_ATTRIBUTE]: opts.dragID,
      [DRAG_TYPE_ATTRIBUTE]: opts.dragType,
      [DRAG_INDEX_ATTRIBUTE]: opts.dragIndex,
      [DRAG_TRANSFORM_DISABLE]: Boolean(opts.disable),
    },
  }
}

/** The onDrop callback */
export type OnDropWithIds<Metadata> = (payload: {
  state: State
  dragMetadata: Metadata
  dropMetadata: Metadata | null
  side: 'before' | 'after' | null
}) => void

/** Options for configuring a drop zone */
type UseDropWithIdsOpts<Metadata> = {
  dropID: string
  dropType: string
  dropRef: React.RefObject<HTMLElement | null>
  onDrop?: OnDropWithIds<Metadata>
  onDragOver?: () => void
  disableSash?: boolean
}

/**
 * Create a drop zone.
 *
 * Returns props that should be spread on the drop zone component.
 */
export function useDropWithIds<Metadata>(opts: UseDropWithIdsOpts<Metadata>) {
  const {stateRef, dispatch, dragRef, dropMap, metaMap} = useStatelessDragDrop()

  // In order to prevent copious re-renders, instead of relying on the `state`
  // that gets updated by our reducer, we instead look at that state value in a
  // ref. This is safe, because our event handlers in this hook do not have the
  // state ref value itself as a dependency. When the handlers run, they're able
  // to get the current up-to-date state value from the ref's current value.

  // Last known position is used to get a drop point on scroll events, since
  // they do not have pointer position info.
  const lastKnownPosition = useRef<Point | null>(null)

  // Update the provider's drop map so that this drop zone's draggable elements
  // can have their transforms reset when appropriate.
  useEffect(() => {
    dropMap.set(opts.dropID, [opts.dropType, opts.dropRef])

    return () => {
      dropMap.delete(opts.dropID)
    }
  }, [dropMap, opts.dropID, opts.dropRef, opts.dropType])

  const {onDragOver, disableSash} = opts

  // When the mouse moves, update the last known mouse position, and begin
  // awaiting drop if we're newly-hovered over this drop zone, and apply drop
  // transformations if appropriate. We also set the drop target to the closest
  // draggable element in this drop zone.
  const onMouseMove: SyntheticHandler = useCallback(
    e => {
      const {dragType, dragAxis, dropID} = stateRef.current

      // NOTE: The `opts.dropType === stateRef.current.dropType` condition needed to be added, in order for this
      // to compatible with the new `dnd-kit` drag and drop implementation. Otherwise, this was clearing the sash state
      // when it shouldn't have, because this code couldn't detect the drags occuring in dnd-kit. Now, this code only
      // runs if it is a drag/drop occurring from this implementation.
      if (!dropID && opts.dropType === stateRef.current.dropType) {
        requestAnimationFrame(() => {
          cleanSashState()
        })
      }

      const point = {x: e.clientX, y: e.clientY}

      lastKnownPosition.current = point

      if (dragType === opts.dropType) {
        if (dropID !== opts.dropID) {
          dispatch(createBeginAwaitingDrop(opts.dropID, opts.dropType))
        }

        if (onDragOver) onDragOver()

        const result = getClosestDraggableElementOfType({
          dropZone: e.currentTarget,
          point,
          dropType: opts.dropType,
          dragAxis,
        })

        if (!result) {
          dispatch(createSetDropTarget(null))
          return
        }

        const dropTargetID = not_typesafe_nonNullAssertion(result[0].getAttribute(DRAG_ID_ATTRIBUTE))
        dispatch(createSetDropTarget(dropTargetID, result[1]))

        if (!disableSash) {
          setSashState(result[0], result[1], opts.dropType)
        }

        if (dragRef.current) {
          dragRef.current.element.style.display = 'block'
        }
      }
    },
    [stateRef, opts.dropType, opts.dropID, onDragOver, dispatch, disableSash, dragRef],
  )
  // When the mouse pointer releases, notify the drop zone by calling the
  // provided `onDrop` callback with all appropriate metadata.
  const {onDrop} = opts
  const onMouseUp: SyntheticHandler = useCallback(() => {
    const state = stateRef.current

    const isAwaitingDropHere =
      state.isDragging &&
      state.dropID === opts.dropID &&
      state.dropType === opts.dropType &&
      state.dragType === opts.dropType

    if (isAwaitingDropHere && onDrop) {
      const dragMetadata = getMetadata<Metadata>(
        metaMap,
        not_typesafe_nonNullAssertion(state.dragType),
        not_typesafe_nonNullAssertion(state.dragID),
      )
      if (!dragMetadata) throw new Error(`No metadata found for ${state.dragType} ${state.dragID}`)
      const dropMetadata =
        getMetadata<Metadata>(
          metaMap,
          not_typesafe_nonNullAssertion(state.dropType),
          not_typesafe_nonNullAssertion(state.dropTarget),
        ) ?? null

      onDrop({state, dragMetadata, dropMetadata, side: state.dropSide})
    }
  }, [metaMap, onDrop, opts.dropID, opts.dropType, stateRef])

  // When a scroll occurs, begin awaiting drop if we're newly-in this drop zone,
  // and apply drop transformations if appropriate.
  const onScroll: React.UIEventHandler<HTMLElement> = useCallback(
    e => {
      const point = lastKnownPosition.current

      if (!point) {
        return
      }

      const {dragType, dragAxis, dropID} = stateRef.current

      if (dragType === opts.dropType) {
        // TODO: Can this actually happen? This would mean a scroll with no
        // prior mousemove.
        if (dropID !== opts.dropID) {
          dispatch(createBeginAwaitingDrop(opts.dropID, opts.dropType))
        }

        const result = getClosestDraggableElementOfType({
          dropZone: e.currentTarget,
          point,
          dropType: opts.dropType,
          dragAxis,
        })

        if (!result || disableSash) return

        setSashState(result[0], result[1], opts.dropType)
      }
    },
    [disableSash, dispatch, opts.dropID, opts.dropType, stateRef],
  )

  // When the mouse leaves, tell the provider this zone is no longer awaiting a
  // drop, and reset its elements' transformations.
  const onMouseLeave: SyntheticHandler = useCallback(() => {
    const {dropID} = stateRef.current

    if (dropID === opts.dropID) {
      lastKnownPosition.current = null
      dispatch(createStopAwaitingDrop())
    }
  }, [dispatch, opts.dropID, stateRef])

  return {
    props: {
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onScroll,
      [DROP_ID_ATTRIBUTE]: opts.dropID,
      [DROP_TYPE_ATTRIBUTE]: opts.dropType,
    },
  }
}

/**
 * Get a boolean stating whether the user is currently dragging an element.
 */
export function useIsDraggingWithIds(): IsDraggingContextValue {
  const value = useContext(IsDraggingContext)

  if (value == null) {
    throw new Error(`useIsDragging must be used within a DragDropContext`)
  }

  return value
}

/**
 * Get the ID of the current drop zone.
 */
export function useDropID(): string | null {
  const value = useContext(DropIDContext)
  return value
}

/**
 * Get the full drag and drop context value without the state.
 *
 * This allows for efficient inspection of state using the state ref in event
 * handlers.
 */
function useStatelessDragDrop(): Omit<ContextValue, 'state'> {
  const value = useContext(StatelessContext)

  if (value == null) {
    throw new Error(`useStatelessDragDrop must be used within a DragDropContext`)
  }

  return value
}

/**
 * Set metadata for a given draggable of a type and ID.
 *
 * @param map The meta map to set a value in
 * @param dragType The drag type to set a value in
 * @param dragID The ID to set the metadata for
 * @param metadata The metadata
 */
function setMetadata<Metadata>(map: MetaMap, dragType: string, dragID: string, metadata: Metadata) {
  const submap = map.get(dragType)

  if (submap) {
    submap.set(dragID, metadata)
  } else {
    map.set(dragType, new Map([[dragID, metadata]]))
  }
}

/**
 * Get metadata for a given draggable of a type and ID.
 *
 * @param map The meta map to set a value in
 * @param dragType The drag type to set a value in
 * @param dragID The ID to set the metadata for
 */
function getMetadata<Metadata>(map: MetaMap, dragType: string, dragID: string): Metadata | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return map.get(dragType)?.get(dragID) ?? null
}

/**
 * Delete metadata for a given draggable of a type and ID.
 *
 * @param map The meta map to set a value in
 * @param dragType The drag type to set a value in
 * @param dragID The ID to set the metadata for
 */
function deleteMetadata(map: MetaMap, dragType: string, dragID: string) {
  const submap = map.get(dragType)
  if (!submap) return
  submap.delete(dragID)
  if (submap.size === 0) map.delete(dragType)
}
