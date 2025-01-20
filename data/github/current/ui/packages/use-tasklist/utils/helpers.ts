import type {ListItem} from '@github-ui/markdown-editor/list-editing'
import type {TaskItem, TaskListItem} from '../constants/types'

const TASKLIST_SELECTOR = 'ul:not(.base-list-item), ol:not(.base-list-item)'

export const isTaskListItem = (item: ListItem | null): item is TaskListItem =>
  // We don't render `- [ ]` with no text as a tasklist item
  typeof item?.taskBox === 'string' && item?.text?.match(/[^\s\\]/) !== null

/**
 * Return the lists from a container
 *
 * Indentation is not relevant but rather the order by which we traverse the items.
 */
export function getLists(container: Element, selector: string = TASKLIST_SELECTOR) {
  return Array.from(container.querySelectorAll(selector)).filter(item => {
    // Filter out tasklist blocks
    return !item.closest('tracking-block')
  })
}

/**
 * Maps the task list items recursively and returns an array of items that can be used by the Drag and Drop component.
 *
 * @param {Object} options - The options object.
 * @param {Element} options.container - The container element.
 * @param {Map<string, number>} options.nestedItems - The map of nested items.
 * @param {number} options.globalIndex - The global index.
 * @param {Element[]} options.items - The array of items.
 * @param {TaskItem[]} options.itemsData - The array to store the task item data.
 * @param {boolean} options.nested - Indicates if the items are nested.
 */
export const mapTaskListItems = ({
  container,
  nestedItems,
  globalIndex,
  markdownIndex,
  items,
  itemsData,
  nested = false,
  lists,
  parentIsChecklist,
  hasDifferentListTypes,
}: {
  container: Element
  nestedItems: Map<string, number>
  globalIndex: number
  markdownIndex: number
  items: Element[]
  itemsData: TaskItem[]
  nested: boolean
  lists: Element[]
  parentIsChecklist?: boolean
  hasDifferentListTypes?: boolean
}) => {
  items.map((el, index) => {
    const children =
      Array.from(
        el.querySelectorAll(':scope > ul > li:not(.base-task-list-item), :scope > ol > li:not(.base-task-list-item)'),
      ) ?? []
    const taskListChildren =
      Array.from(el.querySelectorAll(':scope > ul > li.task-list-item, :scope > ol > li.task-list-item')) ?? []
    const totalTaskListChildren = (
      Array.from(el.querySelectorAll('ul > li.task-list-item, ol > li.task-list-item, li.task-list-item')) ?? []
    ).length

    const mappedChildren: TaskItem[] = []

    if (totalTaskListChildren > 0) nestedItems.set(globalIndex.toString(), totalTaskListChildren)

    const position = el.classList.contains('task-list-item') ? getTaskPosition(lists, el) : undefined

    const {title, content} = getTaskItemContent(el)

    itemsData.push({
      id: globalIndex.toString(),
      index,
      title,
      content,
      checked: (el.querySelector('.task-list-item-checkbox') as HTMLInputElement)?.checked === true,
      position,
      container: el.parentElement as Element,
      nested,
      children: mappedChildren,
      markdownIndex: el.classList.contains('task-list-item') ? (markdownIndex += 1) : -1,
      isBullet: el.parentElement?.tagName === 'UL' && !el.classList.contains('task-list-item'),
      isNumbered: el.parentElement?.tagName === 'OL' && !el.classList.contains('task-list-item'),
      parentIsChecklist,
      hasNestedItems: totalTaskListChildren > 0,
      hasDifferentListTypes,
    })

    const res =
      children.length > 0 &&
      mapTaskListItems({
        container,
        nestedItems,
        globalIndex: globalIndex + 1,
        markdownIndex,
        items: children,
        itemsData: mappedChildren,
        nested: true,
        lists,
        parentIsChecklist: el.classList.contains('task-list-item'),
        hasDifferentListTypes: taskListChildren.length > 0 ? children.length !== taskListChildren.length : false,
      })

    globalIndex = res ? res.globalIndex : globalIndex + 1
    markdownIndex = res ? res.markdownIndex : markdownIndex
  })

  return {globalIndex, markdownIndex}
}

/**
 * Gets the text content of all children nodes of the item, excluding the input and nested lists.
 *
 * `textContent` is used to strip all the HTML with the exception of `<code>` tags, which we replace for backticks.
 */
export function getTaskItemContent(element: Element) {
  let name = ''
  let content = ''

  for (const child of element.childNodes) {
    if (!isContentNode(child)) continue
    if (isSkippableNode(child)) continue

    const textContent = child.textContent || ''
    const isTasklistItem = element.classList.contains('task-list-item')

    if (child.nodeName === '#text') {
      name += textContent
      content += textContent
      continue
    }

    if (child.nodeName === 'CODE') {
      name += `\`${textContent}\``
      content += (child as HTMLElement).outerHTML
      continue
    }

    /*
      this helps to avoid rendering the tasklist item as a paragraph
      by rendering the innerHTML of the paragraph element
    */
    if (child.nodeName === 'P' && isTasklistItem) {
      name += textContent
      content += (child as HTMLElement).innerHTML
      continue
    }

    name += textContent
    content += (child as HTMLElement).outerHTML
  }

  return {
    title: name.trim(),
    content,
  }
}

/**
 * Calculate the list index and item index for a task item.
 *
 * Item index is the position of the task within the list, including regular list items that are not tasks.
 */
function getTaskPosition(lists: Element[], element: Element): [number, number] {
  const taskList = element.parentElement?.closest('.contains-task-list')
  if (!taskList) throw new Error("Could not find the item's parent list")

  const index = element ? Array.from(taskList.children).indexOf(element) : -1
  return [lists.indexOf(taskList), index]
}

/**
 * Rejects inputs (task's checkbox) or nested lists
 */
function isContentNode(node: Node) {
  return node.nodeName !== 'INPUT' && node.nodeName !== 'UL' && node.nodeName !== 'OL'
}

/**
 * Skip #comment tags as these are not relevant to the task list, and used to wrap code unfurling links.
 */
function isSkippableNode(node: Node) {
  return node.nodeName === '#comment'
}
