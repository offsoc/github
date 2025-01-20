import {act, renderHook} from '@testing-library/react'

import type {IColumnWithItems} from '../../../client/api/columns/contracts/column-with-items'
import {MemexColumnDataType, SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {RedactedItemTitleColumnData, TextColumnData} from '../../../client/api/columns/contracts/storage'
import {useUpdateLoadedColumns} from '../../../client/state-providers/columns/use-update-loaded-columns'
import {createColumnsStableContext, stubAddLoadedFieldId} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext} from './helpers'

describe('useUpdateLoadedColumns', () => {
  it('will add field id for a column with items', () => {
    const addLoadedFieldIdStub = stubAddLoadedFieldId()

    const {result} = renderHook(useUpdateLoadedColumns, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({addLoadedFieldId: addLoadedFieldIdStub}),
      ),
    })

    const columnWithItems: IColumnWithItems = {
      dataType: MemexColumnDataType.Text,
      databaseId: 1,
      defaultColumn: false,
      id: 123,
      name: 'New field',
      userDefined: true,
      memexProjectColumnValues: [],
    }

    act(() => {
      result.current.updateLoadedColumns(columnWithItems.id)
    })

    expect(addLoadedFieldIdStub).toHaveBeenCalledWith(columnWithItems.id)
  })

  it('will add field id for memex column data', () => {
    const addLoadedFieldIdStub = stubAddLoadedFieldId()

    const {result} = renderHook(useUpdateLoadedColumns, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({addLoadedFieldId: addLoadedFieldIdStub}),
      ),
    })

    const columnData: TextColumnData = {
      memexProjectColumnId: 123,
      value: {
        html: 'html value',
        raw: 'raw value',
      },
    }

    act(() => {
      result.current.updateLoadedColumns(columnData.memexProjectColumnId)
    })

    expect(addLoadedFieldIdStub).toHaveBeenCalledWith(columnData.memexProjectColumnId)
  })

  it('will add field id for redacted item data', () => {
    const addLoadedFieldIdStub = stubAddLoadedFieldId()

    const {result} = renderHook(useUpdateLoadedColumns, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({addLoadedFieldId: addLoadedFieldIdStub}),
      ),
    })

    const redactedItemData: RedactedItemTitleColumnData = {
      memexProjectColumnId: SystemColumnId.Title,
      value: {title: 'Redacted'},
    }

    act(() => {
      result.current.updateLoadedColumns(redactedItemData.memexProjectColumnId)
    })

    expect(addLoadedFieldIdStub).toHaveBeenCalledWith(SystemColumnId.Title)
  })
})
