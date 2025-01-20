import {TIME_RANGE_VALUES} from '../constants/search-filters'

describe('time range values', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-03-05T12:00:00.000Z'))
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  it('produce correct date for yesterday', () => {
    const value = TIME_RANGE_VALUES.find(item => item.name === 'Yesterday')

    // assert value is defined
    expect(value).toBeDefined()
    expect(value?.valueFunc).toBeDefined()
    expect(value!.valueFunc!()).toBe('2023-03-04')
  })
})
