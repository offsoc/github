import {act, renderHook} from '@testing-library/react'

import {apiArchiveItems} from '../../../client/api/memex-items/api-archive-items'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {ApiError} from '../../../client/platform/api-error'
import {getMemexItemModelsFromQueryClient} from '../../../client/state-providers/memex-items/query-client-api/memex-items'
import {useArchiveMemexItems} from '../../../client/state-providers/memex-items/use-archive-memex-items'
import {useRemoveParentIssues} from '../../../client/state-providers/tracked-by-items/use-remove-parent-issues'
import {DefaultClosedIssue, DefaultOpenIssue, DefaultRedactedItem} from '../../../mocks/memex-items'
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
jest.mock('../../../client/api/memex-items/api-archive-items')

describe('useArchiveMemexItems', () => {
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

  it('calls memex item client with ids to archive', async () => {
    const archiveItemsStub = stubResolvedApiResponse(apiArchiveItems, void 0)

    const itemModel1 = createMemexItemModel(DefaultClosedIssue)
    const itemModel2 = createMemexItemModel(DefaultOpenIssue)
    const queryClient = createTestQueryClient()

    const {result} = renderHook(useArchiveMemexItems, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: [itemModel1, itemModel2]},
        SuggestionsStable: createSuggestionsStableContext(),
        ArchiveStatus: createArchiveStatusContext(),
        TrackedByItemsStable: createTrackedByItemsStableContext(),
        TrackedByItems: createTrackedByItemsContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    await act(async () => {
      await result.current.archiveMemexItems([itemModel1.id, itemModel2.id])
    })

    expect(archiveItemsStub).toHaveBeenCalledWith({memexProjectItemIds: [itemModel1.id, itemModel2.id]})

    const itemsAfterArchive = getMemexItemModelsFromQueryClient(queryClient)
    expect(itemsAfterArchive).toEqual([])
  })

  it('does nothing if no archivable items are passed', async () => {
    const archiveItemsStub = stubResolvedApiResponse(apiArchiveItems, void 0)
    const itemModel1 = createMemexItemModel(DefaultRedactedItem)
    const queryClient = createTestQueryClient()

    const {result} = renderHook(useArchiveMemexItems, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: [itemModel1]},
        SuggestionsStable: createSuggestionsStableContext(),
        ArchiveStatus: createArchiveStatusContext(),
        TrackedByItemsStable: createTrackedByItemsStableContext(),
        TrackedByItems: createTrackedByItemsContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    await act(async () => {
      await result.current.archiveMemexItems([DefaultRedactedItem.id])
    })

    expect(archiveItemsStub).not.toHaveBeenCalled()
    const itemsAfterArchiveAttempt = getMemexItemModelsFromQueryClient(queryClient)
    expect(itemsAfterArchiveAttempt).toEqual([itemModel1])
  })

  it('rolls back optimistic update if archive api request throws an error', async () => {
    stubRejectedApiResponse(apiArchiveItems, new ApiError('archive items rejected'))

    const itemModel1 = createMemexItemModel(DefaultClosedIssue)
    const itemModel2 = createMemexItemModel(DefaultOpenIssue)
    const queryClient = createTestQueryClient()
    const mockToastContainer = createMockToastContainer()

    const {result} = renderHook(useArchiveMemexItems, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: [itemModel1, itemModel2]},
        SuggestionsStable: createSuggestionsStableContext(),
        ArchiveStatus: createArchiveStatusContext(),
        TrackedByItemsStable: createTrackedByItemsStableContext(),
        TrackedByItems: createTrackedByItemsContext(),
        ToastContainer: mockToastContainer,
      }),
    })

    await result.current.archiveMemexItems([DefaultClosedIssue.id, DefaultOpenIssue.id])

    // Items should be the same as we rolled back the optimistic update
    const itemsAfterRollback = getMemexItemModelsFromQueryClient(queryClient)
    expect(itemsAfterRollback).toEqual([itemModel1, itemModel2])
    expect(mockToastContainer.addToast).toHaveBeenCalledWith({type: 'error', message: 'archive items rejected'})
  })

  describe('remove parent from children', () => {
    it('should invoke "removeParentFromChildren" when tracked by feature flags are enabled', async () => {
      const archiveItemsStub = stubResolvedApiResponse(apiArchiveItems, void 0)
      const itemModel = createMemexItemModel(DefaultOpenIssue)
      const queryClient = createTestQueryClient()

      getIssueIdsToRemoveStub.mockReturnValue([DefaultOpenIssue.content.id])

      asMockHook(useEnabledFeatures).mockReturnValue({
        tasklist_block: true,
      })

      const {result} = renderHook(useArchiveMemexItems, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: [itemModel]},
          SuggestionsStable: createSuggestionsStableContext(),
          ArchiveStatus: createArchiveStatusContext(),
          TrackedByItemsStable: createTrackedByItemsStableContext(),
          TrackedByItems: createTrackedByItemsContext(),
          ToastContainer: createMockToastContainer(),
        }),
      })

      await act(async () => {
        await result.current.archiveMemexItems([itemModel.id])
      })

      expect(archiveItemsStub).toHaveBeenCalledWith({memexProjectItemIds: [itemModel.id]})

      const itemsAfterArchive = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterArchive).toEqual([])

      expect(getIssueIdsToRemoveStub).toHaveBeenCalledTimes(1)
      expect(getIssueIdsToRemoveStub).toHaveBeenCalledWith([itemModel.id])
      expect(removeParentFromChildrenStub).toHaveBeenCalledTimes(1)
      expect(removeParentFromChildrenStub).toHaveBeenCalledWith([DefaultOpenIssue.content.id])
    })

    it('should "NOT" invoke "removeParentFromChildren" when tracked by feature flags are disabled', async () => {
      const archiveItemsStub = stubResolvedApiResponse(apiArchiveItems, void 0)
      const itemModel = createMemexItemModel(DefaultOpenIssue)
      const queryClient = createTestQueryClient()

      getIssueIdsToRemoveStub.mockReturnValue([DefaultOpenIssue.content.id])

      asMockHook(useEnabledFeatures).mockReturnValue({
        tasklist_block: false,
      })

      const {result} = renderHook(useArchiveMemexItems, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: [itemModel]},
          SuggestionsStable: createSuggestionsStableContext(),
          ArchiveStatus: createArchiveStatusContext(),
          TrackedByItemsStable: createTrackedByItemsStableContext(),
          TrackedByItems: createTrackedByItemsContext(),
          ToastContainer: createMockToastContainer(),
        }),
      })

      await act(async () => {
        await result.current.archiveMemexItems([itemModel.id])
      })

      expect(archiveItemsStub).toHaveBeenCalledWith({memexProjectItemIds: [itemModel.id]})

      const itemsAfterArchive = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterArchive).toEqual([])

      expect(getIssueIdsToRemoveStub).toHaveBeenCalledTimes(1)
      expect(getIssueIdsToRemoveStub).toHaveBeenCalledWith([itemModel.content.id])
      expect(removeParentFromChildrenStub).not.toHaveBeenCalled()
    })
  })
})
