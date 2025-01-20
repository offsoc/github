import type {TaskItem} from '../constants/types'

export const getTaskListsFromContainer = (container: HTMLElement) => {
  return Array.from(
    container.querySelectorAll(':scope > ul:not(.base-list-item), :scope > ol:not(.base-list-item)') || [],
  )
}

export const createItem = (
  index: number,
  markdownIndex: number,
  container?: Element,
  nestedItems?: TaskItem[],
): TaskItem => {
  return {
    title: `item ${index + 1}`,
    position: [0, index] as [number, number],
    id: `${index + 1}`,
    index,
    children: nestedItems ?? [],
    nested: false,
    content: 'content',
    checked: false,

    container: container || document.createElement('li'),
    markdownIndex,
  }
}

export const createNestedItem = (startingIndex: number, startingMarkdownIndex: number, depth: number): TaskItem => {
  return createItem(
    startingIndex,
    startingMarkdownIndex,
    undefined,
    depth > 0 ? [createNestedItem(0, startingMarkdownIndex + 1, depth - 1)] : [],
  )
}

export const createTasklistDataMap = (taskListItems: TaskItem[]) => {
  const ul = document.createElement('ul')

  const tasklistData = new Map<Element, TaskItem[]>()
  tasklistData.set(ul, taskListItems)

  return {ul, tasklistData}
}
