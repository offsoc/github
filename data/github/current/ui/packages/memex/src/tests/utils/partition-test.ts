import {identity} from '../../utils/identity'
import {partition} from '../../utils/partition'

test('should split elements into two groups by `predicate`', function () {
  const array = [1, 0, true]
  expect(partition([], identity)).toEqual([[], []])
  expect(partition(array, () => true)).toEqual([array, []])
  expect(partition(array, () => false)).toEqual([[], array])
  expect(partition([1, true, false, null, 0, '', 'test'], Boolean)).toEqual([
    [1, true, 'test'],
    [false, null, 0, ''],
  ])
})
