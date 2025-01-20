import {act} from '@testing-library/react'
import type {TableState} from 'react-table'

import type {TableDataType} from '../../../client/components/react_table/table-data-type'
import {columns, data} from './data/repos-table'
import {renderTable} from './table-renderer'

function getTableState(initialState: Partial<TableState<TableDataType>>) {
  return {
    // required for useCustomGroupBy
    groupByColumnIds: [],

    ...initialState,
  }
}

describe('sorting in table view', () => {
  it('renders rows in expected order when sorting (ascending), and maintains stable position', () => {
    const initialState = getTableState({})

    const {result} = renderTable(columns, data, {initialState, autoResetSortBy: false})

    const table = result.current

    expect(table.groupedRows).toBeUndefined()

    const {rows} = table

    expect(rows).toHaveLength(4)

    act(() => {
      result.current.toggleSortBy('Repository', false)
    })

    expect(result.current.rows[0]).toMatchObject({
      index: 0,
      original: {id: 3, columns: {Repository: {name: 'github'}}},
    })
    expect(result.current.rows[1]).toMatchObject({
      index: 1,
      original: {id: 4, columns: {Repository: {name: 'github'}}},
    })
    expect(result.current.rows[2]).toMatchObject({
      index: 2,
      original: {id: 1, columns: {Repository: {name: 'memex'}}},
    })
    expect(result.current.rows[3]).toMatchObject({
      index: 3,
      original: {id: 2, columns: {Repository: {name: 'memex'}}},
    })

    // And if I trigger a second sort
    act(() => {
      result.current.toggleSortBy('Repository', false)
    })

    // Then my rows should retain their original sorted position
    expect(result.current.rows[0]).toMatchObject({
      index: 0,
      original: {id: 3, columns: {Repository: {name: 'github'}}},
    })
    expect(result.current.rows[1]).toMatchObject({
      index: 1,
      original: {id: 4, columns: {Repository: {name: 'github'}}},
    })
    expect(result.current.rows[2]).toMatchObject({
      index: 2,
      original: {id: 1, columns: {Repository: {name: 'memex'}}},
    })
    expect(result.current.rows[3]).toMatchObject({
      index: 3,
      original: {id: 2, columns: {Repository: {name: 'memex'}}},
    })
  })

  it('renders rows in expected order when sorting (descending), and maintains stable position', () => {
    const initialState = getTableState({})

    const {result} = renderTable(columns, data, {initialState, autoResetSortBy: false})

    const table = result.current

    expect(table.groupedRows).toBeUndefined()

    const {rows} = table

    expect(rows).toHaveLength(4)

    act(() => {
      result.current.toggleSortBy('Repository', true)
    })

    expect(result.current.rows[0]).toMatchObject({
      index: 0,
      original: {id: 1, columns: {Repository: {name: 'memex'}}},
    })
    expect(result.current.rows[1]).toMatchObject({
      index: 1,
      original: {id: 2, columns: {Repository: {name: 'memex'}}},
    })
    expect(result.current.rows[2]).toMatchObject({
      index: 2,
      original: {id: 3, columns: {Repository: {name: 'github'}}},
    })
    expect(result.current.rows[3]).toMatchObject({
      index: 3,
      original: {id: 4, columns: {Repository: {name: 'github'}}},
    })

    // And if I trigger a second sort
    act(() => {
      result.current.toggleSortBy('Repository', true)
    })

    // Then my rows should retain their original sorted position
    expect(result.current.rows[0]).toMatchObject({
      index: 0,
      original: {id: 1, columns: {Repository: {name: 'memex'}}},
    })
    expect(result.current.rows[1]).toMatchObject({
      index: 1,
      original: {id: 2, columns: {Repository: {name: 'memex'}}},
    })
    expect(result.current.rows[2]).toMatchObject({
      index: 2,
      original: {id: 3, columns: {Repository: {name: 'github'}}},
    })
    expect(result.current.rows[3]).toMatchObject({
      index: 3,
      original: {id: 4, columns: {Repository: {name: 'github'}}},
    })
  })
})
