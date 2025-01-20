import {type ListItem, parseListItem} from '@github-ui/markdown-editor/list-editing'
import {isTaskListItem} from './helpers'
import type {TaskItem} from '../constants/types'

/**
 * Updates the local state of a task list by rearranging the items based on drag and drop.
 *
 * @param items - The array of task items.
 * @param dragId - The ID of the item being dragged.
 * @param dropId - The ID of the item where the dragged item is dropped.
 * @param tasklistData - The map containing the task list data.
 * @param isBefore - A boolean indicating whether the dragged item is dropped before or after the drop item.
 * @param container - The container element of the task list.
 * @returns The updated map of task list data.
 */
export const updateLocalState = (
  items: TaskItem[],
  dragId: string | number,
  dropId: string | number,
  tasklistData: Map<Element, TaskItem[]>,
  isBefore: boolean,
  container: Element,
): Map<Element, TaskItem[]> => {
  const newData = new Map<Element, TaskItem[]>(tasklistData)
  const dragItemIndex = items.findIndex(item => item.id === dragId)
  const dragItem = items[dragItemIndex] // item being moved
  if (!dragItem) return newData

  const updatedTaskLists = [...items]
  // Delete the dragged item from its original position
  updatedTaskLists.splice(dragItemIndex, 1)

  const dropItemIndex = updatedTaskLists.findIndex(item => item.id === dropId)
  // Insert the dragged item at the dropped position
  updatedTaskLists.splice(isBefore ? dropItemIndex : dropItemIndex + 1, 0, dragItem)

  const taskList = tasklistData.get(container)

  if (!taskList) return newData

  if (taskList === items) {
    newData.set(container, updatedTaskLists)
  } else {
    const updateTaskListChildren = (task: TaskItem[]) => {
      for (const item of task) {
        if (item.children === items) {
          item.children = updatedTaskLists
        } else if (item.children) {
          updateTaskListChildren(item.children)
        }
      }
    }

    updateTaskListChildren(taskList)
    newData.set(container, taskList)
  }

  return newData
}

/**
 * Updates the markdown value by moving a line and its nested items to a new position.
 *
 * @param markdownValue - The original markdown value.
 * @param dragLineIndex - The index of the line being dragged.
 * @param isBefore - Indicates whether the line is being dropped before or after the target line.
 * @param dropLineIndex - The index of the target line where the dragged line will be dropped.
 * @param draggedChildren - The number of nested items being dragged along with the line.
 * @returns The updated markdown value.
 */
export const updateMarkdown = (
  markdownValue: string,
  isBefore: boolean,
  dragMarkdownIndex: number,
  dropMarkdownIndex: number,
) => {
  const {startLineNumber: dragStartLineNumber, endLineNumber: dragEndLineNumber} =
    getTasklistItemStartEndPositionInMarkdown(dragMarkdownIndex, markdownValue)

  const {startLineNumber: dropStartLineNumber, endLineNumber: dropEndLineNumber} =
    getTasklistItemStartEndPositionInMarkdown(dropMarkdownIndex, markdownValue)

  const lines = markdownValue.split(/\r?\n/)
  const dragItemSize = dragEndLineNumber - dragStartLineNumber + 1

  const chunk = [...lines].splice(dragStartLineNumber, dragItemSize)

  if (isBefore) {
    lines.splice(dragStartLineNumber, dragItemSize)
    lines.splice(dropStartLineNumber, 0, ...chunk)
  } else {
    lines.splice(dropEndLineNumber + 1, 0, ...chunk)
    lines.splice(dragStartLineNumber, dragItemSize)
  }

  return lines.join('\n')
}

export const getTasklistItemStartEndPositionInMarkdown = (startMarkdownIndex: number, markdownValue: string) => {
  const lines = markdownValue.split(/\r?\n/)
  let startLineNumber = -1
  let endLineNumber = -1
  let currMarkdownIndex = -1
  let startLine: ListItem | undefined

  for (const [lineNumber, line] of lines.entries()) {
    const parsedLine = parseListItem(line)
    const indentationLevel = parsedLine?.leadingWhitespace.length

    // Set end line number when an empty line is found
    // or when we reach the next list item on the same or outer level
    if (
      startLine &&
      (!line || (indentationLevel !== undefined && indentationLevel <= startLine.leadingWhitespace.length))
    ) {
      endLineNumber = lineNumber > 0 ? lineNumber - 1 : 0
      break
    }

    if (parsedLine && isTaskListItem(parsedLine)) {
      currMarkdownIndex++

      if (currMarkdownIndex === startMarkdownIndex) {
        startLineNumber = lineNumber
        startLine = parsedLine
      }
    }
  }

  // Item is the last one in the list
  endLineNumber = endLineNumber === -1 ? lines.length - 1 : endLineNumber

  return {startLineNumber, endLineNumber}
}
