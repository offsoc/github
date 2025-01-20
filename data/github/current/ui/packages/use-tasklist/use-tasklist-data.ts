import {useState} from 'react'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {getLists, mapTaskListItems} from './utils/helpers'
import type {TaskItem} from './constants/types'

export const useTasklistData = (container: HTMLElement | null, tasklists: Element[]) => {
  const [tasklistData, setTasklistData] = useState<Map<Element, TaskItem[]>>(new Map())
  const [nestedItems, setNestedItems] = useState<Map<string, number>>(new Map())
  // Note this isn't a perfect solution since it causes two renders: one when the item elements update and one when the
  // data updates. But I think the performance impact is negligible and this allows us to easily rerender when we want
  // to make local (ie, optimistic) updates.

  useLayoutEffect(() => {
    if (!container) return

    getDataAndClearTasklists({container, tasklists, setTasklistData, setNestedItems})
    // Critically this effect depends on `tasklists` _only_ updating when the Markdown updates, which should be true
    // as long as no external code is messing with the rendered Markdown as well. For example if an external code
    // deleted a tasklist, it would cause a rerender which would cause all our tasklists to get cleared because this
    // effect would not see any `.task-list-item` children since they've all been deleted already. This could maybe be
    // made more robust by storing the data on a `data-` attribute on the tasklist element itself, but then we can't
    // update state locally when the user makes changes. This could be tricky to get right, or it might not be a problem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasklists])

  return {
    tasklistData,
    nestedItems,
    setTasklistData,
    setNestedItems,
  }
}

/**
 * Retrieves data from html tasklists, gets corresponding data to use in Drag and Drop Component from them,
 * and clears them from the DOM.
 *
 * @param {Object} options - The options object.
 * @param {Element} options.container - The container element.
 * @param {Element[]} options.tasklists - An array of tasklist elements.
 * @param {React.Dispatch<React.SetStateAction<Map<Element, TaskItem[]>>>} options.setTasklistData - The state setter for tasklist data.
 * @param {React.Dispatch<React.SetStateAction<Map<string, number>>>} options.setNestedItems - The state setter for nested items.
 */
function getDataAndClearTasklists({
  container,
  tasklists,
  setTasklistData,
  setNestedItems,
}: {
  container: Element
  tasklists: Element[]
  setTasklistData: React.Dispatch<React.SetStateAction<Map<Element, TaskItem[]>>>
  setNestedItems: React.Dispatch<React.SetStateAction<Map<string, number>>>
}) {
  const newData = new Map<Element, TaskItem[]>()
  const nestedItems = new Map<string, number>()

  // Here we just want the lists that have task list items (.contains-task-list)
  const lists = getLists(container)

  let globalIndex = 0
  let markdownIndex = -1
  for (const tasklist of tasklists) {
    const items = Array.from(tasklist.querySelectorAll(':scope > li:not(.base-task-list-item)'))
    const taskListItems = tasklist.querySelectorAll(':scope > li.task-list-item')
    const itemsData: TaskItem[] = []
    const {globalIndex: newGlobalIndex, markdownIndex: newMarkdownIndex} = mapTaskListItems({
      container,
      nestedItems,
      globalIndex,
      markdownIndex,
      items,
      itemsData,
      nested: false,
      lists,
      parentIsChecklist: tasklist.classList.contains('task-list-item'),
      hasDifferentListTypes: taskListItems.length > 0 ? taskListItems.length !== items.length : false,
    })
    globalIndex = newGlobalIndex
    markdownIndex = newMarkdownIndex

    newData.set(tasklist, itemsData)
    for (const item of items) item.remove()
  }

  setTasklistData(newData)
  setNestedItems(nestedItems)
}
