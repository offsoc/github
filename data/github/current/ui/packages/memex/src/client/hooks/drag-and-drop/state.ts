import isEqual from 'lodash-es/isEqual'

export type Point = {x: number; y: number}

/**
 * An axis upon which dragging can occur
 */
export type Axis = 'horizontal' | 'vertical'

/**
 * The state tracked by the drag and drop reducer
 *
 * NOTE: Currently we use deep-equal to safely avoid returning identical state,
 * so take that into consideration when adding new non-sclar properties.
 */
export type State = {
  /**
   * Whether a drag is in progress
   */
  isDragging: boolean

  /**
   * Whether a drag may soon begin, such as when the user presses a mouse
   * button, but has not yet moved the mouse
   */
  isAwaitingDrag: boolean

  /**
   * The ID of the element being dragged
   */
  dragID: string | null

  /**
   * The origin of the drop zone from which the dragged element originated
   */
  dragOrigin: string | null

  /**
   * The axis of the element being dragged, if constrained by user-provided
   * options
   */
  dragAxis: Axis | null

  /**
   * The offset within the dragged element in which the user pressed the mouse
   *
   * This helps keep the dragging element positioned stably relative to where
   * the user began dragging from.
   */
  dragOffset: Point | null

  /**
   * The type of element being dragged
   */
  dragType: string | null

  /**
   * The ID of the drop zone being dragged over
   */
  dropID: string | null

  /**
   * The type of drop zone being dragged over
   */
  dropType: string | null

  /**
   * The ID of the element around which we will drop
   */
  dropTarget: string | null

  /**
   * The side of the element at which we will drop
   */
  dropSide: 'before' | 'after' | null
}

/**
 * An action that can be used to update the hook's state
 */
export type Action = BeginAwaitingAction | BeginDrag | StopDrag | BeginAwaitingDrop | SetDropTarget | StopAwaitingDrop

/**
 * An action representing the user indicating where in a drop zone they may
 * drop
 */
type SetDropTarget =
  | {
      type: 'SET_DROP_TARGET'
      dragID: string
      side: 'before' | 'after'
    }
  | {
      type: 'SET_DROP_TARGET'
      dragID: null
      side: null
    }

/**
 * Create a `SetDropTarget` action.
 */
export function createSetDropTarget(_: null): SetDropTarget
export function createSetDropTarget(dragID: string, side: 'before' | 'after'): SetDropTarget
export function createSetDropTarget(dragID?: string | null, side?: 'before' | 'after'): SetDropTarget {
  if (dragID && side) {
    return {
      type: 'SET_DROP_TARGET',
      dragID,
      side,
    }
  } else {
    return {
      type: 'SET_DROP_TARGET',
      dragID: null,
      side: null,
    }
  }
}

/**
 * An action representing the user indicating they may begin a drag
 */
type BeginAwaitingAction = {
  type: 'BEGIN_AWAITING_DRAG'
  dragID: string
  dragAxis: Axis | null
  dragOffset: Point
  dragType: string
  dragOrigin: string | null
}

/**
 * Create a `BeginAwaitingDrag` action.
 */
export function createBeginAwaitingDrag(
  dragID: string,
  dragType: string,
  dragOffset: Point,
  dragOrigin?: string | null,
  dragAxis?: 'horizontal' | 'vertical',
): BeginAwaitingAction {
  return {
    type: 'BEGIN_AWAITING_DRAG',
    dragID,
    dragType,
    dragOffset,
    dragAxis: dragAxis ?? null,
    dragOrigin: dragOrigin ?? null,
  }
}

/**
 * An action representing the user beginning dragging
 */
type BeginDrag = {
  type: 'BEGIN_DRAG'
}

/**
 * Create a `BeginDrag` action.
 */
export function createBeginDrag(): BeginDrag {
  return {type: 'BEGIN_DRAG'}
}

/**
 * An action representing the user beginning dragging
 */
type StopDrag = {
  type: 'STOP_DRAG'
}

/**
 * Create a `StopDrag` action.
 */
export function createStopDrag(): StopDrag {
  return {type: 'STOP_DRAG'}
}

/**
 * An action representing the user may drop soon, such as when they are
 * dragging over a droppable area
 */
type BeginAwaitingDrop = {
  type: 'BEGIN_AWAITING_DROP'
  dropID: string
  dropType: string
}

/**
 * Create a `BeginAwaitingDrop` action.
 */
export function createBeginAwaitingDrop(dropID: string, dropType: string): BeginAwaitingDrop {
  return {
    type: 'BEGIN_AWAITING_DROP',
    dropID,
    dropType,
  }
}

/**
 * An action representing the user will not drop, such as when they leave a
 * droppable area
 */
type StopAwaitingDrop = {
  type: 'STOP_AWAITING_DROP'
}

/**
 * Create a `StopAwaitingDrop` action.
 */
export function createStopAwaitingDrop(): StopAwaitingDrop {
  return {
    type: 'STOP_AWAITING_DROP',
  }
}

/**
 * A "safe" state reducer, which only updates state with a new value if shallow
 * comparison with updated state fails.
 */
export function safeReducer(state: State, action: Action): State {
  const newState = reducer(state, action)
  if (isEqual(state, newState)) return state
  return newState
}

/**
 * A state reducer for the hook, which takes a state and action and returns
 * updated state.
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'BEGIN_AWAITING_DRAG': {
      return {
        ...state,
        isDragging: false,
        isAwaitingDrag: true,
        dragID: action.dragID,
        dragAxis: action.dragAxis,
        dragOffset: action.dragOffset,
        dragType: action.dragType,
        dragOrigin: action.dragOrigin,
      }
    }
    case 'BEGIN_DRAG': {
      return {...state, isDragging: true, isAwaitingDrag: false}
    }
    case 'STOP_DRAG': {
      return {
        ...state,
        isDragging: false,
        isAwaitingDrag: false,
        dragID: null,
        dragType: null,
        dropID: null,
        dropType: null,
      }
    }
    case 'BEGIN_AWAITING_DROP': {
      return {...state, dropID: action.dropID, dropType: action.dropType}
    }
    case 'STOP_AWAITING_DROP': {
      return {...state, dropID: null, dropType: null}
    }
    case 'SET_DROP_TARGET': {
      return {...state, dropTarget: action.dragID, dropSide: action.side}
    }
  }
}
