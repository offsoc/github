import type {QueryElement} from '../query-builder-element'
import {QueryBuilderElement} from '../query-builder-element'

test('addSelectedItemToFilter should set the selected item', () => {
  const element = new QueryBuilderElement()
  const items: QueryElement[] = [
    {
      type: 'filter',
      filter: 'is',
      value: '',
    },
  ]
  element.addSelectedItemToFilter('item_1', items)

  const expectedItems: QueryElement[] = [
    {
      type: 'filter',
      filter: 'is',
      value: 'item_1',
    },
    {
      type: 'text',
      value: '',
    },
  ]

  // Assert
  expect(items).toStrictEqual(expectedItems)
})

test('addSelectedItemToFilter should append the selected item', () => {
  const element = new QueryBuilderElement()
  const items: QueryElement[] = [
    {
      type: 'filter',
      filter: 'is',
      value: 'item-1,foo',
    },
  ]
  element.addSelectedItemToFilter('foobar', items)

  const expectedItems: QueryElement[] = [
    {
      type: 'filter',
      filter: 'is',
      value: 'item-1,foobar',
    },
    {
      type: 'text',
      value: '',
    },
  ]

  // Assert
  expect(items).toStrictEqual(expectedItems)
})

test('addSelectedItemToFilter should make no changes if there is no filter items', () => {
  const element = new QueryBuilderElement()
  const items: QueryElement[] = [
    {
      type: 'text',
      value: 'foobar',
    },
  ]
  element.addSelectedItemToFilter('baz', items)

  const expectedItems: QueryElement[] = [
    {
      type: 'text',
      value: 'foobar',
    },
  ]

  // Assert
  expect(items).toStrictEqual(expectedItems)
})
