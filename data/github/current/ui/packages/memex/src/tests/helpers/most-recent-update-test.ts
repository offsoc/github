import {mostRecentUpdateSingleton} from '../../client/state-providers/data-refresh/most-recent-update'

describe('mostRecentUpdateSingleton', () => {
  beforeEach(() => {
    mostRecentUpdateSingleton._reset()
  })
  it('should set the most recent update if it is greater than the current', () => {
    mostRecentUpdateSingleton.set(100)
    expect(mostRecentUpdateSingleton.get()).toBe(100)
    mostRecentUpdateSingleton.set(200)
    expect(mostRecentUpdateSingleton.get()).toBe(200)
  })
  it('should not set the most recent update if it is less than the current', () => {
    mostRecentUpdateSingleton.set(100)
    expect(mostRecentUpdateSingleton.get()).toBe(100)
    mostRecentUpdateSingleton.set(50)
    expect(mostRecentUpdateSingleton.get()).toBe(100)
  })
})
