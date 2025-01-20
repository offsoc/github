import {useSortable} from '@dnd-kit/sortable'
import {testIdProps} from '@github-ui/test-id-props'
import {usePrefersReducedMotion} from '@github-ui/use-prefers-reduced-motion'
import {clsx} from 'clsx'
import {type CSSProperties, type FC, type HTMLAttributes, useMemo} from 'react'

import {SortableItemContext} from '../context/SortableItemContext'
import {useDragAndDrop} from '../hooks/use-drag-and-drop'
import type {DragAndDropItem} from '../utils/types'
import styles from './SortableListItem.module.css'
import {SortableListTrigger} from './SortableListTrigger'

export interface SortableListItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'id' | 'title'> {
  /**
   * The index of the list item
   */
  index: number
  /**
   * Sx to apply to the container
   */
  containerStyle?: CSSProperties
  /**
   * Whether or not to hide the trigger, only use when defining a custom trigger.
   * Note: defining a custom trigger is very risky please reference the accessibility grabberIcon [docs](https://github.com/github/accessibility/blob/aa85cdd00de58509aee9eaba18718d2bd727e777/docs/coaching-recommendations/drag-and-drop/technical-guidance/grabber-iconButton.md) to ensure your trigger will be accessible.
   */
  hideSortableItemTrigger?: boolean
  /**
   * The role of the list item
   */
  role?: React.AriaRole
  /**
   * Component type to render for drag and drop container
   */
  as?: React.ElementType
  /**
   * Wether or not the item is a drag overlay
   */
  isDragOverlay?: boolean
}

/**
 *
 * A sortable list item. This component is responsible for managing the drag trigger and preview.
 *
 * @param props SortableListItemProps
 */
export const SortableListItem: FC<SortableListItemProps & DragAndDropItem> = ({
  children,
  id,
  index,
  title,
  containerStyle,
  style,
  hideSortableItemTrigger,
  isDragOverlay = false,
  role,
  as = 'li',
  ...props
}) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const {setNodeRef, isDragging, transform, transition} = useSortable({
    id,
    data: {metadata: {id}},
  })

  const {direction, isInDragMode} = useDragAndDrop()

  const containerClassName = clsx(
    'position-relative',
    props.className,
    isInDragMode && {
      [styles.dragItem]: isDragging,
      [styles.horizontal]: direction === 'horizontal',
      [styles.vertical]: direction === 'vertical',
    },
  )

  const itemStyle: React.CSSProperties = {
    transform: transform
      ? `
        translateX(${Math.round(transform.x)}px)
        translateY(${Math.round(transform.y)}px)
        scaleX(${transform.scaleX})
        scaleY(${transform.scaleY})
      `
      : 'none',
    transition: prefersReducedMotion ? 'none' : transition,
  }

  const As = isDragOverlay ? 'div' : as

  return (
    <SortableItemContext.Provider value={useMemo(() => ({index, title, id}), [index, id, title])}>
      <As
        {...props}
        {...testIdProps(isDragOverlay ? 'drag-overlay' : 'sortable-item')}
        className={containerClassName}
        style={{...(isDragOverlay ? {} : containerStyle), ...itemStyle}}
        ref={setNodeRef}
      >
        <div
          style={style}
          className={clsx('position-relative', isInDragMode && styles.contents, isDragOverlay && styles.dragOverlay)}
          role={role}
        >
          {!hideSortableItemTrigger && <SortableListTrigger />}
          {children}
        </div>
      </As>
    </SortableItemContext.Provider>
  )
}
