import type {ListItem} from '@github-ui/markdown-editor/list-editing'

export type TaskListItem = ListItem & {taskBox: '[ ]' | '[x]'}

export type TaskItem = {
  /**
   * Sanitized task name
   */
  title: string
  /**
   * Position of the task in the list `[listNumber, itemIndex]`
   */
  position?: [number, number]

  id: string
  index: number
  content: string
  checked: boolean
  container: Element
  nested: boolean
  children: TaskItem[]
  markdownIndex: number
  isBullet?: boolean
  isNumbered?: boolean
  parentIsChecklist?: boolean
  hasNestedItems?: boolean
  hasDifferentListTypes?: boolean
}
