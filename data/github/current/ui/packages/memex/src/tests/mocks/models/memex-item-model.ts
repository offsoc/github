import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {
  ColumnData,
  IssueTitleWithContentType,
  TitleValueWithContentType,
} from '../../../client/api/columns/contracts/storage'
import type {MemexItem} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import type {MemexItemModel} from '../../../client/models/memex-item-model'
import {stubFnReturnValue} from '../stub-utilities'

export function stubSetColumnValueForItemColumnType() {
  return stubFnReturnValue<MemexItemModel['setColumnValueForItemColumnType']>(undefined)
}

function createColumnData(item: MemexItem): ColumnData {
  const values = item.memexProjectColumnValues.map(i => {
    if (i.memexProjectColumnId === SystemColumnId.Title) {
      return [i.memexProjectColumnId, {contentType: item.contentType, value: i.value ?? undefined}]
    } else {
      return [i.memexProjectColumnId, i.value ?? undefined]
    }
  })

  return Object.fromEntries(values)
}

export function createMemexItemModel(item: MemexItem, mocks?: Partial<MemexItemModel>): MemexItemModel {
  const model = {
    columns: createColumnData(item),
    // Added by the model constructor
    prioritizedIndex: item.id,
    ...item,
    ...mocks,
  } as unknown as MemexItemModel

  return model
}

export function assertIsIssueTitle(columnValue?: TitleValueWithContentType): IssueTitleWithContentType {
  expect(columnValue).toBeDefined()

  expect(columnValue!.contentType).toBe(ItemType.Issue)

  return columnValue! as IssueTitleWithContentType
}
