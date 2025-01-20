import {useDraggable, useDroppable} from '@github-ui/drag-and-drop'
import {memo, useRef} from 'react'

import type {BoardDndCardEventData} from '../board-dnd-context'
import useIsVisible from '../hooks/use-is-visible'
import {Card} from './index'
import type {CardProps} from './types'

export const DraggableCard = memo(function DraggableCard(props: Omit<CardProps, 'isVisible' | 'size'>) {
  const ref = useRef<HTMLDivElement>(null)
  const {isVisible, size} = useIsVisible({ref})
  const {item, verticalGroup, columnIndex, isDragDisabled} = props

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
  } = useDraggable({
    id: item.id,
    data: {
      type: 'card',
      item,
      ref,
      verticalGroup,
      columnIndex,
      horizontalGroupIndex: props.horizontalGroupIndex,
    } satisfies BoardDndCardEventData,
    disabled: isDragDisabled || !isVisible,
  })
  const {setNodeRef: setDropRef} = useDroppable({
    id: item.id,
    data: {
      type: 'card',
      item,
      ref,
      verticalGroup,
      columnIndex,
      horizontalGroupIndex: props.horizontalGroupIndex,
    } satisfies BoardDndCardEventData,
    disabled: !isVisible,
  })
  setDropRef(ref.current)
  setDragRef(ref.current)

  return <Card size={size} ref={ref} {...props} isVisible={isVisible} {...attributes} {...listeners} />
})
