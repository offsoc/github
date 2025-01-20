import {renderHook} from '@testing-library/react'

import {useTrackedByItemsContext} from '../../../client/state-providers/tracked-by-items/use-tracked-by-items-context'
import {useTrackedByParent} from '../../../client/state-providers/tracked-by-items/use-tracked-by-parent'
import {asMockHook} from '../../mocks/stub-utilities'
import {createTrackedByItemsStateProviderWrapper, mockTrackedItemsByParent} from './helpers'

jest.mock('../../../client/state-providers/tracked-by-items/use-tracked-by-items-context')

const PARENT_ISSUE_ID = 1

describe('useTrackedByParent', () => {
  beforeEach(() => {
    asMockHook(useTrackedByItemsContext).mockReturnValue({
      parentIssuesByIdRef: {current: new Map([[PARENT_ISSUE_ID, mockTrackedItemsByParent]])},
    })
  })

  describe('getParent', () => {
    it('should return "GetItemsTrackedByParentResponse" by parent id', () => {
      const {result} = renderHook(useTrackedByParent, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      expect(result.current.getParent(1)).toEqual(mockTrackedItemsByParent)
    })

    it('should return undefined if the parent is not available in the local state', () => {
      const {result} = renderHook(useTrackedByParent, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      expect(result.current.getParent(10)).toBeFalsy()
    })
  })

  describe('getChildrenIssuesForParent', () => {
    it('should return an array of child issues by the parent Issue id', () => {
      const {result} = renderHook(useTrackedByParent, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      expect(result.current.getChildrenIssuesForParent(1)).toEqual(mockTrackedItemsByParent.items)
    })

    it('should return an empty array if the parent Issue is not yet tracked for', () => {
      const {result} = renderHook(useTrackedByParent, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      expect(result.current.getChildrenIssuesForParent(10)).toEqual([])
    })
  })

  describe('getParentIssuesFromChildren', () => {
    it('should return a list of parent Issues by Id from children Issues tracked by the Parent Issue', () => {
      const {result} = renderHook(useTrackedByParent, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      expect(
        result.current.getParentIssuesFromChildren(mockTrackedItemsByParent.items.map(issue => issue.itemId)),
      ).toEqual([PARENT_ISSUE_ID])
    })

    it('should reutrn an empty array if there are no parent Issues for a list of children', () => {
      const {result} = renderHook(useTrackedByParent, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      expect(result.current.getParentIssuesFromChildren([10, 20, 30])).toEqual([])
    })
  })
})
