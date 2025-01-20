import {type ARIAFilterSuggestion, FilterProviderType} from '@github-ui/filter'

import {getAllDateProviders} from '../date'

describe('getAllDateProviders', () => {
  test('create providers with sample options', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-3-14'))

    const providers = getAllDateProviders()
    expect(providers).toHaveLength(2)

    const createdProvider = providers[0]!
    expect(createdProvider.type).toBe(FilterProviderType.Date)
    expect(createdProvider.filterValues).toHaveLength(3)
    expect(createdProvider.filterValues.map(v => v.displayName)).toEqual(['Today', 'This month', 'This year'])
    expect(getValue(createdProvider.filterValues[0]!)).toBe('2020-03-14')
    expect(getValue(createdProvider.filterValues[1]!)).toBe('>2020-02-29')
    expect(getValue(createdProvider.filterValues[2]!)).toBe('>2019-12-31')
  })
})

function getValue(filterValue: ARIAFilterSuggestion) {
  if (typeof filterValue.value === 'string') {
    return filterValue.value
  } else {
    return filterValue.value()
  }
}
