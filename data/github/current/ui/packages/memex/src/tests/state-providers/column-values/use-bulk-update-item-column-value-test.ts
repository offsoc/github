import {act, renderHook} from '@testing-library/react'

import {MemexColumnDataType, SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {apiBulkUpdateItems} from '../../../client/api/memex-items/api-bulk-update-items'
import {usePostStats} from '../../../client/hooks/common/use-post-stats'
import {useBulkUpdateItemColumnValues} from '../../../client/state-providers/column-values/use-bulk-update-item-column-value'
import {useFindLoadedFieldIds} from '../../../client/state-providers/columns/use-find-loaded-field-ids'
import {useSetMemexItemData} from '../../../client/state-providers/memex-items/use-set-memex-item-data'
import {getMilestoneByRepository} from '../../../mocks/data/milestones'
import {DefaultOpenIssue, DefaultOpenPullRequest} from '../../../mocks/memex-items'
import {stubRejectedApiResponse, stubResolvedApiResponse} from '../../mocks/api/memex'
import {createMemexItemModel, stubSetColumnValueForItemColumnType} from '../../mocks/models/memex-item-model'
import {asMockHook} from '../../mocks/stub-utilities'
import {createWrapperWithContexts} from '../../wrapper-utils'

const LOADED_FIELD_IDS = [SystemColumnId.Title]

jest.mock('../../../client/state-providers/memex-items/use-set-memex-item-data')
jest.mock('../../../client/api/memex-items/api-bulk-update-items')
jest.mock('../../../client/hooks/common/use-post-stats')
jest.mock('../../../client/state-providers/columns/use-find-loaded-field-ids')

describe('useBulkUpdateItemColumnValues', () => {
  let setItemDataStub: jest.Mock
  let rerenderItemsStub: jest.Mock
  let mockPostStats: jest.Mock
  let findLoadedFieldIdsStub: jest.Mock

  beforeEach(() => {
    setItemDataStub = jest.fn()
    rerenderItemsStub = jest.fn()
    mockPostStats = jest.fn()
    findLoadedFieldIdsStub = jest.fn().mockReturnValue(LOADED_FIELD_IDS)
    asMockHook(useSetMemexItemData).mockReturnValue({
      setItemData: setItemDataStub,
      setItemsStateFromModels: rerenderItemsStub,
    })
    asMockHook(usePostStats).mockReturnValue({
      postStats: mockPostStats,
    })
    asMockHook(useFindLoadedFieldIds).mockReturnValue({
      findLoadedFieldIds: findLoadedFieldIdsStub,
    })
  })

  describe('bulkUpdateColumnValues', () => {
    it('should send the expected payload to the server when the new format is used for update', async () => {
      const item1 = DefaultOpenIssue
      const item2 = DefaultOpenPullRequest

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(item1, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })
      const memexItemModel2 = createMemexItemModel(item2, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const items = [memexItemModel, memexItemModel2]

      const bulkUpdateItemsStub = stubResolvedApiResponse(apiBulkUpdateItems, {
        memexProjectItems: items,
        totalUpdatedItems: items.length,
      })

      const {result} = renderHook(useBulkUpdateItemColumnValues, {
        wrapper: createWrapperWithContexts({
          QueryClient: {memexItems: items},
        }),
      })

      const payload = {
        dataType: MemexColumnDataType.Title,
        value: {
          title: {raw: 'some raw text', html: 'some raw text'},
        },
      }

      const itemUpdates = items.map(item => ({
        itemId: item.id,
        updates: [payload],
      }))

      await act(async () => {
        await result.current.bulkUpdateColumnValues(itemUpdates)
      })

      for (const stub of [bulkUpdateItemsStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      expect(bulkUpdateItemsStub).toHaveBeenCalledWith({
        fieldIds: LOADED_FIELD_IDS,
        memexProjectItems: [
          {
            id: item1.id,
            memexProjectColumnValues: [
              {
                memexProjectColumnId: 'Title',
                value: {
                  title: 'some raw text',
                },
              },
            ],
          },
          {
            id: item2.id,
            memexProjectColumnValues: [
              {
                memexProjectColumnId: 'Title',
                value: {
                  title: 'some raw text',
                },
              },
            ],
          },
        ],
      })

      expect(mockPostStats).toHaveBeenCalledWith({
        context: 2,
        memexProjectColumnId: 'Title',
        name: 'bulk_column_value_update',
        ui: 'shortcut',
      })
    })

    it('should restore existing values when there are server errors', async () => {
      const item1 = DefaultOpenIssue
      const item2 = DefaultOpenPullRequest

      const updateColumnValueStub = stubSetColumnValueForItemColumnType()
      const memexItemModel = createMemexItemModel(item1, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })
      const memexItemModel2 = createMemexItemModel(item2, {
        setColumnValueForItemColumnType: updateColumnValueStub,
      })

      const items = [memexItemModel, memexItemModel2]

      const error = new Error('User does not have permission to set milestones')
      const bulkUpdateItemsStub = stubRejectedApiResponse(apiBulkUpdateItems, error)

      const {result} = renderHook(useBulkUpdateItemColumnValues, {
        wrapper: createWrapperWithContexts({
          QueryClient: {memexItems: items},
        }),
      })

      const currentValue = memexItemModel.columns[SystemColumnId.Milestone]
      expect(currentValue).not.toBeUndefined()

      const prevMilestone = item1.memexProjectColumnValues.find(
        c => c.memexProjectColumnId === SystemColumnId.Milestone,
      )?.value
      const prevMilestone2 = item2.memexProjectColumnValues.find(
        c => c.memexProjectColumnId === SystemColumnId.Milestone,
      )?.value
      const newMilestone = getMilestoneByRepository(1, 3)

      const payload = {
        dataType: MemexColumnDataType.Milestone,
        value: newMilestone,
      }

      const itemUpdates = items.map(item => ({
        itemId: item.id,
        updates: [payload],
      }))

      await act(async () => {
        await expect(result.current.bulkUpdateColumnValues(itemUpdates)).rejects.toEqual(error)
      })

      expect(updateColumnValueStub).toHaveBeenCalledTimes(4)
      expect(bulkUpdateItemsStub).toHaveBeenCalledTimes(1)

      expect(mockPostStats).toHaveBeenCalledWith({
        context: 2,
        memexProjectColumnId: 'Milestone',
        name: 'bulk_column_value_update',
        ui: 'shortcut',
      })

      expect(memexItemModel.columns[SystemColumnId.Milestone]).toEqual(currentValue)
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(1, {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: newMilestone,
      })
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(2, {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: newMilestone,
      })
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(3, {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: prevMilestone,
      })
      expect(updateColumnValueStub).toHaveBeenNthCalledWith(4, {
        memexProjectColumnId: SystemColumnId.Milestone,
        value: prevMilestone2,
      })
    })
  })
})
