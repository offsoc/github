import {useCallback} from 'react'

import {useFindMemexItem} from '../memex-items/use-find-memex-item'
import {useTrackedByItemsContext} from './use-tracked-by-items-context'
import {useTrackedByParent} from './use-tracked-by-parent'

type RemoveParentIssueHookReturnType = {
  removeParentFromChildren: (ids: Array<number>) => () => void
  removeParentFromChild: (id: number) => void
  setChildParentRelationship: (id: number) => void
  getIssuesIdsToRemove: (itemIds: Array<number>) => Array<number>
}

export const useRemoveParentIssues = (): RemoveParentIssueHookReturnType => {
  const {getAllProjectRelationships, removeParentIssues, setChildTrackedByParent} = useTrackedByItemsContext()
  const {getParent, getParentIssuesFromChildren} = useTrackedByParent()
  const {findMemexItem} = useFindMemexItem()

  const removeParentFromChildren = useCallback(
    (ids: Array<number>) => {
      const parentIssuesToRemove = getParentIssuesFromChildren(ids)

      if (parentIssuesToRemove.length) {
        return removeParentIssues(parentIssuesToRemove)
      }

      for (const [parentId, children] of getAllProjectRelationships()) {
        if (children.some(childId => ids.includes(childId))) {
          parentIssuesToRemove.push(parentId)
        }
      }

      return removeParentIssues(parentIssuesToRemove)
    },
    [getAllProjectRelationships, getParentIssuesFromChildren, removeParentIssues],
  )

  const removeParentFromChild = useCallback(
    (parentIdToRemove: number) => {
      removeParentFromChildren([parentIdToRemove])
    },
    [removeParentFromChildren],
  )

  const setChildParentRelationship = useCallback(
    (id: number) => {
      const [parentIssueId] = getParentIssuesFromChildren([id])
      if (!parentIssueId) return
      const parent = getParent(parentIssueId)
      setChildTrackedByParent(parentIssueId, parent?.items.map(({itemId}) => itemId) || [])
      removeParentFromChild(id)
    },
    [getParent, getParentIssuesFromChildren, removeParentFromChild, setChildTrackedByParent],
  )

  const getIssuesIdsToRemove = useCallback(
    (itemIds: Array<number>) => {
      return itemIds.reduce((acc: Array<number>, id) => {
        const memexItemModel = findMemexItem(id)
        if (!memexItemModel) return acc
        return [...acc, memexItemModel.content.id]
      }, [])
    },
    [findMemexItem],
  )

  return {
    removeParentFromChildren,
    removeParentFromChild,
    setChildParentRelationship,
    getIssuesIdsToRemove,
  }
}
