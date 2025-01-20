import {MemexColumnDataType, SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import {IssueState} from '../../../../client/api/common-contracts'
import type {MemexItem} from '../../../../client/api/memex-items/contracts'
import {build as buildTableOptions} from '../../../../client/components/react_table/state-providers/table-columns/table-columns-provider'
import type {TableDataType} from '../../../../client/components/react_table/table-data-type'
import {createColumnModel} from '../../../../client/models/column-model'
import {createMemexItemModel} from '../../../../client/models/memex-item-model'
import {mockPrivateRepo, mockPublicRepo} from '../../../../mocks/data/repositories'
import {createIssueTitle, DefaultOpenIssue} from '../../../../mocks/memex-items'

function createItemForTable(item: MemexItem, overrides: Partial<MemexItem> = {}): TableDataType {
  const model = createMemexItemModel(Object.assign({}, item, overrides))
  return model
}

export const data = new Array<TableDataType>(
  createItemForTable(DefaultOpenIssue, {
    id: 1,
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.Title,
        value: createIssueTitle({
          number: 1,
          state: IssueState.Open,
          title: 'First Issue',
        }),
      },
      {
        memexProjectColumnId: SystemColumnId.Repository,
        value: {...mockPublicRepo},
      },
    ],
  }),
  createItemForTable(DefaultOpenIssue, {
    id: 2,
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.Title,
        value: createIssueTitle({
          number: 2,
          state: IssueState.Open,
          title: 'Second Issue',
        }),
      },
      {
        memexProjectColumnId: SystemColumnId.Repository,
        value: {...mockPublicRepo},
      },
    ],
  }),
  createItemForTable(DefaultOpenIssue, {
    id: 3,
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.Title,
        value: createIssueTitle({
          number: 3,
          state: IssueState.Open,
          title: 'Third Issue',
        }),
      },
      {
        memexProjectColumnId: SystemColumnId.Repository,
        value: {...mockPrivateRepo},
      },
    ],
  }),
  createItemForTable(DefaultOpenIssue, {
    id: 4,
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.Title,
        value: createIssueTitle({
          number: 4,
          state: IssueState.Open,
          title: 'Fourth Issue',
        }),
      },
      {
        memexProjectColumnId: SystemColumnId.Repository,
        value: {...mockPrivateRepo},
      },
    ],
  }),
)

const titleColumnModel = createColumnModel({
  id: SystemColumnId.Title,
  databaseId: 123,
  name: 'Title',
  position: 1,
  userDefined: false,
  defaultColumn: true,
  dataType: MemexColumnDataType.Title,
})

const repoColumnModel = createColumnModel({
  id: SystemColumnId.Repository,
  databaseId: 234,
  name: 'Repository',
  position: 2,
  userDefined: false,
  defaultColumn: true,
  dataType: MemexColumnDataType.Repository,
})

export const columns = [
  buildTableOptions(titleColumnModel, undefined, 650),
  buildTableOptions(repoColumnModel, undefined, 650),
]
