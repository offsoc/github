import {useCallback} from 'react'

import type {ItemCompletion, ItemTrackedByParent} from '../../api/issues-graph/contracts'
import type {GetItemsTrackedByParentResponse as ItemsTrackedByParent} from '../../api/memex-items/contracts'
import {useTrackedByItemsContext} from './use-tracked-by-items-context'

type TrackedByParentHookReturnType = {
  getChildrenIssuesForParent: (id: number) => Array<ItemTrackedByParent>
  getParentIssuesFromChildren: (ids: Array<number>) => Array<number>
  getParentCompletion: (id: number) => ItemCompletion | undefined
  getParent: (id: number) => ItemsTrackedByParent | undefined
}

export const useTrackedByParent = (): TrackedByParentHookReturnType => {
  const {parentIssuesByIdRef} = useTrackedByItemsContext()

  const getParentIssuesFromChildren = useCallback(
    (ids: Array<number>) => {
      const parentIssues: Array<number> = []
      const childrenToInpect = new Set<number>(ids)

      for (const [parentId, parent] of parentIssuesByIdRef.current) {
        const parentHasChildren = parent?.items.some(({itemId}) => childrenToInpect.has(itemId))
        if (parentHasChildren) {
          parentIssues.push(parentId)
        }
      }

      return parentIssues
    },
    [parentIssuesByIdRef],
  )

  const getChildrenIssuesForParent = useCallback(
    (id: number) => parentIssuesByIdRef.current.get(id)?.items ?? [],
    [parentIssuesByIdRef],
  )

  const getParentCompletion = useCallback(
    (id: number) => parentIssuesByIdRef.current.get(id)?.parentCompletion,
    [parentIssuesByIdRef],
  )

  const getParent = useCallback((id: number) => parentIssuesByIdRef.current.get(id), [parentIssuesByIdRef])

  return {getChildrenIssuesForParent, getParentIssuesFromChildren, getParentCompletion, getParent}
}
