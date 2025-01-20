import {LanguageStaticFilterProvider} from '../languages'

describe('LanguageStaticFilterProvider', () => {
  test('sorts priority, popular and all languages', () => {
    const provider = new LanguageStaticFilterProvider()

    const top10 = provider.filterValues.slice(0, 10).map(item => ({value: item.value, priority: item.priority}))
    expect(top10).toEqual([
      {value: 'C++', priority: 5},
      {value: 'Go', priority: 5},
      {value: 'Java', priority: 5},
      {value: 'JavaScript', priority: 5},
      {value: 'PHP', priority: 5},
      {value: 'Python', priority: 5},
      {value: 'Ruby', priority: 5},
      {value: 'TypeScript', priority: 5},
      {value: 'ABAP', priority: 10},
      {value: 'AGS Script', priority: 10},
    ])
  })
})
