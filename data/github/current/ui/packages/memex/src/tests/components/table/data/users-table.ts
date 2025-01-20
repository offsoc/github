import type {Column, Row} from 'react-table'

import {MemexColumnDataType, SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import {applyGroupNameToRowId} from '../../../../client/components/react_table/state-providers/table-columns/grouping'
import {createEmptyGroup} from '../../../../client/features/grouping/helpers'
import type {GroupingMetadataWithSource} from '../../../../client/features/grouping/types'
import {createColumnModel} from '../../../../client/models/column-model'

export type TableDataType = {
  id: number
  firstName: string
  lastName: string
  age?: number
  visits: number
  progress: number
}

export const data = new Array<TableDataType>(
  {
    id: 1,
    firstName: 'tanner',
    lastName: 'linsley',
    age: 29,
    visits: 100,
    progress: 50,
  },
  {
    id: 2,
    firstName: 'derek',
    lastName: 'perkins',
    age: 40,
    visits: 40,
    progress: 80,
  },
  {
    id: 3,
    firstName: 'joe',
    lastName: 'bergevin',
    age: 45,
    visits: 20,
    progress: 10,
  },
  {
    id: 4,
    firstName: 'jaylen',
    lastName: 'linsley',
    age: 26,
    visits: 99,
    progress: 70,
  },
  {
    id: 5,
    firstName: 'brendan',
    lastName: 'forster',
    age: 45,
    visits: 1,
    progress: 10,
  },
  {
    id: 6,
    firstName: 'dustin',
    lastName: 'savery',
    age: 40,
    visits: 99,
    progress: 70,
  },
  {
    id: 7,
    firstName: 'max',
    lastName: 'beizer',
    age: 29,
    visits: 99,
    progress: 70,
  },
  {
    id: 8,
    firstName: 'deborah',
    lastName: 'digges',
    age: 45,
    visits: 99,
    progress: 70,
  },
  {
    id: 9,
    firstName: 'jonathan',
    lastName: 'otalora',
    visits: 12,
    progress: 70,
  },
  {
    id: 10,
    firstName: 'Aarya',
    lastName: 'BC',
    visits: 99,
    progress: 70,
  },
)

function getGroupingMetadata(row: Row<TableDataType>): Array<GroupingMetadataWithSource> | undefined {
  const {age} = row.original

  if (!age) {
    return undefined
  }

  const text = age.toString()
  return [
    {
      value: text,
      sourceObject: createEmptyGroup(columnModel)!,
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
  id: SystemColumnId.Milestone,
  databaseId: 123,
  name: 'Foo',
  position: 1,
  userDefined: false,
  defaultColumn: true,
  dataType: MemexColumnDataType.Milestone,
})

export const columns = new Array<Column<TableDataType>>(
  {
    Header: 'First Name',
    id: 'firstName',
    Cell: () => null,
    canSort: true,
    sortType: (rowA, rowB) => {
      return rowA.original.firstName.localeCompare(rowB.original.firstName)
    },
  },
  {
    Header: 'Last Name',
    id: 'lastName',
    Cell: () => null,
    canSort: true,
  },
  {
    Header: 'Age',
    id: 'age',
    Cell: () => null,
    canSort: true,
    sortType: (rowA, rowB, columnId, desc) => {
      const rowANumber = rowA.original.age
      const rowBNumber = rowB.original.age

      if (rowANumber === undefined) {
        // Sort omitted numbers at the bottom always
        return desc ? -1 : 1
      } else if (rowBNumber === undefined) {
        return desc ? 1 : -1
      }

      if (rowANumber === rowBNumber) {
        return 0
      }

      return rowANumber > rowBNumber ? 1 : -1
    },

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
          const rowWithAgumentedId = applyGroupNameToRowId(row, 'none')
          rowsWithoutGroupValue.push(rowWithAgumentedId)
          continue
        }

        for (const metadata of groupsMetadata) {
          const {value} = metadata
          const rowWithAgumentedId = applyGroupNameToRowId(row, value)
          if (aggregatedGroups.findIndex(g => g.value === value) === -1) {
            aggregatedGroups.push(metadata)
          }

          const groupedRows = rowsByGroupValue.get(value)
          if (!groupedRows) {
            rowsByGroupValue.set(value, [rowWithAgumentedId])
          } else {
            groupedRows.push(rowWithAgumentedId)
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
