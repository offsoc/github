import {act} from '@testing-library/react'
import type {TableState} from 'react-table'

import {MemexColumnDataType} from '../../../client/api/columns/contracts/memex-column'
import {columns, data, type TableDataType} from './data/users-table'
import {renderTable} from './table-renderer'

function getTableState(initialState: Partial<TableState<TableDataType>>) {
  return {
    // required for useCustomGroupBy
    collapsedGroups: [],
    // required for useCustomGroupBy
    groupByColumnIds: [],
    ...initialState,
  }
}

describe('ranking in table view', () => {
  it('after grouping and sorting, numbers are preserved', () => {
    const initialState = getTableState({})

    const {result} = renderTable(columns, data, {initialState})

    const table = result.current

    expect(table.rows).toHaveLength(10)

    act(() => {
      result.current.toggleGroupBy('age', true)
    })

    expect(result.current.groupedRows).toHaveLength(5)

    const groupBeforeSorting = result.current.groupedRows!.find(g => g.groupedValue === '45')

    // Indexes ascend sequentially within group
    expect(groupBeforeSorting!.subRows).toMatchObject([{index: 5}, {index: 6}, {index: 7}])
    expect(groupBeforeSorting!.subRows.map(r => r.original.firstName)).toEqual(['joe', 'brendan', 'deborah'])

    act(() => {
      result.current.toggleSortBy('firstName', false)
    })

    expect(result.current.groupedRows).toHaveLength(5)

    const groupAfterSorting = result.current.groupedRows!.find(g => g.groupedValue === '45')

    // Indexes still ascend sequentially after sorting
    expect(groupAfterSorting!.subRows).toMatchObject([{index: 5}, {index: 6}, {index: 7}])
    expect(groupAfterSorting!.subRows.map(r => r.original.firstName)).toEqual(['brendan', 'deborah', 'joe'])
  })
  it('sorting on same column presents rows in expected order (descending)', () => {
    const initialState = getTableState({
      // grouped by age column
      groupByColumnIds: ['age'],
      // while also sorting by age column
      sortBy: [{id: 'age', desc: true}],
    })

    const {result} = renderTable(columns, data, {initialState})

    const table = result.current

    const groups = table.groupedRows!

    // four different age values plus an additional group for 'no value'
    expect(groups).toHaveLength(5)

    const firstGroup = groups[0]
    expect(firstGroup.groupedSourceObject).toMatchObject({
      dataType: MemexColumnDataType.Milestone,
      kind: 'empty',
      value: {titleHtml: 'No Foo'},
    })

    expect(firstGroup.subRows).toMatchObject([{index: 0}, {index: 1}])

    const secondGroup = groups[1]
    expect(secondGroup.groupedValue).toEqual('45')
    expect(secondGroup.subRows).toMatchObject([{index: 2}, {index: 3}, {index: 4}])

    const thirdGroup = groups[2]
    expect(thirdGroup.groupedValue).toEqual('40')
    expect(thirdGroup.subRows).toMatchObject([{index: 5}, {index: 6}])

    const fourthGroup = groups[3]
    expect(fourthGroup.groupedValue).toEqual('29')
    expect(fourthGroup.subRows).toMatchObject([{index: 7}, {index: 8}])

    const lastGroup = groups[4]
    expect(lastGroup.groupedValue).toEqual('26')
    expect(lastGroup.subRows).toMatchObject([{index: 9}])
  })
})
