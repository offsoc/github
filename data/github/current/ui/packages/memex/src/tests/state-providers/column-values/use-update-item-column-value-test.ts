import {act, renderHook} from '@testing-library/react'

import {MemexColumnDataType, SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {apiUpdateItem} from '../../../client/api/memex-items/api-update-item'
import type {UpdateMemexItemActions} from '../../../client/models/memex-item-model'
import {fetchJSONWith} from '../../../client/platform/functional-fetch-wrapper'
import {useUpdateItemColumnValue} from '../../../client/state-providers/column-values/use-update-item-column-value'
import {useFindLoadedFieldIds} from '../../../client/state-providers/columns/use-find-loaded-field-ids'
import {mostRecentUpdateSingleton} from '../../../client/state-providers/data-refresh/most-recent-update'
import {pendingUpdatesSingleton} from '../../../client/state-providers/data-refresh/pending-updates'
import {useHandlePaginatedDataRefresh} from '../../../client/state-providers/data-refresh/use-handle-paginated-data-refresh'
import {useSetMemexItemData} from '../../../client/state-providers/memex-items/use-set-memex-item-data'
import {getLabel} from '../../../mocks/data/labels'
import {getMilestoneByRepository} from '../../../mocks/data/milestones'
import {getUser} from '../../../mocks/data/users'
import {
  DefaultDraftIssue,
  DefaultOpenIssue,
  DefaultOpenPullRequest,
  DefaultRedactedItem,
} from '../../../mocks/memex-items'
import {stubRejectedApiResponse, stubResolvedApiResponse} from '../../mocks/api/memex'
import {createMemexItemModel, stubSetColumnValueForItemColumnType} from '../../mocks/models/memex-item-model'
import {asMockFunction, asMockHook} from '../../mocks/stub-utilities'

jest.mock('../../../client/state-providers/memex-items/use-set-memex-item-data')
jest.mock('../../../client/api/memex-items/api-update-item')
jest.mock('../../../client/state-providers/columns/use-find-loaded-field-ids')
jest.mock('../../../client/state-providers/data-refresh/most-recent-update')
jest.mock('../../../client/state-providers/data-refresh/pending-updates')
jest.mock('../../../client/state-providers/data-refresh/use-handle-paginated-data-refresh')
jest.mock('../../../client/platform/functional-fetch-wrapper')

const LOADED_FIELD_IDS = [SystemColumnId.Title]

describe('useUpdateItemColumnValue', () => {
  let setItemDataStub: jest.Mock
  let rerenderItemsStub: jest.Mock
  let findLoadedFieldIdsStub: jest.Mock
  let handleCancelFetchDataStub: jest.Mock

  beforeEach(() => {
    setItemDataStub = jest.fn()
    rerenderItemsStub = jest.fn()
    asMockHook(useSetMemexItemData).mockReturnValue({
      setItemData: setItemDataStub,
      setItemsStateFromModels: rerenderItemsStub,
    })
    findLoadedFieldIdsStub = jest.fn().mockReturnValue(LOADED_FIELD_IDS)
    asMockHook(useFindLoadedFieldIds).mockReturnValue({
      findLoadedFieldIds: findLoadedFieldIdsStub,
    })
    handleCancelFetchDataStub = jest.fn().mockReturnValue(LOADED_FIELD_IDS)
    asMockHook(useHandlePaginatedDataRefresh).mockReturnValue({
      handleCancelFetchData: handleCancelFetchDataStub,
    })
  })

  describe('updateColumnValueAndPriority', () => {
    it('should send the expected payload to the server when the new format is used for update', async () => {
      const memexProjectItem = DefaultOpenIssue

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const updateItemStub = stubResolvedApiResponse(apiUpdateItem, {memexProjectItem})

      const {result} = renderHook(useUpdateItemColumnValue)

      await act(async () => {
        await result.current.updateColumnValueAndPriority(memexItemModel, {
          columnValues: [
            {
              dataType: MemexColumnDataType.Title,
              value: {
                title: {raw: 'some raw text', html: 'some raw text'},
              },
            },
          ],
        })
      })

      for (const stub of [updateColumnValueStub, updateItemStub, setItemDataStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      expect(updateItemStub).toHaveBeenCalledWith({
        memexProjectItemId: memexProjectItem.id,
        fieldIds: LOADED_FIELD_IDS,
        previousMemexProjectItemId: undefined,
        memexProjectColumnValues: [{memexProjectColumnId: SystemColumnId.Title, value: {title: 'some raw text'}}],
      })
    })

    it("should update an item's priority", async () => {
      const memexProjectItem = DefaultOpenIssue

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const newPriority = 1
      const updateItemStub = stubResolvedApiResponse(apiUpdateItem, {
        memexProjectItem: {...memexProjectItem, priority: newPriority},
      })

      const {result} = renderHook(useUpdateItemColumnValue)

      await act(async () => {
        await result.current.updateColumnValueAndPriority(memexItemModel, {
          columnValues: [
            {
              dataType: MemexColumnDataType.Title,
              value: {
                title: {raw: 'some raw text', html: 'some raw text'},
              },
            },
          ],
        })
      })

      for (const stub of [updateColumnValueStub, updateItemStub, setItemDataStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      expect(setItemDataStub).toHaveBeenCalledWith(expect.objectContaining({priority: newPriority}))
    })

    it('should manage properties relevant to live updates', async () => {
      const memexProjectItem = DefaultOpenIssue

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const updatedAt = Date.now()

      const newPriority = 1
      // For this test, we want to call the actual update item api, so instead of mocking it, we mock the fetch
      // method it uses
      stubResolvedApiResponse(fetchJSONWith, {
        headers: new Headers(),
        ok: true,
        data: {memexProjectItem: {...memexProjectItem, priority: newPriority, updatedAt: new Date(updatedAt)}},
      })
      // make sure we restore the api-update-item once for just this test
      const updateItemActual = jest.requireActual('../../../client/api/memex-items/api-update-item').apiUpdateItem
      asMockFunction(apiUpdateItem).mockImplementationOnce(updateItemActual)

      const {result} = renderHook(useUpdateItemColumnValue)

      await act(async () => {
        await result.current.updateColumnValueAndPriority(memexItemModel, {
          columnValues: [
            {
              dataType: MemexColumnDataType.Title,
              value: {
                title: {raw: 'some raw text', html: 'some raw text'},
              },
            },
          ],
        })
      })

      for (const stub of [
        updateColumnValueStub,
        handleCancelFetchDataStub,
        pendingUpdatesSingleton.increment,
        pendingUpdatesSingleton.decrement,
      ]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      expect(mostRecentUpdateSingleton.set).toHaveBeenCalledWith(updatedAt)
      expect(setItemDataStub).toHaveBeenCalledWith(expect.objectContaining({priority: newPriority}))
    })

    it('should update an items position based on previousMemexProjectItemId', async () => {
      const memexProjectItem = DefaultOpenIssue

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const newPriority = 1
      const updateItemStub = stubResolvedApiResponse(apiUpdateItem, {
        memexProjectItem: {...memexProjectItem, priority: newPriority},
      })

      const {result} = renderHook(useUpdateItemColumnValue)

      const previousMemexProjectItemId = 2676441
      await act(async () => {
        await result.current.updateColumnValueAndPriority(memexItemModel, {
          previousMemexProjectItemId,
        })
      })

      expect(updateColumnValueStub).not.toHaveBeenCalled()
      for (const stub of [updateItemStub, setItemDataStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      expect(updateItemStub).toHaveBeenCalledWith({
        memexProjectItemId: memexProjectItem.id,
        fieldIds: LOADED_FIELD_IDS,
        previousMemexProjectItemId,
        memexProjectColumnValues: [],
      })
    })

    it('should restore existing values when there are server errors', async () => {
      const memexProjectItem = DefaultOpenIssue

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const error = new Error('User does not have permission to set milestones')
      const updateItemStub = stubRejectedApiResponse(apiUpdateItem, error)

      const {result} = renderHook(useUpdateItemColumnValue)

      const currentValue = memexItemModel.columns[SystemColumnId.Milestone]
      expect(currentValue).not.toBeUndefined()

      const prevMilestone = memexItemModel.columns.Milestone
      const newMilestone = getMilestoneByRepository(1, 3)

      await act(async () => {
        await expect(
          result.current.updateColumnValueAndPriority(memexItemModel, {
            columnValues: [
              {
                dataType: MemexColumnDataType.Milestone,
                value: newMilestone,
              },
            ],
          }),
        ).rejects.toEqual(error)
      })

      expect(updateColumnValueStub).toHaveBeenCalledTimes(2)
      expect(updateItemStub).toHaveBeenCalledTimes(1)
      expect(setItemDataStub).not.toHaveBeenCalled()

      expect(memexItemModel.columns[SystemColumnId.Milestone]).toEqual(currentValue)
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(1, {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: newMilestone,
      })
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(2, {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: prevMilestone,
      })
    })

    it('should ignore an update if the request column value is falsy', async () => {
      const memexProjectItem = DefaultOpenIssue

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const updateItemStub = stubResolvedApiResponse(apiUpdateItem, {memexProjectItem})

      const {result} = renderHook(useUpdateItemColumnValue)

      await act(async () => {
        await result.current.updateColumnValueAndPriority(memexItemModel, {} as UpdateMemexItemActions)
      })

      for (const stub of [updateColumnValueStub, updateItemStub, setItemDataStub]) {
        expect(stub).not.toHaveBeenCalled()
      }
    })

    it('should ignore an update for redacted items', async () => {
      const memexProjectItem = DefaultRedactedItem

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const updateItemStub = stubResolvedApiResponse(apiUpdateItem, {memexProjectItem})

      const {result} = renderHook(useUpdateItemColumnValue)

      await act(async () => {
        await result.current.updateColumnValueAndPriority(memexItemModel, {
          columnValues: [
            {
              dataType: MemexColumnDataType.Title,
              value: {
                title: {raw: 'update title', html: 'update title'},
              },
            },
          ],
        })
      })

      for (const stub of [updateColumnValueStub, updateItemStub, setItemDataStub]) {
        expect(stub).not.toHaveBeenCalled()
      }
    })

    describe('title updates', () => {
      it.each([{item: DefaultDraftIssue}, {item: DefaultOpenIssue}, {item: DefaultOpenPullRequest}])(
        'should update the title for a $item.contentType',
        async ({item}) => {
          const updateColumnValueStub = stubSetColumnValueForItemColumnType()
          const memexItemModel = createMemexItemModel(item, {
            setColumnValueForItemColumnType: updateColumnValueStub,
          })

          const updateItemStub = stubResolvedApiResponse(apiUpdateItem, {memexProjectItem: item})

          const {result} = renderHook(useUpdateItemColumnValue)

          const expected = {raw: 'update title', html: 'update title'}
          await act(async () => {
            await result.current.updateColumnValueAndPriority(memexItemModel, {
              columnValues: [
                {
                  dataType: MemexColumnDataType.Title,
                  value: {
                    title: expected,
                  },
                },
              ],
            })
          })

          for (const stub of [updateColumnValueStub, updateItemStub, setItemDataStub]) {
            expect(stub).toHaveBeenCalledTimes(1)
          }

          expect(updateColumnValueStub).toHaveBeenCalledWith({
            memexProjectColumnId: SystemColumnId.Title,
            value: {title: expected},
          })
        },
      )
    })
  })

  describe('updateMultipleSequentially', () => {
    it('should update multiple column values for an item', async () => {
      const memexProjectItem = DefaultOpenIssue

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const whileSkippingLiveUpdatesStub = jest.fn().mockImplementationOnce(async (cb: () => Promise<void>) => {
        await cb()
      })

      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
        whileSkippingLiveUpdates: whileSkippingLiveUpdatesStub,
      })

      const updateItemStub = stubResolvedApiResponse(apiUpdateItem, {memexProjectItem})

      const {result} = renderHook(useUpdateItemColumnValue)

      const assignees = [getUser('olivia'), getUser('lerebear')]
      const labels = [getLabel(26)]

      await act(async () => {
        await result.current.updateMultipleSequentially(memexItemModel, [
          {
            dataType: MemexColumnDataType.Assignees,
            value: assignees,
          },
          {
            dataType: MemexColumnDataType.Labels,
            value: labels,
          },
        ])
      })

      expect(setItemDataStub).toHaveBeenCalledTimes(1)
      expect(whileSkippingLiveUpdatesStub).toHaveBeenCalledTimes(1)
      for (const stub of [updateColumnValueStub, updateItemStub]) {
        expect(stub).toHaveBeenCalledTimes(2)
      }

      expect(updateColumnValueStub).toHaveBeenNthCalledWith(1, {
        memexProjectColumnId: SystemColumnId.Assignees,
        value: assignees,
      })
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(2, {
        memexProjectColumnId: SystemColumnId.Labels,
        value: labels,
      })

      const [assigneeA, assigneeB] = assignees
      expect(updateItemStub).toHaveBeenNthCalledWith(1, {
        fieldIds: LOADED_FIELD_IDS,
        memexProjectItemId: 3,
        previousMemexProjectItemId: undefined,
        memexProjectColumnValues: [
          {memexProjectColumnId: SystemColumnId.Assignees, value: [assigneeA.id, assigneeB.id]},
        ],
      })

      const [label] = labels
      expect(updateItemStub).toHaveBeenNthCalledWith(2, {
        fieldIds: LOADED_FIELD_IDS,
        memexProjectItemId: 3,
        previousMemexProjectItemId: undefined,
        memexProjectColumnValues: [{memexProjectColumnId: SystemColumnId.Labels, value: [label.id]}],
      })
    })

    it('should ignore an update for redacted items', async () => {
      const memexProjectItem = DefaultRedactedItem

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const updateItemStub = stubResolvedApiResponse(apiUpdateItem, {memexProjectItem})

      const {result} = renderHook(useUpdateItemColumnValue)

      await act(async () => {
        await result.current.updateMultipleSequentially(memexItemModel, [
          {
            dataType: MemexColumnDataType.Assignees,
            value: [],
          },
        ])
      })

      for (const stub of [updateColumnValueStub, updateItemStub, setItemDataStub]) {
        expect(stub).not.toHaveBeenCalled()
      }
    })

    it('should restore existing values when there are server errors', async () => {
      const memexProjectItem = DefaultOpenIssue

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const whileSkippingLiveUpdatesStub = jest.fn().mockImplementationOnce(async (cb: () => Promise<void>) => {
        await cb()
      })

      const memexItemModel = createMemexItemModel(memexProjectItem, {
        setColumnValueForItemColumnType: updateColumnValueStub,
        whileSkippingLiveUpdates: whileSkippingLiveUpdatesStub,
      })

      const error = new Error('User does not have permission to set milestones')
      const updateItemStub = stubRejectedApiResponse(apiUpdateItem, error)

      const {result} = renderHook(useUpdateItemColumnValue)

      const currentValue = memexItemModel.columns[SystemColumnId.Milestone]
      expect(currentValue).not.toBeUndefined()

      const prevMilestone = memexItemModel.columns.Milestone
      const newMilestone = getMilestoneByRepository(1, 3)

      await act(async () => {
        await result.current.updateMultipleSequentially(memexItemModel, [
          {
            dataType: MemexColumnDataType.Milestone,
            value: newMilestone,
          },
        ])
      })

      expect(updateColumnValueStub).toHaveBeenCalledTimes(2)
      expect(updateItemStub).toHaveBeenCalledTimes(1)
      expect(setItemDataStub).not.toHaveBeenCalled()

      expect(memexItemModel.columns[SystemColumnId.Milestone]).toEqual(currentValue)
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(1, {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: newMilestone,
      })
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(2, {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: prevMilestone,
      })
    })
  })
})
