import {useSortable} from '@dnd-kit/sortable'
import {testIdProps} from '@github-ui/test-id-props'
import {GrabberIcon} from '@primer/octicons-react'
import {IconButton, useRefObjectAsForwardedRef} from '@primer/react'
import {clsx} from 'clsx'
import type React from 'react'
import {forwardRef, type HTMLAttributes, useRef} from 'react'

import {useSortableItem} from '../hooks/use-sortable-item'
import styles from './SortableListTrigger.module.css'

interface SortableListTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'id' | 'aria-labelledby'> {}

/**
 * The trigger button that activates the drag and drop of a sortable item. It is HIGHLY recommended to use
 * this component to trigger drag and drop since it includes additional accessibility features
 * to make the drag and drop experience work more robustly with screen readers.
 */
export const SortableListTrigger = forwardRef(function SortableListTrigger(
  props: SortableListTriggerProps,
  forwardedRef,
) {
  const {title, id} = useSortableItem()
  const {setActivatorNodeRef, listeners, isDragging, items} = useSortable({
    id,
    data: {metadata: {id}},
  })
  const ref = useRef<HTMLElement | null>(null)
  useRefObjectAsForwardedRef(forwardedRef, ref)

  const {onMouseDown, onClick, onKeyDown} = listeners as {
    onMouseDown: React.MouseEventHandler
    onClick: React.MouseEventHandler
    onKeyDown: React.KeyboardEventHandler
  }

  return (
    <div
      {...testIdProps('sortable-trigger-container')}
      className={clsx(styles.trigger, items.length === 1 && 'v-hidden')}
    >
      {/*
        Some screen readers (NVDA) simulate a click when the user presses enter or space, which
        triggers the drag and drop from a mouse source rather than a keyboard source, which
        prevents drag and drop from behaving correctly. This works around that confusion
        by having a clickable layer on top of the trigger button that handles the mouse event triggered
        by the actual mouse, whereas the button handles the mouse event triggered by the screen reader.
      */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={onMouseDown} className={clsx(styles.mouseTrigger)} {...testIdProps('sortable-mouse-trigger')} />
      <IconButton
        className="mr-1 p-1"
        aria-label={`Move ${title}`}
        ref={(element: HTMLElement | null) => {
          ref.current = element
          setActivatorNodeRef(element)
        }}
        onKeyDown={onKeyDown}
        onClick={onClick}
        variant="invisible"
        // When dragging, the button is no longer a button, but has the role application to allow
        // keyboard movements to not be registered by the screen reader
        role={isDragging ? 'application' : 'button'}
        icon={GrabberIcon}
        size="large"
        {...props}
        {...testIdProps('sortable-trigger')}
      />
    </div>
  )
})
