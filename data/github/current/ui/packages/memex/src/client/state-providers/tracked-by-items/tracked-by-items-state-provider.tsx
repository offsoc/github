import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {createContext, memo, type MutableRefObject, useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {apiGetItemsTrackedByParent} from '../../api/memex-items/api-get-items-tracked-by-parent'
import type {GetItemsTrackedByParentResponse as ItemsTrackedByParent} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import {useFindMemexItem} from '../memex-items/use-find-memex-item'
import {useMemexItems} from '../memex-items/use-memex-items'

type RemoveParentIssuesRollbackFunction = () => void
type RemoveChildIssuesRollbackFunction = () => void
type ParentTrackingChildrenById = Map<number, Array<number>>

export type ChildrenTrackedByParentModelById = Map<number, ItemsTrackedByParent | undefined>

export type TrackedByItemsContextType = {
  /**
   * Gets the children tracked by a given parent by issue id,
   * When the issue id is not present as part of the local state, it will make a request to the server
   * by the given parent issue id and updates the local state with the response.
   *
   * The response is then cached in local state, therefore subsequent calls to this function with the same
   * parent issue id will not make a request to the server. Because the response is cached, every time
   * and item is removed from the project is imperative that we call the `removeParentIssues` function
   * to remove the cached response from local state and fetch a new one from the server.
   *
   * @param parentIssueId The parent issue id to get the children tracked by the parent issue.
   *
   * @returns A promise that resolves to the children tracked by the parent issue id.
   */
  getChildrenTrackedByParent: (parentIssueId: number) => Promise<ItemsTrackedByParent | undefined>

  /**
   * Updates local state to no longer have the parent issues in the list.
   *
   * @param parentIssueIds A list of ids referencing the parent issues to remove
   *
   * @returns A rollback function which will set the parent issues back to their
   * original state before these items were removed. This is helpful in scenarios
   * where we've made an optimistic update, but the server request failed, so
   * we want to revert the local state back to what it was.
   */
  removeParentIssues: (parentIssueIdsToRemove: Array<number>) => RemoveParentIssuesRollbackFunction

  /**
   * Updates local state to remove a list of child issues from a parent's cache
   *
   * @param childIssueIds A list of ids referencing the child issues to remove
   *
   * @returns A rollback function that will set the parent issue back to its
   * original state before the child issues were removed. This is helpful in scenarios
   * where we've made an optimistic update, but the server request failed, so
   * we want to revert the local state back to what it was.
   */
  removeChildIssues: (childIssueIds: Array<number>) => RemoveChildIssuesRollbackFunction | undefined

  /**
   * Sets new children tracked by parents in a project.
   * This is useful when we want to update the local state with a new set of children.
   *
   * @param parentIssueId The parent issue id to set the children tracked by the parent issue.
   * @param childrenIssueIds The children tracked by the parent issue id.
   */
  setChildTrackedByParent: (parentIssueId: number, childrenIssueIds: Array<number>) => void

  /**
   * gets all relationships from the current project
   *
   * @returns A map of parent issue id to children issue ids
   */
  getAllProjectRelationships: () => ReadonlyMap<number, Array<number>>

  /**
   * A map to an object which maps issueIds => TrackedByParentResponse
   * This map is updated every time parents are added or removed from the project.
   */
  parentIssuesById: ReadonlyMap<number, ItemsTrackedByParent | undefined>

  /**
   * A ref to an object which maps issueIds => TrackedByParentResponse
   * This ref is updated every time parents are added or removed from the project.
   */
  parentIssuesByIdRef: Readonly<MutableRefObject<ReadonlyMap<number, ItemsTrackedByParent | undefined>>>
}

export type TrackedByItemsStableContextType = Pick<
  TrackedByItemsContextType,
  'parentIssuesByIdRef' | 'removeParentIssues' | 'setChildTrackedByParent' | 'getAllProjectRelationships'
>

/**
 * This context manages state for the items tracked by parent issues of a project.
 * Because this particular context contains the state object itself, whenever the state changes,
 * components that consume this context (either directly with a `useContext` or indirectly with a hook) that
 * consumes this context will be re-rendered.
 *
 * I a component should not be re-rendered when the state changes, consider consuming the `TrackedByItemsStableContext`
 * instead.
 */
export const TrackedByItemsContext = createContext<TrackedByItemsContextType | null>(null)

/**
 * This conext allows consumers to access and mutate the parent issues of a project. Because this particular
 * context only contains a reference to the state, as well as updated functions to modify the state,
 * the context value will be stable (i.e. the same object) for the lifetime of the context. A component
 * (or hook) which consumes this context will _not_ be re-rendered when the state changes.
 *
 * If a component should be re-rendered when the state changes, consider consuming the
 * `TrackedByItemsContext` instead.
 */
export const TrackedByItemsStableContext = createContext<TrackedByItemsStableContextType | null>(null)

export const TrackedByItemsStateProvider = memo(function TrackedByItemsStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const {items} = useMemexItems()
  const {findMemexItem} = useFindMemexItem()

  const [parentIssuesById, setParentIssuesState] = useState<ChildrenTrackedByParentModelById>(new Map())

  const parentIssuesByIdRef = useRef<Readonly<ChildrenTrackedByParentModelById>>(parentIssuesById)

  /**
   * This ref is used to keep track of all parent/child relationships when the memex project loads.
   * 1. relationships are prefilled to the ref from the `Tracked By` column to support additions/removals.
   * 2. Because the API endpoint `getItemsTrackedByParent` only return items not yet in a project a lookup is required on the
   *    existing relationships to determine whether or not we should update the local state (i.e. bust the cache) in order to
   *    get the latest `tracking blocks` state from the server. Polling is needed because tracking blocks can be updated from
   *    outside of the Memex project.
   * 3. This ref is only updated with new parent/child relationship after initial load.
   */
  const projectIssuesByIdRef = useRef<Readonly<ParentTrackingChildrenById>>(new Map())

  const getChildrenTrackedByParent = useCallback(
    async (issueId: number) => {
      if (parentIssuesByIdRef.current.has(issueId)) {
        return parentIssuesByIdRef.current.get(issueId)
      }

      // IMPORTANT: setting the ref to a pending state in order to prevent multiple requests to the server
      parentIssuesByIdRef.current.set(issueId, undefined)
      const apiResponse = await apiGetItemsTrackedByParent({issueId}).catch(() => null)
      if (!apiResponse) {
        /**
         * TODO: this swallows the server exception, I don't imagine we would want to show a toast
         * so we eagerly return, but is this what we want? may need to follow up with product/design
         */
        setParentIssuesState(new Map(parentIssuesById.set(issueId, undefined)))
        return
      }

      setParentIssuesState(prevState => new Map(prevState.set(issueId, apiResponse)))
      parentIssuesByIdRef.current = new Map(parentIssuesByIdRef.current.set(issueId, apiResponse))

      return parentIssuesById.get(issueId)
    },
    [parentIssuesById],
  )

  const removeParentIssues = useCallback(
    (parentIssueIdsToRemove: Array<number>) => {
      const removedParentIssuesById = parentIssueIdsToRemove.reduce(
        (acc: ChildrenTrackedByParentModelById, parentIssueId) => {
          const parentIssue = parentIssuesById.get(parentIssueId)
          if (!parentIssue) {
            return acc
          }

          parentIssuesByIdRef.current.delete(parentIssueId)
          return acc.set(parentIssueId, parentIssue)
        },
        new Map(),
      )

      setParentIssuesState(new Map(parentIssuesByIdRef.current))

      const rollback = () => {
        for (const parentIssueId of removedParentIssuesById.keys()) {
          parentIssuesByIdRef.current.set(parentIssueId, removedParentIssuesById.get(parentIssueId))
        }

        setParentIssuesState(new Map(parentIssuesByIdRef.current))
      }

      return rollback
    },
    [parentIssuesById],
  )

  const removeChildIssues = useCallback(
    (childIssueIds: Array<number>) => {
      const updatedParentIssuesById = new Map() as ChildrenTrackedByParentModelById
      for (const [parentIssueId] of parentIssuesByIdRef.current) {
        const parentIssue = parentIssuesById.get(parentIssueId)
        if (!parentIssue) continue

        // Remove any matching child issues from items
        const newChildren = parentIssue.items.filter(item => {
          return childIssueIds.indexOf(item.itemId) < 0
        })

        if (newChildren.length !== parentIssue.items.length) {
          updatedParentIssuesById.set(parentIssueId, parentIssue)
        }

        // If there are no more children, remove the parent
        if (newChildren.length === 0) {
          parentIssuesByIdRef.current.delete(parentIssueId)
        } else {
          parentIssuesByIdRef.current.set(parentIssueId, {
            ...parentIssue,
            items: newChildren,
            count: newChildren.length,
          })
        }
      }

      setParentIssuesState(new Map(parentIssuesByIdRef.current))

      const rollback = () => {
        for (const parentIssueId of updatedParentIssuesById.keys()) {
          parentIssuesByIdRef.current.set(parentIssueId, updatedParentIssuesById.get(parentIssueId))
        }

        setParentIssuesState(new Map(parentIssuesByIdRef.current))
      }
      return rollback
    },
    [parentIssuesById],
  )

  const setChildTrackedByParent = useCallback((parentIssueId: number, childrenIssueIds: Array<number>) => {
    projectIssuesByIdRef.current.set(parentIssueId, childrenIssueIds)
  }, [])

  const getAllProjectRelationships = useCallback(() => {
    return projectIssuesByIdRef.current
  }, [])

  const trackingItems = useTrackingRef(items)
  const hasTrackedByLoaded = useMemo(
    () => items.some(item => item.contentType === ItemType.Issue && item.columns[SystemColumnId.TrackedBy]),
    [items],
  )
  useEffect(() => {
    /**
     * Important: This effect is responsible for prepopulating child parent relationships on project load,
     * Or when the `TrackedBy` column is available in a project, as a result it is only meant to run when
     * the state provider mounts or when `TrackedBy` column is added to a project.
     */
    projectIssuesByIdRef.current = trackingItems.current.reduce((acc: Map<number, Array<number>>, item) => {
      const trackedByColumn = item.columns[SystemColumnId.TrackedBy]
      if (item.contentType !== ItemType.Issue || !trackedByColumn) return acc

      const childIssueId = findMemexItem(item.id)?.content.id
      if (!childIssueId) return acc

      for (const parentItem of trackedByColumn) {
        if (acc.get(parentItem.key.itemId)?.includes(childIssueId)) {
          continue
        }

        acc.set(parentItem.key.itemId, [...(acc.get(parentItem.key.itemId) || []), childIssueId])
      }

      return acc
    }, new Map())
  }, [findMemexItem, hasTrackedByLoaded, trackingItems])

  const contextValue: TrackedByItemsContextType = useMemo(() => {
    return {
      getChildrenTrackedByParent,
      setChildTrackedByParent,
      parentIssuesById,
      parentIssuesByIdRef,
      removeParentIssues,
      removeChildIssues,
      getAllProjectRelationships,
    }
  }, [
    getAllProjectRelationships,
    getChildrenTrackedByParent,
    parentIssuesById,
    removeChildIssues,
    removeParentIssues,
    setChildTrackedByParent,
  ])

  const stableContextValue: TrackedByItemsStableContextType = useMemo(
    () => ({
      parentIssuesByIdRef,
      removeParentIssues,
      setChildTrackedByParent,
      getAllProjectRelationships,
    }),
    [getAllProjectRelationships, removeParentIssues, setChildTrackedByParent],
  )

  return (
    <TrackedByItemsContext.Provider value={contextValue}>
      <TrackedByItemsStableContext.Provider value={stableContextValue}>{children}</TrackedByItemsStableContext.Provider>
    </TrackedByItemsContext.Provider>
  )
})
