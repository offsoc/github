import type {TableState} from 'react-table'

import {columns, data, type TableDataType} from './data/users-table'
import {renderTable} from './table-renderer'

function getTableState(initialState: Partial<TableState<TableDataType>>) {
  return {
    // required for useCustomGroupBy
    groupByColumnIds: [],
    ...initialState,
  }
}

describe('default table rendering', () => {
  it('renders rows in expected order when sorting (descending)', () => {
    const initialState = getTableState({
      sortBy: [{id: 'age', desc: true}],
    })

    const {result} = renderTable(columns, data, {initialState, autoResetSortBy: false})

    const table = result.current

    expect(table.groupedRows).toBeUndefined()

    const {rows} = table

    expect(rows).toHaveLength(10)

    expect(rows[0]).toMatchObject({index: 0, original: {id: 3, age: 45}})
    expect(rows[1]).toMatchObject({index: 1, original: {id: 5, age: 45}})
    expect(rows[2]).toMatchObject({index: 2, original: {id: 8, age: 45}})
    expect(rows[3]).toMatchObject({index: 3, original: {id: 2, age: 40}})
    expect(rows[4]).toMatchObject({index: 4, original: {id: 6, age: 40}})
    expect(rows[5]).toMatchObject({index: 5, original: {id: 1, age: 29}})
    expect(rows[6]).toMatchObject({index: 6, original: {id: 7, age: 29}})
    expect(rows[7]).toMatchObject({index: 7, original: {id: 4, age: 26}})
    expect(rows[8]).toMatchObject({index: 8, original: {id: 9}})
    expect(rows[9]).toMatchObject({index: 9, original: {id: 10}})
  })

  it('renders rows in expected order when sorting (ascending)', () => {
    const initialState = getTableState({
      sortBy: [{id: 'age', desc: false}],
    })

    const {result} = renderTable(columns, data, {initialState, autoResetSortBy: false})

    const table = result.current

    expect(table.groupedRows).toBeUndefined()

    const {rows} = table

    expect(rows).toHaveLength(10)

    expect(rows[0]).toMatchObject({index: 0, original: {id: 4, age: 26}})
    expect(rows[1]).toMatchObject({index: 1, original: {id: 1, age: 29}})
    expect(rows[2]).toMatchObject({index: 2, original: {id: 7, age: 29}})
    expect(rows[3]).toMatchObject({index: 3, original: {id: 2, age: 40}})
    expect(rows[4]).toMatchObject({index: 4, original: {id: 6, age: 40}})
    expect(rows[5]).toMatchObject({index: 5, original: {id: 3, age: 45}})
    expect(rows[6]).toMatchObject({index: 6, original: {id: 5, age: 45}})
    expect(rows[7]).toMatchObject({index: 7, original: {id: 8, age: 45}})
    expect(rows[8]).toMatchObject({index: 8, original: {id: 9}})
    expect(rows[9]).toMatchObject({index: 9, original: {id: 10}})
  })
})
