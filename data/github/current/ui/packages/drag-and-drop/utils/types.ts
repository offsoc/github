import type {KeyboardSensorOptions} from '@dnd-kit/core'

/**
 * Metadata that will be attached to the draggable element.
 */
export type DragDropMetadata<T> = {id: T}

export type keyboardAndSRSensorOption = Omit<KeyboardSensorOptions, 'onActivation'> & {
  onActivation?({event, returnFocusRef}: {event: KeyboardEvent; returnFocusRef: React.RefObject<HTMLElement>}): void
}

export interface OnDropArgs<T> {
  /**
   * Metadata of the dragged item
   */
  dragMetadata: DragDropMetadata<T>
  /**
   * Metadata of the item that was dropped on
   */
  dropMetadata: DragDropMetadata<T>
  /**
   * Is the dragged item before the drop target
   */
  isBefore: boolean
}

export type DragAndDropDirection = 'horizontal' | 'vertical'

export enum DragAndDropMoveOptions {
  BEFORE = 'Move item before',
  AFTER = 'Move item after',
  ROW = 'Move to row',
}

export type DragAndDropItem = {
  /**
   * Id of the drag and drop item being manipulated
   */
  id: string | number
  /**
   * Title of the drag and drop item being manipulated
   */
  title: string
}
