import {useCallback, useMemo} from 'react'

import type {ParentIssue} from '../../api/common-contracts'
import {SubIssueSidePanelItem} from '../../api/memex-items/hierarchy'
import {useTableSidePanel} from '../../hooks/use-side-panel'
import type {MemexItemModel} from '../../models/memex-item-model'
import {useMemexItems} from '../../state-providers/memex-items/use-memex-items'

/**
 * Opens the parent issue of an issue, if it exists, and tries to respect the context in which it is being opened.
 */
export function useOpenParentIssue() {
  const {openPane} = useTableSidePanel()
  const {items} = useMemexItems()

  const openParentIssue = useCallback(
    (parentIssue: ParentIssue | MemexItemModel | undefined) => {
      if (!parentIssue) return

      // If we already have the item instance, then use that, otherwise look it up in the list of all project items.
      // If the parent issue is not in the project, create a hierarchy item that can be opened in the side panel.
      if ('getState' in parentIssue) {
        openPane(parentIssue)
      } else {
        const {id, number, owner, repository: repo, state, stateReason, title, url} = parentIssue
        const parentItem =
          items.find(item => item.content.id === parentIssue.id) ??
          new SubIssueSidePanelItem({id, number, owner, repo, state, stateReason, title, url})
        openPane(parentItem)
      }
    },
    [items, openPane],
  )

  return useMemo(() => ({openParentIssue}), [openParentIssue])
}
