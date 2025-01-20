import {DRAG_TYPE_ATTRIBUTE} from './attributes'
import type {Axis, Point} from './state'

export type RelativePosition = 'before' | 'after'

/**
 * List of sash classes for a given dropType and relative position.
 */
export function sashClasses(side: RelativePosition, dropType: string, isFixed = false): Array<string> {
  return [...(isFixed ? ['fixed-sash'] : []), 'show-sash', `show-sash-${side}`, `show-sash-${dropType}`]
}

/**
 * Set sash state.
 */
export function setSashState(target: HTMLElement, side: RelativePosition, dropType: string) {
  requestAnimationFrame(() => {
    cleanSashState()
    if (target && side) {
      target.classList.add(...sashClasses(side, dropType))
    }
  })
}

/**
 * Clean sash state.
 */
export function cleanSashState() {
  for (const el of document.querySelectorAll('.show-sash:not(.fixed-sash)')) {
    el.classList.remove(
      'show-sash',
      'show-sash-after',
      'show-sash-before',
      'show-sash-card',
      'show-sash-column',
      'show-sash-view',
    )
  }
}

/**
 * A query that searches for the closest draggable element to a given point.
 */
type DraggableElementSearch = {
  /** The container in which to search */
  dropZone: HTMLElement

  /** The point from which to begin searching  */
  point: Point

  /** The drop type of the element we're searching in */
  dropType: string

  /** The axis along which the drop zone is laid out */
  dragAxis: Axis | null
}

/** Lookup result from querying for a nearby draggable element */
type ElementResult = [HTMLElement, RelativePosition]

/**
 * Search for the closest draggable element in a drop zone.
 *
 * @param query The search query
 */
export function getClosestDraggableElementOfType(query: DraggableElementSearch): ElementResult | null {
  const rect = query.dropZone.getBoundingClientRect()
  return getClosestDraggableElementOfTypeRecursive(query, rect)
}

function getClosestDraggableElementOfTypeRecursive(
  query: DraggableElementSearch,
  dropZoneRect: DOMRect,
  searchIncrement = 10,
  searchOffset = 0,
): ElementResult | null {
  const {point, dropType, dragAxis} = query

  const offsetPoint =
    dragAxis === 'horizontal' ? {...point, x: point.x + searchOffset} : {...point, y: point.y + searchOffset}

  const withinDropzone = rectContainsPoint(dropZoneRect, offsetPoint)

  if (!withinDropzone && searchIncrement < 0) {
    return null
  } else if (!withinDropzone) {
    return getClosestDraggableElementOfTypeRecursive(query, dropZoneRect, -searchIncrement, 0)
  }

  let overElement: Element | null

  // TODO: We use `elementFromPoint` here, but I am curious if instead we should
  // do `elementsFromPoint` and search all of them. This may help on touch
  // devices where apparent bugs prevent `pointer-events: none;` from working
  // correctly. We may also want to explicitly exclude the dragging element.

  if (dragAxis === 'horizontal') {
    const centerYPoint = dropZoneRect.top + dropZoneRect.height / 2
    overElement = document.elementFromPoint(offsetPoint.x, centerYPoint)
  } else {
    const centerXPoint = dropZoneRect.left + dropZoneRect.width / 2
    overElement = document.elementFromPoint(centerXPoint, offsetPoint.y)
  }

  const closest = overElement?.closest<HTMLElement>(`[${DRAG_TYPE_ATTRIBUTE}=${dropType}]`) ?? null

  if (!closest) {
    return getClosestDraggableElementOfTypeRecursive(
      query,
      dropZoneRect,
      searchIncrement,
      searchOffset + searchIncrement,
    )
  }

  const closestRect = closest.getBoundingClientRect()

  const side =
    (dragAxis === 'horizontal' && point.x > closestRect.left + closestRect.width / 2) ||
    (dragAxis !== 'horizontal' && point.y > closestRect.top + closestRect.height / 2)
      ? 'after'
      : 'before'

  return [closest, side]
}

function rectContainsPoint(rect: DOMRect, point: Point): boolean {
  return rect.top < point.y && rect.right > point.x && rect.bottom > point.y && rect.left < point.x
}
