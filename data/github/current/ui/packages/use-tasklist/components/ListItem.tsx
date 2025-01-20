import type {ListItem} from '@github-ui/markdown-editor/list-editing'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import type {TaskItem} from '../constants/types'

export type ListItemProps = {
  item: TaskItem
  position: number
}

export function ListItem({item, position}: ListItemProps) {
  const tasklistIstemTestIdBase = `tasklist-item-${position}-${item.markdownIndex}`

  return (
    <SafeHTMLBox
      // Added to reserve space to match the styling of checkbox list items
      sx={{mr: 6}}
      unverifiedHTML={item.content as SafeHTMLString}
      as={'div'}
      data-testid={tasklistIstemTestIdBase}
    />
  )
}
