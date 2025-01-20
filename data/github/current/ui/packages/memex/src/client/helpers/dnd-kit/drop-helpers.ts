import type {Active, DragMoveEvent, Over} from '@github-ui/drag-and-drop'

export const DropSide = {
  BEFORE: 'before',
  AFTER: 'after',
} as const

type ObjectValues<T extends object> = T[keyof T]

export type DropSide = ObjectValues<typeof DropSide>

export const getVerticalDropSide = (active: Active | null, over: Over | null): DropSide | null => {
  const activeTop = active?.rect?.current?.translated?.top
  const overTop = over?.rect.top

  if (typeof activeTop !== 'number' || typeof overTop !== 'number') {
    return null
  }

  return activeTop <= overTop ? DropSide.BEFORE : DropSide.AFTER
}

/**
 * Gets the current mouse position from a dnd-kit drag move event. If the event
 * does not have any pointer information (e.g., activated by keyboard), then this
 * will return null.
 */
function getMousePosition(event: DragMoveEvent) {
  if (!(event.activatorEvent instanceof PointerEvent || event.activatorEvent instanceof MouseEvent)) return null

  const initialDraggedRectangle = event.active.rect.current?.initial
  const translatedDraggedRectangle = event.active.rect.current?.translated
  if (!initialDraggedRectangle) return null
  if (!translatedDraggedRectangle) return null

  // Compute the initial cursor offset within the dragged rectangle which
  // does not change as the dragged rectangle is translated
  const initialCursorOffset = {
    x: event.activatorEvent.clientX - initialDraggedRectangle.left,
    y: event.activatorEvent.clientY - initialDraggedRectangle.top,
  }

  // Mouse position should be the current translated position of the dragged
  // rectangle, plus the initial cursor offset (where it was picked up)
  const point = {
    x: translatedDraggedRectangle.left + initialCursorOffset.x,
    y: translatedDraggedRectangle.top + initialCursorOffset.y,
  }

  return point
}

/**
 * Given a drag move event, this function determines the side the draggable
 * element is closer to.
 */
export function getDropSideFromEvent(event: DragMoveEvent): DropSide {
  const closestRect = event.over?.rect
  if (!closestRect) return DropSide.BEFORE

  if (event.activatorEvent instanceof KeyboardEvent) {
    return event.active.rect.current?.translated?.top === closestRect.top ? DropSide.BEFORE : DropSide.AFTER
  } else {
    const point = getMousePosition(event)
    if (!point) return DropSide.BEFORE

    const verticalCenter = closestRect.top + closestRect.height / 2
    const side = point.y > verticalCenter ? DropSide.AFTER : DropSide.BEFORE

    return side
  }
}
