import {type MouseEvent, useCallback} from 'react'

import type {TrackedByItem} from '../api/issues-graph/contracts'
import {ItemType} from '../api/memex-items/item-type'
import {useMemexItems} from '../state-providers/memex-items/use-memex-items'
import {
  createHierarchySidePanelHistoryItem,
  createItemTrackedByParent,
} from '../state-providers/tracked-by-items/tracked-by-helpers'
import {useTrackedByItemsContext} from '../state-providers/tracked-by-items/use-tracked-by-items-context'
import {useSidePanel} from './use-side-panel'

export const useSidePanelFromTrackedByItem = () => {
  const {items} = useMemexItems()
  const {openProjectItemInPane, openPaneHierarchyHistoryItem} = useSidePanel()
  const {getAllProjectRelationships} = useTrackedByItemsContext()

  const createSidePanelHandler = useCallback(
    (item: TrackedByItem) => {
      const historyItem = createHierarchySidePanelHistoryItem(createItemTrackedByParent(item))
      const isPullRequest = item.url.includes('/pull/')

      return (e: MouseEvent<HTMLElement>) => {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (e.ctrlKey || e.metaKey || !historyItem.item) return
        if (isPullRequest) return
        e.preventDefault()

        const parentMemexItem = items.find(
          i => i.content.id === item.key.itemId && i.contentType !== ItemType.DraftIssue,
        )
        if (parentMemexItem) {
          // When the item already exists in the project, we only need to make one call to `openProjectItemInPane`
          openProjectItemInPane(parentMemexItem)
        } else {
          // Otherwise, the item doesn't exists in the project and we first need to open the panel with a child parent relationship lookup
          // in order to open the panel with the parent, this is to ensure that we don't break the existing implementation
          // which prevents exceptions when items are removed by third parties from the project board
          const child = getAllProjectRelationships().get(historyItem.item.itemId())
          const childMemexItem = items.find(i => i.content.id === child?.at(0))

          if (childMemexItem) {
            openProjectItemInPane(childMemexItem)
            openPaneHierarchyHistoryItem(historyItem)
          }
        }
      }
    },
    [getAllProjectRelationships, items, openPaneHierarchyHistoryItem, openProjectItemInPane],
  )

  return {createSidePanelHandler}
}
