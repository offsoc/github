import {act, renderHook} from '@testing-library/react'

import type {IColumnWithItems} from '../../../client/api/columns/contracts/column-with-items'
import {MemexColumnDataType, SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {getMemexItemModelsFromQueryClient} from '../../../client/state-providers/memex-items/query-client-api/memex-items'
import {useUpdateColumnValues} from '../../../client/state-providers/memex-items/use-update-column-values'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {issueFactory} from '../../factories/memex-items/issue-factory'
import {createColumnsStableContext, stubAddLoadedFieldId} from '../../mocks/state-providers/columns-stable-context'
import {createTestQueryClient} from '../../test-app-wrapper'
import {createWrapperWithContexts} from '../../wrapper-utils'

describe('useUpdateColumnValues', () => {
  describe('updateColumnValues', () => {
    it('calls through to MemexItemModel only for items with values in column', () => {
      const addLoadedFieldIdStub = stubAddLoadedFieldId()

      const itemModel1 = createMemexItemModel(
        issueFactory.withColumnValues([columnValueFactory.labels(['initialLabel']).build()]).build(),
      )
      const itemModel2 = createMemexItemModel(
        issueFactory.withColumnValues([columnValueFactory.labels(['initialLabel2']).build()]).build(),
      )
      const queryClient = createTestQueryClient()

      const {result} = renderHook(useUpdateColumnValues, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: [itemModel1, itemModel2]},
          ColumnsStable: createColumnsStableContext({addLoadedFieldId: addLoadedFieldIdStub}),
        }),
      })

      const columnWithItems: IColumnWithItems = {
        id: SystemColumnId.Labels,
        dataType: MemexColumnDataType.Labels,
        databaseId: 1,
        name: 'Labels',
        position: 1,
        userDefined: false,
        defaultColumn: true,
        settings: {},
        memexProjectColumnValues: [
          {
            memexProjectItemId: itemModel1.id,
            value: [{id: 1, name: 'label1', color: 'red', nameHtml: 'label1', url: ''}],
          },
        ],
      }

      act(() => {
        result.current.updateColumnValues(columnWithItems)
      })

      const itemsAfterUpdate = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterUpdate[0].columns.Labels).toEqual([
        {id: 1, name: 'label1', color: 'red', nameHtml: 'label1', url: ''},
      ])
      // Second item is unchanged
      expect(itemsAfterUpdate[1].columns.Labels).toEqual(itemModel2.columns.Labels)

      expect(addLoadedFieldIdStub).toHaveBeenCalledWith(columnWithItems.id)
    })
  })

  describe('updateAllColumnValues', () => {
    it('updates the items in the query client', () => {
      const addLoadedFieldIdStub = stubAddLoadedFieldId()

      const itemModel1 = createMemexItemModel(
        issueFactory.withColumnValues([columnValueFactory.labels(['initialLabel']).build()]).build(),
      )
      const itemModel2 = createMemexItemModel(
        issueFactory.withColumnValues([columnValueFactory.labels(['initialLabel2']).build()]).build(),
      )
      const item2InitialLabels = {...itemModel2.columns.Labels}
      const queryClient = createTestQueryClient()

      const {result} = renderHook(useUpdateColumnValues, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: [itemModel1, itemModel2]},
          ColumnsStable: createColumnsStableContext({addLoadedFieldId: addLoadedFieldIdStub}),
        }),
      })

      const columnWithItems: IColumnWithItems = {
        id: SystemColumnId.Labels,
        dataType: MemexColumnDataType.Labels,
        databaseId: 1,
        name: 'Labels',
        position: 1,
        userDefined: false,
        defaultColumn: true,
        settings: {},
        memexProjectColumnValues: [
          {
            memexProjectItemId: itemModel1.id,
            value: [{id: 1, name: 'label1', color: 'red', nameHtml: 'label1', url: ''}],
          },
        ],
      }

      act(() => {
        result.current.updateAllColumnValues(columnWithItems)
      })

      const itemsAfterUpdate = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterUpdate[0].columns.Labels).toEqual([
        {id: 1, name: 'label1', color: 'red', nameHtml: 'label1', url: ''},
      ])

      // This item began with a label, but after the call to updateAllColumnValues
      // where no value was provided for this item, the value is updated to `undefined`
      expect(itemsAfterUpdate[1].columns.Labels).not.toEqual(item2InitialLabels)
      expect(itemsAfterUpdate[1].columns.Labels).toBeUndefined()

      expect(addLoadedFieldIdStub).toHaveBeenCalledWith(columnWithItems.id)
    })
  })
})
