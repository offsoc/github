import type {Row} from 'react-table'

import {orderByFn} from '../../../client/components/react_table/sort/order-by-fn'

type Animal = {
  name: string
}

type AnimalTableModel<T extends {[key: string]: any}> = Omit<T, 'columnData'> & {
  model: T
}

type AnimalModelRow = Row<AnimalTableModel<Animal>>

function makeAnimalRow(name: string, index: number) {
  return {
    index,
    id: '1',
    original: {
      name,
    },
  } as AnimalModelRow
}

function defaultCompareFn(row1: AnimalModelRow, row2: AnimalModelRow) {
  return row2.original.name.localeCompare(row1.original.name)
}

describe('orderByFn', () => {
  it('sorts using provided sorting function, preferring lower indices in the event of a tie (ascending)', () => {
    const animals = ['cat', 'dog', 'squirrel', 'squirrel', 'rabbit'].map((animal, idx) => makeAnimalRow(animal, idx))
    const sorted = orderByFn(animals, [defaultCompareFn], [false])

    expect(sorted).toEqual([
      {id: '1', index: 0, original: {name: 'cat'}},
      {id: '1', index: 1, original: {name: 'dog'}},
      {id: '1', index: 4, original: {name: 'rabbit'}},
      {id: '1', index: 2, original: {name: 'squirrel'}},
      {id: '1', index: 3, original: {name: 'squirrel'}},
    ])
  })

  it('sorts using provided sorting function, preferring lower indices in the event of a tie (descending)', () => {
    const animals = ['cat', 'dog', 'squirrel', 'squirrel', 'rabbit'].map((animal, idx) => makeAnimalRow(animal, idx))
    const sorted = orderByFn(animals, [defaultCompareFn], [true])

    expect(sorted).toEqual([
      {id: '1', index: 2, original: {name: 'squirrel'}},
      {id: '1', index: 3, original: {name: 'squirrel'}},
      {id: '1', index: 4, original: {name: 'rabbit'}},
      {id: '1', index: 1, original: {name: 'dog'}},
      {id: '1', index: 0, original: {name: 'cat'}},
    ])
  })
})
