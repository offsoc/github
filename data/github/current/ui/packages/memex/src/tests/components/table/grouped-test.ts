import {act} from '@testing-library/react'
import type {TableState} from 'react-table'

import {MemexColumnDataType} from '../../../client/api/columns/contracts/memex-column'
import {columns, data, type TableDataType} from './data/users-table'
import {renderTable} from './table-renderer'

function getTableState(initialState: Partial<TableState<TableDataType>>) {
  return {
    // required for useCustomGroupBy
    collapsedGroups: [],
    ...initialState,
  }
}

describe('grouped table view', () => {
  it('grouping does not include grouped rows in flatRows', () => {
    const initialState = getTableState({
      groupByColumnIds: ['age'],
    })

    const {result} = renderTable(columns, data, {initialState})

    const table = result.current

    expect(table.flatRows).toHaveLength(data.length)
    for (const row of table.flatRows) {
      expect(row.isGrouped).not.toBeTruthy()
    }

    const flatRowIds = table.flatRows.map(r => r.id)
    expect(flatRowIds.sort()).toEqual(Object.keys(table.rowsById).sort())
    for (const key of flatRowIds) {
      expect(table.rowsById[key].isGrouped).not.toBeTruthy()
    }
  })

  it('sorting on same column presents rows in expected order (ascending)', () => {
    const initialState = getTableState({
      groupByColumnIds: ['age'],
      sortBy: [{id: 'age', desc: false}],
    })

    const {result} = renderTable(columns, data, {initialState})

    const table = result.current

    const groups = table.groupedRows!

    // four different age values plus an additional group for 'no value'
    expect(groups).toHaveLength(5)

    const firstGroup = groups[0]
    expect(firstGroup.groupedValue).toEqual('26')
    expect(firstGroup.subRows).toMatchObject([{index: 0}])

    const secondGroup = groups[1]
    expect(secondGroup.groupedValue).toEqual('29')
    expect(secondGroup.subRows).toMatchObject([{index: 1}, {index: 2}])

    const thirdGroup = groups[2]
    expect(thirdGroup.groupedValue).toEqual('40')
    expect(thirdGroup.subRows).toMatchObject([{index: 3}, {index: 4}])

    const fourthGroup = groups[3]
    expect(fourthGroup.groupedValue).toEqual('45')
    expect(fourthGroup.subRows).toMatchObject([{index: 5}, {index: 6}, {index: 7}])

    const lastGroup = groups[4]
    expect(lastGroup.groupedSourceObject).toMatchObject({
      dataType: MemexColumnDataType.Milestone,
      kind: 'empty',
      value: {
        titleHtml: 'No Foo',
      },
    })
    expect(lastGroup.subRows).toMatchObject([{index: 8}, {index: 9}])
  })

  it('selected rows are tracked when grouping and sorting are both active', () => {
    const initialState = getTableState({
      groupByColumnIds: ['age'],
      sortBy: [{id: 'age', desc: true}],
    })

    const {result} = renderTable(columns, data, {
      initialState,
      autoResetSelectedRows: false,
    })

    const itemIdToSelect = 1
    const selectedId = result.current.rows.find(r => r.original.id === itemIdToSelect)!.id

    // Grouping transforms item ids to `<group-value>-<item.id>`
    expect(selectedId).toEqual(`29-${itemIdToSelect}`)

    act(() => {
      result.current.toggleRowSelected(selectedId, true)
    })

    const table = result.current

    const selectedRows = table.selectedFlatRows
    const groups = table.groupedRows!

    // four different age values plus an additional group for 'no value'
    expect(groups).toHaveLength(5)

    // the selected row should be visible at the top level
    expect(selectedRows).toHaveLength(1)

    // it should also be accessible from the rows
    const row = table.rows.find(r => r.id === selectedId)
    expect(row!.isSelected).toBeTruthy()

    // and ensure the selected row exists in a group
    let foundRowInGroup = false
    for (const group of groups) {
      const matchingRow = group.subRows.find(r => r.id === selectedId)
      if (matchingRow && matchingRow.isSelected) {
        foundRowInGroup = true
        break
      }
    }

    expect(foundRowInGroup).toBeTruthy()
  })
})
