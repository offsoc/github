import type {Column, Row} from 'react-table'

import {MemexColumnDataType, SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import type {MemexItem} from '../../../../client/api/memex-items/contracts'
import type {TableDataType} from '../../../../client/components/react_table/table-data-type'
import {createEmptyGroup} from '../../../../client/features/grouping/helpers'
import type {GroupingMetadataWithSource} from '../../../../client/features/grouping/types'
import {createColumnModel} from '../../../../client/models/column-model'
import {createMemexItemModel} from '../../../../client/models/memex-item-model'
import {DefaultClosedIssue, DefaultOpenIssue, DefaultRedactedItem} from '../../../../mocks/memex-items'

function createItemForTable(item: MemexItem) {
  const model = createMemexItemModel(item)
  return model
}

export const data = new Array<TableDataType>(
  createItemForTable(DefaultOpenIssue),
  createItemForTable(DefaultClosedIssue),
)

export const dataWithRedactedItem = new Array<TableDataType>(
  createItemForTable(DefaultOpenIssue),
  createItemForTable(DefaultRedactedItem),
  createItemForTable(DefaultClosedIssue),
)

function getGroupingMetadata(row: Row<TableDataType>): Array<GroupingMetadataWithSource> | undefined {
  const status = row.original.columns.Status

  if (!status) {
    return undefined
  }

  if (columnModel.id !== SystemColumnId.Status) {
    return undefined
  }

  const option = columnModel.settings.options?.find(o => o.id === status.id)
  if (!option) {
    return undefined
  }

  return [
    {
      value: status.id,
      sourceObject: {
        dataType: MemexColumnDataType.SingleSelect,
        kind: 'group',
        value: {
          option,
          columnId: columnModel.id,
        },
      },
    },
  ]
}

/**
 * Use a special collator to make sure that when grouping by number we sort in numerical order
 * (e.g. '1', '2', '10') rather than lexical order (e.g. '1', '10', '2').
 *
 * This doesn't otherwise affect string comparisons, so it has no effect when we group by other
 * types (which each represent the group value as a string).
 *
 * https://stackoverflow.com/a/38641281
 */
const NUMERIC_COLLATOR = new Intl.Collator(undefined, {numeric: true})

const columnModel = createColumnModel({
  id: SystemColumnId.Status,
  databaseId: 123,
  name: 'Status',
  position: 2,
  userDefined: false,
  defaultColumn: true,
  dataType: MemexColumnDataType.SingleSelect,
  settings: {
    options: [],
  },
})

export const columns = new Array<Column<TableDataType>>(
  {
    Header: 'Title',
    id: SystemColumnId.Title,
    Cell: () => null,
    canSort: true,
  },
  {
    Header: 'Status',
    id: 'status',
    Cell: () => null,
    canSort: true,

    columnModel,

    getGroupValue: row => {
      return getGroupingMetadata(row)
    },

    getGroupedRows: rows => {
      const rowsByGroupValue = new Map<string, Array<Row<TableDataType>>>()

      // Rather than allowing `undefined` or some sentinel value as a key in in `rowsByGroupValue`,
      // just collect rows without a group value separately.
      const rowsWithoutGroupValue = new Array<Row<TableDataType>>()
      const aggregatedGroups = new Array<GroupingMetadataWithSource>()

      for (const row of rows) {
        const groupsMetadata = getGroupingMetadata(row)

        if (!groupsMetadata) {
          rowsWithoutGroupValue.push(row)
          continue
        }

        for (const metadata of groupsMetadata) {
          const {value} = metadata
          if (aggregatedGroups.findIndex(g => g.value === value) === -1) {
            aggregatedGroups.push(metadata)
          }

          const groupedRows = rowsByGroupValue.get(value)
          if (!groupedRows) {
            rowsByGroupValue.set(value, [row])
          } else {
            groupedRows.push(row)
          }
        }
      }

      // Otherwise, we must sort the group values to ensure that they appear in
      // ascending order by default.
      const groupValues = [...aggregatedGroups].sort((a, b) => NUMERIC_COLLATOR.compare(a.value, b.value))

      const groups = groupValues.map(v => ({
        ...v,
        rows: rowsByGroupValue.get(v.value) ?? [],
      }))

      // Then tack on a group for the rows without any group value.
      groups.push({
        value: 'undefined',
        sourceObject: createEmptyGroup(columnModel)!,
        rows: rowsWithoutGroupValue,
      })

      return groups
    },
  },
)
