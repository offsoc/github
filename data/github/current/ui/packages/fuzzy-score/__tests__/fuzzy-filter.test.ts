import {fuzzyFilter} from '../fuzzy-filter'

test('filters out items and sorts correctly', () => {
  const items = ['hello', 'world', 'foo', 'zoo', 'z', 'bar']
  expect(fuzzyFilter({items, filter: 'z', key: i => i})).toEqual(['z', 'zoo'])
  expect(fuzzyFilter({items, filter: 'o', key: i => i})).toEqual(['foo', 'zoo', 'hello', 'world'])
  expect(fuzzyFilter({items, filter: 'el', key: i => i})).toEqual(['hello'])
})

test('takes into account the secondary key scoring', () => {
  const items = [
    {login: 'hello', name: 'world'},
    {login: 'world', name: 'test2'},
  ]

  expect(
    fuzzyFilter({
      items,
      filter: 'world',
      key: i => i.login,
      secondaryKey: i => i.name,
    }),
  ).toEqual(items)

  expect(
    fuzzyFilter({
      items,
      filter: 'e',
      key: i => i.login,
      secondaryKey: i => i.name,
    }),
  ).toEqual(items)

  expect(
    fuzzyFilter({
      items,
      filter: 't',
      key: i => i.login,
      secondaryKey: i => i.name,
    }),
  ).toEqual([items[1]])
})
