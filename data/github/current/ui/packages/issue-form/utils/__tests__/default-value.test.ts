import {safeGetDefaultValue} from '../default-value'

test('correct returns the default value based on variable priority', () => {
  expect(safeGetDefaultValue({id: 'title', value: 'somethingelse', defaultValuesById: {title: 'test'}})).toBe('test')

  expect(safeGetDefaultValue({id: 'title', value: 'somethingelse', defaultValuesById: {body: 'test'}})).toBe(
    'somethingelse',
  )

  expect(safeGetDefaultValue({id: 'title', value: undefined, defaultValuesById: {title: 'test'}})).toBe('test')
  expect(safeGetDefaultValue({id: 'title', value: undefined, defaultValuesById: {body: 'test'}})).toBe('')
  expect(safeGetDefaultValue({id: undefined, value: 'val', defaultValuesById: {body: 'test'}})).toBe('val')
  expect(safeGetDefaultValue({id: 'test', value: 'val'})).toBe('val')
  expect(safeGetDefaultValue({})).toBe('')
})
