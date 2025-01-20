import {group} from '../../utils/group'

test('can group by object properties', () => {
  // Example taken from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/group
  const inventory = [
    {name: 'asparagus', type: 'vegetables', quantity: 5},
    {name: 'bananas', type: 'fruit', quantity: 0},
    {name: 'goat', type: 'meat', quantity: 23},
    {name: 'cherries', type: 'fruit', quantity: 5},
    {name: 'fish', type: 'meat', quantity: 22},
  ]
  expect(group(inventory, item => item.type)).toEqual({
    vegetables: [{name: 'asparagus', type: 'vegetables', quantity: 5}],
    fruit: [
      {name: 'bananas', type: 'fruit', quantity: 0},
      {name: 'cherries', type: 'fruit', quantity: 5},
    ],
    meat: [
      {name: 'goat', type: 'meat', quantity: 23},
      {name: 'fish', type: 'meat', quantity: 22},
    ],
  })
  expect(group(inventory, item => item.quantity)).toEqual({
    5: [
      {name: 'asparagus', type: 'vegetables', quantity: 5},
      {name: 'cherries', type: 'fruit', quantity: 5},
    ],
    0: [{name: 'bananas', type: 'fruit', quantity: 0}],
    23: [{name: 'goat', type: 'meat', quantity: 23}],
    22: [{name: 'fish', type: 'meat', quantity: 22}],
  })
  expect(group(inventory, item => item.name)).toEqual({
    asparagus: [{name: 'asparagus', type: 'vegetables', quantity: 5}],
    bananas: [{name: 'bananas', type: 'fruit', quantity: 0}],
    goat: [{name: 'goat', type: 'meat', quantity: 23}],
    cherries: [{name: 'cherries', type: 'fruit', quantity: 5}],
    fish: [{name: 'fish', type: 'meat', quantity: 22}],
  })
})

test('can group by typeof', () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const elements = ['string', 1234, {object: true}, false, null, undefined, Array.prototype.filter, []]
  expect(group(elements, el => typeof el)).toEqual({
    string: ['string'],
    number: [1234],
    object: [{object: true}, null, []],
    // eslint-disable-next-line @typescript-eslint/unbound-method
    function: [Array.prototype.filter],
    boolean: [false],
    undefined: [undefined],
  })
})

test('typings support the fact some groups may be undefined', () => {
  const elements: Array<{num: number}> = [{num: 1}]
  const {overTen, underTen} = group(elements, el => (el.num > 10 ? 'overTen' : 'underTen'))

  expect(overTen).toBeUndefined()
  expect(underTen).toBeDefined()
})
