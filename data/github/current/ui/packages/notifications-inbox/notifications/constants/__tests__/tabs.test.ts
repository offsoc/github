import Service, {NotificationTabKeys, NotificationTabs} from '../tabs'

describe('Tabs', () => {
  it('can detect invalid views', () => {
    expect(Service.isValidView('')).toBe(false)
    expect(Service.isValidView('invalid')).toBe(false)

    // Iterate over expected keys
    for (const key of Object.values(NotificationTabKeys)) {
      expect(Service.isValidView(key)).toBe(true)
    }
  })

  it('can get the name of a view', () => {
    expect(Service.getViewName('invalid')).toBe('')

    // Iterate over expected keys and their names
    for (const key of Object.values(NotificationTabKeys)) {
      expect(Service.getViewName(key)).toBe(NotificationTabs[key].name)
    }
  })

  it('can get the query of a view', () => {
    expect(Service.getViewQuery('invalid')).toBe('')

    // Iterate over expected keys and their queries
    for (const key of Object.values(NotificationTabKeys)) {
      expect(Service.getViewQuery(key)).toBe(NotificationTabs[key].query)
    }
  })
})
