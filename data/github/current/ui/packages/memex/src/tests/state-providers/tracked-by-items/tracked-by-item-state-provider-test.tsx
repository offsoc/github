import {act, renderHook, waitFor} from '@testing-library/react'

import {apiGetItemsTrackedByParent} from '../../../client/api/memex-items/api-get-items-tracked-by-parent'
import type {GetItemsTrackedByParentResponse} from '../../../client/api/memex-items/contracts'
import {useFindMemexItem} from '../../../client/state-providers/memex-items/use-find-memex-item'
import {useMemexItems} from '../../../client/state-providers/memex-items/use-memex-items'
import {useTrackedByItemsContext} from '../../../client/state-providers/tracked-by-items/use-tracked-by-items-context'
import {DefaultTrackedByIssue} from '../../../mocks/memex-items'
import {ComplexFeatureTrackedItem, StyleNitpickTrackedItem} from '../../../mocks/memex-items/tracked-issues'
import {createMemexItemModel} from '../../mocks/models/memex-item-model'
import {asMockHook} from '../../mocks/stub-utilities'
import {createTrackedByItemsStateProviderWrapper, mockTrackedItemsByParent} from './helpers'

jest.mock('../../../client/api/memex-items/api-get-items-tracked-by-parent')
jest.mock('../../../client/state-providers/memex-items/use-find-memex-item')
jest.mock('../../../client/state-providers/memex-items/use-memex-items')

const mockedApiGetItemsTrackedByParent = jest.mocked(apiGetItemsTrackedByParent)

describe('TrackedByItemsStateProvider', () => {
  beforeEach(() => {
    asMockHook(useMemexItems).mockReturnValue({items: []})
    mockedApiGetItemsTrackedByParent.mockImplementationOnce(() => Promise.resolve(mockTrackedItemsByParent))
    asMockHook(useFindMemexItem).mockReturnValue({findMemexItem: jest.fn()})
  })

  afterEach(() => {
    mockedApiGetItemsTrackedByParent.mockReset()
  })

  it('should initialize "parentIssuesById" local state with an empty map', () => {
    const {result} = renderHook(useTrackedByItemsContext, {
      wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
    })
    expect(result.current.parentIssuesById).toEqual(new Map())
  })

  it('should initialize "parentIssuesByIdRef" with a map that keeps track of the local state', () => {
    const {result} = renderHook(useTrackedByItemsContext, {
      wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
    })

    const {parentIssuesById, parentIssuesByIdRef} = result.current

    expect(parentIssuesById).toEqual(new Map())
    expect(parentIssuesByIdRef.current).toEqual(parentIssuesById)
  })

  it('should prefill "projectIssuesByIdRef" with existing items from the Memex project', async () => {
    const memexTrackedByItem = createMemexItemModel(DefaultTrackedByIssue)

    asMockHook(useMemexItems).mockReturnValue({
      items: [memexTrackedByItem],
    })

    const findMemexItemStub = jest.fn().mockReturnValue(memexTrackedByItem)
    asMockHook(useFindMemexItem).mockReturnValue({
      findMemexItem: findMemexItemStub,
    })

    const {result} = renderHook(useTrackedByItemsContext, {
      wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
    })

    await waitFor(() => result.current.getAllProjectRelationships().size === 2)

    expect(findMemexItemStub).toHaveBeenCalledWith(memexTrackedByItem.id)
    expect(result.current.getAllProjectRelationships()).toEqual(
      new Map([
        [ComplexFeatureTrackedItem.key.itemId, [DefaultTrackedByIssue.id]],
        [StyleNitpickTrackedItem.key.itemId, [DefaultTrackedByIssue.id]],
      ]),
    )
  })

  describe('getChildrenTrackedByParent', () => {
    it('gets "Tracked By" data from the server and returns items tracked by parent', async () => {
      const {result} = renderHook(useTrackedByItemsContext, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      // mock server call to get the tracked by data into the state provider
      let childrenTrackedByParentResult: GetItemsTrackedByParentResponse | undefined

      await act(async () => {
        childrenTrackedByParentResult = await result.current.getChildrenTrackedByParent(1)
      })

      const {parentIssuesById} = result.current
      expect(parentIssuesById.get(1)).toEqual(mockTrackedItemsByParent)
      expect(childrenTrackedByParentResult).toEqual(parentIssuesById.get(1))
    })

    it('prevents multiple calls with the same parent id to the server', async () => {
      const {result} = renderHook(useTrackedByItemsContext, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      // mock server call to get the tracked by data into the state provider
      await act(async () => {
        await Promise.all(new Array(5).fill(1).map(id => result.current.getChildrenTrackedByParent(id)))
      })

      expect(mockedApiGetItemsTrackedByParent).toHaveBeenCalledTimes(1)
    })

    it('should set the value for a parent id to undefined in case of server error', async () => {
      mockedApiGetItemsTrackedByParent.mockReset()
      mockedApiGetItemsTrackedByParent.mockImplementationOnce(() => Promise.reject(new Error('boom!')))

      const {result} = renderHook(useTrackedByItemsContext, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      await act(async () => {
        await result.current.getChildrenTrackedByParent(1)
      })

      expect(result.current.parentIssuesById.get(1)).toBeFalsy()
    })
  })

  describe('removeParentIssues', () => {
    it('should remove parent issues from local state', async () => {
      const {result} = renderHook(useTrackedByItemsContext, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      await act(async () => {
        await result.current.getChildrenTrackedByParent(1)
      })

      // assert local state is initialized with the correct value
      expect(result.current.parentIssuesById.get(1)).toEqual(mockTrackedItemsByParent)

      act(() => {
        result.current.removeParentIssues([1])
      })

      const {parentIssuesById, parentIssuesByIdRef} = result.current

      expect(parentIssuesById.has(1)).toBeFalsy()
      expect(parentIssuesById).toEqual(parentIssuesByIdRef.current)
    })

    it('should return a rollback function to revert removals to the previous state', async () => {
      const {result} = renderHook(useTrackedByItemsContext, {
        wrapper: createTrackedByItemsStateProviderWrapper().trackedByWrapper,
      })

      await act(async () => {
        await result.current.getChildrenTrackedByParent(1)
      })

      // assert local state is initialized with the correct value
      expect(result.current.parentIssuesById.get(1)).toEqual(mockTrackedItemsByParent)

      let rollback!: () => void

      act(() => {
        rollback = result.current.removeParentIssues([1])
      })

      expect(result.current.parentIssuesById.has(1)).toBeFalsy()
      expect(rollback).toBeDefined()
      expect(typeof rollback).toBe('function')

      act(() => {
        rollback()
      })

      expect(result.current.parentIssuesById.get(1)).toEqual(mockTrackedItemsByParent)
    })
  })
})
