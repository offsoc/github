import {renderHook} from '@testing-library/react'
import first from 'lodash-es/first'

import {useFindMemexItem} from '../../../client/state-providers/memex-items/use-find-memex-item'
import {useRemoveParentIssues} from '../../../client/state-providers/tracked-by-items/use-remove-parent-issues'
import {useTrackedByItemsContext} from '../../../client/state-providers/tracked-by-items/use-tracked-by-items-context'
import {useTrackedByParent} from '../../../client/state-providers/tracked-by-items/use-tracked-by-parent'
import {DefaultTrackedByIssue} from '../../../mocks/memex-items'
import {createMemexItemModel} from '../../mocks/models/memex-item-model'
import {asMockHook} from '../../mocks/stub-utilities'
import {createTrackedByItemsStateProviderWrapper, mockTrackedItemsByParent} from './helpers'

jest.mock('../../../client/state-providers/tracked-by-items/use-tracked-by-items-context')
jest.mock('../../../client/state-providers/tracked-by-items/use-tracked-by-parent')
jest.mock('../../../client/state-providers/memex-items/use-find-memex-item')

interface SetupProps {
  trackedByItemsContext?: Partial<ReturnType<typeof useTrackedByItemsContext>>
  trackedByParentMockHook?: Partial<ReturnType<typeof useTrackedByParent>>
  findMemexItemMockHook?: Partial<ReturnType<typeof useFindMemexItem>>
}

function setupAndRender({
  trackedByItemsContext = {
    getAllProjectRelationships: jest.fn(),
    removeParentIssues: jest.fn(),
    setChildTrackedByParent: jest.fn(),
  },
  trackedByParentMockHook = {
    getParent: jest.fn(),
    getParentIssuesFromChildren: jest.fn(),
  },
  findMemexItemMockHook = {
    findMemexItem: jest.fn(),
  },
}: SetupProps = {}) {
  asMockHook(useTrackedByItemsContext).mockReturnValue(trackedByItemsContext)
  asMockHook(useTrackedByParent).mockReturnValue(trackedByParentMockHook)
  asMockHook(useFindMemexItem).mockReturnValue(findMemexItemMockHook)

  return renderHook(useRemoveParentIssues, {
    wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
  })
}

const PARENT_ISSUE_ID = 1

describe('useRemoveParentIssues', () => {
  describe('removeParentFromChildren', () => {
    it('should remove parent issues from local state', () => {
      const removeParentIssuesStub = jest.fn()
      const getAllProjectRelationshipsStub = jest.fn()
      const getParentIssuesFromChildrenStub = jest.fn().mockReturnValue([PARENT_ISSUE_ID])

      const {result} = setupAndRender({
        trackedByItemsContext: {
          removeParentIssues: removeParentIssuesStub,
          getAllProjectRelationships: getAllProjectRelationshipsStub,
        },
        trackedByParentMockHook: {
          getParentIssuesFromChildren: getParentIssuesFromChildrenStub,
        },
      })

      const childrenIds = mockTrackedItemsByParent.items.map(({itemId}) => itemId)
      result.current.removeParentFromChildren(childrenIds)

      expect(getParentIssuesFromChildrenStub).toHaveBeenCalledTimes(1)
      expect(getParentIssuesFromChildrenStub).toHaveBeenCalledWith(childrenIds)
      expect(removeParentIssuesStub).toHaveBeenCalledTimes(1)
      expect(removeParentIssuesStub).toHaveBeenCalledWith([PARENT_ISSUE_ID])
      expect(getAllProjectRelationshipsStub).not.toHaveBeenCalled()
    })

    it('should fallback to all project parent relationships if no parent from children found', () => {
      const childrenIds = mockTrackedItemsByParent.items.map(({itemId}) => itemId)

      const removeParentIssuesStub = jest.fn()
      const getAllProjectRelationshipsStub = jest.fn().mockReturnValue(new Map([[PARENT_ISSUE_ID, childrenIds]]))
      const getParentIssuesFromChildrenStub = jest.fn().mockReturnValue([])

      const {result} = setupAndRender({
        trackedByItemsContext: {
          removeParentIssues: removeParentIssuesStub,
          getAllProjectRelationships: getAllProjectRelationshipsStub,
        },
        trackedByParentMockHook: {
          getParentIssuesFromChildren: getParentIssuesFromChildrenStub,
        },
      })

      result.current.removeParentFromChildren(childrenIds)

      expect(getParentIssuesFromChildrenStub).toHaveBeenCalledTimes(1)
      expect(getParentIssuesFromChildrenStub).toHaveBeenCalledWith(childrenIds)
      expect(getAllProjectRelationshipsStub).toHaveBeenCalledTimes(1)
      expect(removeParentIssuesStub).toHaveBeenCalledTimes(1)
      expect(removeParentIssuesStub).toHaveBeenCalledWith([PARENT_ISSUE_ID])
    })
  })

  describe('setChildParentRelationship', () => {
    it('should set child parent relationship', () => {
      const getParentStub = jest.fn().mockReturnValue(mockTrackedItemsByParent)
      const getParentIssuesFromChildrenStub = jest.fn().mockReturnValue([PARENT_ISSUE_ID])
      const setChildTrackedByParentStub = jest.fn()
      const removeParentIssuesStub = jest.fn()

      const {result} = setupAndRender({
        trackedByItemsContext: {
          setChildTrackedByParent: setChildTrackedByParentStub,
          removeParentIssues: removeParentIssuesStub,
        },
        trackedByParentMockHook: {
          getParentIssuesFromChildren: getParentIssuesFromChildrenStub,
          getParent: getParentStub,
        },
      })

      const childrenIds = mockTrackedItemsByParent.items.map(({itemId}) => itemId)
      const childId = first(childrenIds)!

      result.current.setChildParentRelationship(childId)

      expect(getParentIssuesFromChildrenStub).toHaveBeenCalledTimes(2)
      expect(getParentIssuesFromChildrenStub).toHaveBeenCalledWith([childId])

      expect(getParentStub).toHaveBeenCalledTimes(1)
      expect(getParentStub).toHaveBeenCalledWith(PARENT_ISSUE_ID)

      expect(setChildTrackedByParentStub).toHaveBeenCalledTimes(1)
      expect(setChildTrackedByParentStub).toHaveBeenCalledWith(PARENT_ISSUE_ID, childrenIds)

      expect(removeParentIssuesStub).toHaveBeenCalledTimes(1)
      expect(removeParentIssuesStub).toHaveBeenCalledWith([PARENT_ISSUE_ID])
    })
  })

  describe('getIssueIdsToRemove', () => {
    it('should return an array if issue ids to remove from project items', () => {
      const memexTrackedByItem = createMemexItemModel(DefaultTrackedByIssue)
      const findMemexItemStub = jest.fn().mockReturnValue(memexTrackedByItem)

      const {result} = setupAndRender({
        findMemexItemMockHook: {findMemexItem: findMemexItemStub},
      })

      expect(result.current.getIssuesIdsToRemove([memexTrackedByItem.id])).toEqual([DefaultTrackedByIssue.id])
      expect(findMemexItemStub).toHaveBeenCalledTimes(1)
    })

    it.each([
      {ids: [], desc: 'no ids'},
      {ids: [100, 200], desc: 'ids not to remove'},
    ])('should return an empty array when there are $desc', ({ids}) => {
      const {result} = setupAndRender()

      expect(result.current.getIssuesIdsToRemove(ids)).toEqual([])
    })
  })
})
