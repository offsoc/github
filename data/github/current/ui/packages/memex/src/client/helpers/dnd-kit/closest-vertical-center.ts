import type {CollisionDescriptor, CollisionDetection} from '@github-ui/drag-and-drop'

/**
 * Works like `closestCenter` but along the vertical axis only. This is important for roadmap, where widths are
 * infinite and the horizontal axis is not meaningful.
 */
export const closestVerticalCenter: CollisionDetection = ({collisionRect, droppableRects, droppableContainers}) => {
  const collisionRectCenter = (collisionRect.top + collisionRect.bottom) / 2

  const collisions: Array<CollisionDescriptor> = []

  for (const droppableContainer of droppableContainers) {
    const {id} = droppableContainer
    const rect = droppableRects.get(id)

    if (rect) {
      const droppableRectCenter = (rect.top + rect.bottom) / 2
      const distBetween = Math.abs(collisionRectCenter - droppableRectCenter)

      collisions.push({id, data: {droppableContainer, value: distBetween}})
    }
  }

  return collisions.sort((a, b) => a.data.value - b.data.value)
}
