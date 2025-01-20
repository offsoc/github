import type {MutableRefObject} from 'react'

import type {
  ChildrenTrackedByParentModelById,
  TrackedByItemsContextType,
  TrackedByItemsStableContextType,
} from '../../../client/state-providers/tracked-by-items/tracked-by-items-state-provider'

export function createTrackedByItemsContext(mocks?: Partial<TrackedByItemsContextType>): TrackedByItemsContextType {
  const parentIssuesByIdRef: MutableRefObject<ChildrenTrackedByParentModelById> = {
    current: mocks?.parentIssuesById ? new Map(mocks.parentIssuesById) : new Map(),
  }

  return {
    getChildrenTrackedByParent: jest.fn(),
    removeParentIssues: jest.fn(),
    removeChildIssues: jest.fn(),
    setChildTrackedByParent: jest.fn(),
    getAllProjectRelationships: jest.fn(),
    parentIssuesById: new Map(),
    parentIssuesByIdRef,
    ...mocks,
  }
}

export function createTrackedByItemsStableContext(
  mocks?: Partial<TrackedByItemsStableContextType>,
): TrackedByItemsStableContextType {
  const parentIssuesByIdRef: MutableRefObject<ChildrenTrackedByParentModelById> = {
    current: new Map(),
  }

  return {
    removeParentIssues: jest.fn(),
    setChildTrackedByParent: jest.fn(),
    getAllProjectRelationships: jest.fn(),
    parentIssuesByIdRef,
    ...mocks,
  }
}
