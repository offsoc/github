import {useDroppable} from '@github-ui/drag-and-drop'
import isObject from 'lodash-es/isObject'
import {useEffect} from 'react'

import {useHorizontalGroupedBy} from '../features/grouping/hooks/use-horizontal-grouped-by'
import {useTimeout} from './common/timeouts/use-timeout'

export interface DroppableGroupData {
  /** The grouped value in grouped views. */
  groupedValue: string
}

export const DroppableGroupData = {
  is(data: unknown): data is DroppableGroupData {
    return isObject(data) && 'groupedValue' in data && typeof data.groupedValue === 'string'
  },
}

interface DroppableGroupProps {
  groupId: string
  groupedValue: string
  isCollapsed: boolean
  isEmpty: boolean
}

/**
 * Register a group as a drop zone, so it can be dropped into when collapsed or empty (when there are items inside,
 * this doesn't apply because items are dropped on other items instead of on the group).
 */
export const useDroppableGroup = ({groupId, groupedValue, isCollapsed, isEmpty}: DroppableGroupProps) => {
  const {toggleGroupCollapsed} = useHorizontalGroupedBy()

  const droppable = useDroppable({
    id: `droppable-group-${groupId}`,
    data: {
      groupedValue,
    } satisfies DroppableGroupData,
    // Because we are using closest centers collision detection, we must disable this when there are items inside or
    // a drop directly in the center of a populated group will count as a drop in the group instead of between rows
    disabled: !(isCollapsed || isEmpty),
  })

  const toggleAfterDelay = useTimeout(() => toggleGroupCollapsed(groupedValue), 500)

  useEffect(() => {
    if (droppable.isOver && isCollapsed) {
      const timeout = toggleAfterDelay()
      return () => timeout.cancel()
    }
  }, [droppable.isOver, isCollapsed, toggleAfterDelay])

  return droppable
}
