import {
  type Activators,
  type CollisionDescriptor,
  type CollisionDetection,
  KeyboardCode,
  type KeyboardCodes,
  KeyboardSensor,
  type KeyboardSensorOptions,
} from '@dnd-kit/core'
import {restrictToFirstScrollableAncestor, restrictToVerticalAxis} from '@dnd-kit/modifiers'

export const defaultKeyboardCodes: KeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter],
}

export const modifiers = [restrictToVerticalAxis, restrictToFirstScrollableAncestor]

export class CustomKeyboardSensor extends KeyboardSensor {
  static override activators: Activators<KeyboardSensorOptions> = [
    {
      eventName: 'onKeyDown' as const,
      handler: (event: React.KeyboardEvent, {keyboardCodes = defaultKeyboardCodes, onActivation}, {active}) => {
        const {code} = event.nativeEvent

        if (keyboardCodes.start.includes(code)) {
          const activator = active.activatorNode.current

          if (activator && event.target !== activator) {
            return false
          }
          event.preventDefault()

          onActivation?.({event: event.nativeEvent})

          return true
        }

        return false
      },
    },
    {
      eventName: 'onClick' as const,
      handler: (event: React.MouseEvent, {onActivation}) => {
        event.preventDefault()
        const keyboardEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
        })
        onActivation?.({event: keyboardEvent})

        return true
      },
    },
  ]
}

/**
 * Works like `closestCenter` but along the vertical axis only. This is important for roadmap, where widths are
 * infinite and the horizontal axis is not meaningful.
 */
export const closestVerticalCenter: CollisionDetection = ({collisionRect, droppableRects, droppableContainers}) => {
  const collisionRectCenter = (collisionRect.top + collisionRect.bottom) / 2

  const collisions: CollisionDescriptor[] = []

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
