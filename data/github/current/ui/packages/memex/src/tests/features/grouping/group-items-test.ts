import type {Column, Row, TableState} from 'react-table'

import type {TableDataType} from '../../../client/components/react_table/table-data-type'
import {groupItems, type GroupItemsResult} from '../../../client/features/grouping/group-items'
import {buildGroupingConfiguration} from '../../../client/features/grouping/grouping-metadata-configurations'
import type {TextGrouping} from '../../../client/features/grouping/types'
import {SingleSelectColumnModel} from '../../../client/models/column-model/custom/single-select'
import {TextColumnModel} from '../../../client/models/column-model/custom/text'
import type {MemexItemModel} from '../../../client/models/memex-item-model'
import {renderTable} from '../../components/table/table-renderer'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {issueFactory} from '../../factories/memex-items/issue-factory'
import {createMemexItemModel} from '../../mocks/models/memex-item-model'

function getTableState(initialState: Partial<TableState<TableDataType>>) {
  return {
    // required for useCustomGroupBy
    groupByColumnIds: [],
    ...initialState,
  }
}

describe('groupItems', () => {
  it('operates on MemexItemModels directly', () => {
    const textColumn = customColumnFactory.text().build({name: 'Size'})
    const textColumnModel = new TextColumnModel(textColumn)
    const textValue1 = 'textValue1'
    const textValue2 = 'textValue2'

    const columnValue1 = columnValueFactory.text(textValue1, textColumn.name, [textColumn]).build()
    const columnValue2 = columnValueFactory.text(textValue2, textColumn.name, [textColumn]).build()

    const issue1 = createMemexItemModel(issueFactory.withColumnValues([columnValue1]).build())
    const issue2 = createMemexItemModel(issueFactory.withColumnValues([columnValue1]).build())
    const issue3 = createMemexItemModel(issueFactory.withColumnValues([columnValue2]).build())
    const issue4 = createMemexItemModel(issueFactory.build())

    const items = [issue1, issue2, issue3, issue4]

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['text']
    const groupingResult = groupItems(
      items,
      textColumnModel,
      groupingConfiguration.getGroupingMetadata,
      groupingConfiguration.getAllGroupMetadata,
    )
    const expectedGroupingResult: Array<GroupItemsResult<MemexItemModel>> = [
      {
        rows: [issue1, issue2],
        value: textValue1,
        sourceObject: {
          dataType: 'text',
          kind: 'group',
          value: {
            columnId: textColumn.id,
            text: {
              html: textValue1,
              raw: textValue1,
            },
          },
        } as TextGrouping,
      },
      {
        rows: [issue3],
        value: textValue2,
        sourceObject: {
          dataType: 'text',
          kind: 'group',
          value: {
            columnId: textColumn.id,
            text: {
              html: textValue2,
              raw: textValue2,
            },
          },
        } as TextGrouping,
      },
      {
        rows: [issue4],
        value: 'undefined',
        sourceObject: {
          dataType: 'text',
          kind: 'empty',
          value: {
            columnId: textColumn.id,
            titleHtml: 'No Size',
          },
        } as TextGrouping,
      },
    ]

    expect(groupingResult).toMatchObject(expectedGroupingResult)
  })
  it('operates on table rows', () => {
    const textColumn = customColumnFactory.text().build({name: 'Size'})
    const textColumnModel = new TextColumnModel(textColumn)
    const textValue1 = 'textValue1'
    const textValue2 = 'textValue2'

    const columnValue1 = columnValueFactory.text(textValue1, textColumn.name, [textColumn]).build()
    const columnValue2 = columnValueFactory.text(textValue2, textColumn.name, [textColumn]).build()

    const issue1 = createMemexItemModel(issueFactory.withColumnValues([columnValue1]).build())
    const issue2 = createMemexItemModel(issueFactory.withColumnValues([columnValue1]).build())
    const issue3 = createMemexItemModel(issueFactory.withColumnValues([columnValue2]).build())
    const issue4 = createMemexItemModel(issueFactory.build())

    const rows: Array<TableDataType> = [issue1, issue2, issue3, issue4]
    const columns: Array<Column<TableDataType>> = [
      {
        Header: 'First Name',
        id: textColumn.id.toString(),
        Cell: () => null,
        canSort: true,
      },
    ]
    const {result} = renderTable(columns, rows, {initialState: getTableState({})})
    const [row1, row2, row3, row4] = result.current.rows

    const groupingConfiguration = buildGroupingConfiguration((item: Row<TableDataType>) => item.original.columns)[
      'text'
    ]
    const groupingResult = groupItems(
      result.current.rows,
      textColumnModel,
      groupingConfiguration.getGroupingMetadata,
      groupingConfiguration.getAllGroupMetadata,
    )
    const expectedGroupingResult: Array<GroupItemsResult<Row<TableDataType>>> = [
      {
        rows: [row1, row2],
        value: textValue1,
        sourceObject: {
          dataType: 'text',
          kind: 'group',
          value: {
            columnId: textColumn.id,
            text: {
              html: textValue1,
              raw: textValue1,
            },
          },
        } as TextGrouping,
      },
      {
        rows: [row3],
        value: textValue2,
        sourceObject: {
          dataType: 'text',
          kind: 'group',
          value: {
            columnId: textColumn.id,
            text: {
              html: textValue2,
              raw: textValue2,
            },
          },
        } as TextGrouping,
      },
      {
        rows: [row4],
        value: 'undefined',
        sourceObject: {
          dataType: 'text',
          kind: 'empty',
          value: {
            columnId: textColumn.id,
            titleHtml: 'No Size',
          },
        } as TextGrouping,
      },
    ]

    expect(groupingResult).toMatchObject(expectedGroupingResult)
  })
  it('supports a transformItems callback', () => {
    const textColumn = customColumnFactory.text().build({name: 'Size'})
    const textColumnModel = new TextColumnModel(textColumn)
    const textValue1 = 'textValue1'

    const columnValue1 = columnValueFactory.text(textValue1, textColumn.name, [textColumn]).build()

    const issue1 = createMemexItemModel(issueFactory.withColumnValues([columnValue1]).build())
    const issue2 = createMemexItemModel(issueFactory.build())

    const rows: Array<TableDataType> = [issue1, issue2]
    const columns: Array<Column<TableDataType>> = [
      {
        Header: 'First Name',
        id: textColumn.id.toString(),
        Cell: () => null,
        canSort: true,
      },
    ]
    const {result} = renderTable(columns, rows, {initialState: getTableState({})})
    const [row1, row2] = result.current.rows

    expect(result.current.rows).toHaveLength(2)

    const groupingConfiguration = buildGroupingConfiguration((item: Row<TableDataType>) => item.original.columns)[
      'text'
    ]
    const groupingResult = groupItems(
      result.current.rows,
      textColumnModel,
      groupingConfiguration.getGroupingMetadata,
      groupingConfiguration.getAllGroupMetadata,
      (item: Row<TableDataType>, groupName: string) => {
        return {...item, id: `${groupName}-${item.id}`}
      },
    )

    const expectedRow1 = {...row1, id: `${textValue1}-${row1.id}`}
    const expectedRow2 = {...row2, id: `none-${row2.id}`}

    const expectedGroupingResult: Array<GroupItemsResult<Row<TableDataType>>> = [
      {
        rows: [expectedRow1],
        value: textValue1,
        sourceObject: {
          dataType: 'text',
          kind: 'group',
          value: {
            columnId: textColumn.id,
            text: {
              html: textValue1,
              raw: textValue1,
            },
          },
        } as TextGrouping,
      },
      {
        rows: [expectedRow2],
        value: 'undefined',
        sourceObject: {
          dataType: 'text',
          kind: 'empty',
          value: {
            columnId: textColumn.id,
            titleHtml: 'No Size',
          },
        } as TextGrouping,
      },
    ]

    expect(groupingResult).toMatchObject(expectedGroupingResult)
  })

  it('uses getAllGroupMetadata to sort groups if provided', () => {
    const column = customColumnFactory
      .singleSelect({
        optionNames: ['Todo', 'In Progress', 'Done'],
      })
      .build({name: 'Stage'})
    // Give the options some known ids, so that we can test the group sorting with getAllGroupMetadata passed
    column.settings!.options![0].id = 'xyz'
    column.settings!.options![1].id = 'def'
    column.settings!.options![2].id = 'abc'
    const columnModel = new SingleSelectColumnModel(column)

    const columnValue1 = columnValueFactory.singleSelect('Todo', column.name, [columnModel]).build()
    const columnValue2 = columnValueFactory.singleSelect('In Progress', column.name, [columnModel]).build()
    const columnValue3 = columnValueFactory.singleSelect('Done', column.name, [columnModel]).build()

    // Put these out of order a bit to make sure we're sorting by single select option order
    const issue1 = createMemexItemModel(issueFactory.withColumnValues([columnValue3]).build())
    const issue2 = createMemexItemModel(issueFactory.withColumnValues([columnValue1]).build())
    const issue3 = createMemexItemModel(issueFactory.withColumnValues([columnValue2]).build())
    const issue4 = createMemexItemModel(issueFactory.build())

    const items = [issue1, issue2, issue3, issue4]

    const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns)['singleSelect']

    // Call groupItems with no getAllGroupMetadata and expect group order be alphabetical by group id
    // i.e. Done (abc), In Progress (def), Todo (xyz), No Stage
    let groupingResult = groupItems(items, columnModel, groupingConfiguration.getGroupingMetadata, undefined)
    expect(columnModel.settings.options.find(option => option.id === groupingResult[0].value)?.name).toBe('Done')
    expect(columnModel.settings.options.find(option => option.id === groupingResult[1].value)?.name).toBe('In Progress')
    expect(columnModel.settings.options.find(option => option.id === groupingResult[2].value)?.name).toBe('Todo')
    expect(groupingResult[3].value).toBe('undefined')

    // Call groupItems with getAllGroupMetadata and expect group order to be the same as the order of the options
    groupingResult = groupItems(
      items,
      columnModel,
      groupingConfiguration.getGroupingMetadata,
      groupingConfiguration.getAllGroupMetadata,
    )
    expect(columnModel.settings.options.find(option => option.id === groupingResult[0].value)?.name).toBe('Todo')
    expect(columnModel.settings.options.find(option => option.id === groupingResult[1].value)?.name).toBe('In Progress')
    expect(columnModel.settings.options.find(option => option.id === groupingResult[2].value)?.name).toBe('Done')
    expect(groupingResult[3].value).toBe('undefined')
  })
})
