import {act, renderHook} from '@testing-library/react'

import {apiRemoveItems} from '../../../client/api/memex-items/api-remove-items'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {ApiError} from '../../../client/platform/api-error'
import {getMemexItemModelsFromQueryClient} from '../../../client/state-providers/memex-items/query-client-api/memex-items'
import {useRemoveMemexItems} from '../../../client/state-providers/memex-items/use-remove-memex-items'
import {useRemoveParentIssues} from '../../../client/state-providers/tracked-by-items/use-remove-parent-issues'
import {DefaultClosedIssue, DefaultOpenIssue} from '../../../mocks/memex-items'
import {stubRejectedApiResponse, stubResolvedApiResponse} from '../../mocks/api/memex'
import {createMockToastContainer} from '../../mocks/components/toast-container'
import {createArchiveStatusContext} from '../../mocks/state-providers/archive-status-context'
import {
  createTrackedByItemsContext,
  createTrackedByItemsStableContext,
} from '../../mocks/state-providers/memex-items-tracked-by-context'
import {createSuggestionsStableContext} from '../../mocks/state-providers/suggestions-context'
import {asMockHook} from '../../mocks/stub-utilities'
import {createTestQueryClient} from '../../test-app-wrapper'
import {createWrapperWithContexts} from '../../wrapper-utils'

jest.mock('../../../client/hooks/use-enabled-features')
jest.mock('../../../client/state-providers/tracked-by-items/use-remove-parent-issues')
jest.mock('../../../client/api/memex-items/api-remove-items')

describe('useRemoveMemexItems', () => {
  let getIssueIdsToRemoveStub: jest.Mock
  let removeParentFromChildrenStub: jest.Mock

  beforeEach(() => {
    getIssueIdsToRemoveStub = jest.fn()
    removeParentFromChildrenStub = jest.fn()

    asMockHook(useEnabledFeatures).mockReturnValue({
      tasklist_block: false,
    })

    asMockHook(useRemoveParentIssues).mockReturnValue({
      getIssuesIdsToRemove: getIssueIdsToRemoveStub,
      removeParentFromChildren: removeParentFromChildrenStub,
    })
  })

  it('calls memex item client with ids to remove', async () => {
    const removeItemsStub = stubResolvedApiResponse(apiRemoveItems, void 0)
    const queryClient = createTestQueryClient()
    const removeSuggestionsStub = jest.fn()

    const firstItem = createMemexItemModel(DefaultClosedIssue)
    const secondItem = createMemexItemModel(DefaultOpenIssue)
    const {result} = renderHook(useRemoveMemexItems, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: [firstItem, secondItem]},
        SuggestionsStable: createSuggestionsStableContext({removeSuggestions: removeSuggestionsStub}),
        TrackedByItemsStable: createTrackedByItemsStableContext(),
        TrackedByItems: createTrackedByItemsContext(),
        ArchiveStatus: createArchiveStatusContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    await act(async () => {
      await result.current.removeMemexItems([DefaultClosedIssue.id, DefaultOpenIssue.id])
    })

    expect(removeItemsStub).toHaveBeenCalledWith({memexProjectItemIds: [DefaultClosedIssue.id, DefaultOpenIssue.id]})
    expect(removeSuggestionsStub).toHaveBeenCalledWith([
      `Issue:${DefaultClosedIssue.id}`,
      `Issue:${DefaultOpenIssue.id}`,
    ])

    const itemsAfterRemoval = getMemexItemModelsFromQueryClient(queryClient)
    expect(itemsAfterRemoval).toEqual([])
  })

  it('does not call removeItems api if no ids passed', async () => {
    const removeItemsStub = stubResolvedApiResponse(apiRemoveItems, void 0)
    const queryClient = createTestQueryClient()
    const firstItem = createMemexItemModel(DefaultClosedIssue)

    const {result} = renderHook(useRemoveMemexItems, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: [firstItem]},
        SuggestionsStable: createSuggestionsStableContext(),
        ArchiveStatus: createArchiveStatusContext(),
        TrackedByItemsStable: createTrackedByItemsStableContext(),
        TrackedByItems: createTrackedByItemsContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    await act(async () => {
      await result.current.removeMemexItems([])
    })

    expect(removeItemsStub).not.toHaveBeenCalled()

    const itemsAfterRemoval = getMemexItemModelsFromQueryClient(queryClient)
    expect(itemsAfterRemoval).toEqual([firstItem])
  })

  it('rolls back optimistic update if remove api request throws an error', async () => {
    stubRejectedApiResponse(apiRemoveItems, new ApiError('remove items rejected'))

    const itemModel1 = createMemexItemModel(DefaultClosedIssue)
    const itemModel2 = createMemexItemModel(DefaultOpenIssue)
    const queryClient = createTestQueryClient()
    const mockToastContainer = createMockToastContainer()

    const {result} = renderHook(useRemoveMemexItems, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: [itemModel1, itemModel2]},
        SuggestionsStable: createSuggestionsStableContext(),
        ArchiveStatus: createArchiveStatusContext(),
        TrackedByItemsStable: createTrackedByItemsStableContext(),
        TrackedByItems: createTrackedByItemsContext(),
        ToastContainer: mockToastContainer,
      }),
    })

    await result.current.removeMemexItems([DefaultClosedIssue.id, DefaultOpenIssue.id])

    // Items should be the same as we rolled back the optimistic update
    const itemsAfterRollback = getMemexItemModelsFromQueryClient(queryClient)
    expect(itemsAfterRollback).toEqual([itemModel1, itemModel2])
    expect(mockToastContainer.addToast).toHaveBeenCalledWith({type: 'error', message: 'remove items rejected'})
  })

  describe('remove parent from children', () => {
    it('should removes parent from children when feature flags are enabled', async () => {
      const removeItemsStub = stubResolvedApiResponse(apiRemoveItems, void 0)
      const queryClient = createTestQueryClient()

      getIssueIdsToRemoveStub.mockReturnValue([DefaultClosedIssue.content.id, DefaultOpenIssue.content.id])

      asMockHook(useEnabledFeatures).mockReturnValue({
        tasklist_block: true,
      })

      const firstItem = createMemexItemModel(DefaultClosedIssue)
      const secondItem = createMemexItemModel(DefaultOpenIssue)
      const {result} = renderHook(useRemoveMemexItems, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: [firstItem, secondItem]},
          SuggestionsStable: createSuggestionsStableContext(),
          TrackedByItemsStable: createTrackedByItemsStableContext(),
          TrackedByItems: createTrackedByItemsContext(),
          ArchiveStatus: createArchiveStatusContext(),
          ToastContainer: createMockToastContainer(),
        }),
      })

      await act(async () => {
        await result.current.removeMemexItems([DefaultClosedIssue.id, DefaultOpenIssue.id])
      })

      expect(removeItemsStub).toHaveBeenCalledWith({memexProjectItemIds: [DefaultClosedIssue.id, DefaultOpenIssue.id]})

      const itemsAfterRemoval = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterRemoval).toEqual([])

      expect(removeParentFromChildrenStub).toHaveBeenCalledTimes(1)
      expect(removeParentFromChildrenStub).toHaveBeenCalledWith([
        DefaultClosedIssue.content.id,
        DefaultOpenIssue.content.id,
      ])
    })

    it('should "NOT" remove parent from children when feature flags are disabled', async () => {
      const removeItemsStub = stubResolvedApiResponse(apiRemoveItems, void 0)
      const queryClient = createTestQueryClient()

      getIssueIdsToRemoveStub.mockReturnValue([DefaultClosedIssue.content.id, DefaultOpenIssue.content.id])

      asMockHook(useEnabledFeatures).mockReturnValue({
        tasklist_block: false,
      })

      const firstItem = createMemexItemModel(DefaultClosedIssue)
      const secondItem = createMemexItemModel(DefaultOpenIssue)
      const {result} = renderHook(useRemoveMemexItems, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: [firstItem, secondItem]},
          SuggestionsStable: createSuggestionsStableContext(),
          TrackedByItemsStable: createTrackedByItemsStableContext(),
          TrackedByItems: createTrackedByItemsContext(),
          ArchiveStatus: createArchiveStatusContext(),
          ToastContainer: createMockToastContainer(),
        }),
      })

      await act(async () => {
        await result.current.removeMemexItems([DefaultClosedIssue.id, DefaultOpenIssue.id])
      })

      expect(removeItemsStub).toHaveBeenCalledWith({memexProjectItemIds: [DefaultClosedIssue.id, DefaultOpenIssue.id]})

      const itemsAfterRemoval = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterRemoval).toEqual([])

      expect(removeParentFromChildrenStub).not.toHaveBeenCalled()
    })
  })
})
