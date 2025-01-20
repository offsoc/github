import {pendingUpdatesSingleton} from '../../client/state-providers/data-refresh/pending-updates'

describe('pendingUpdatesSingleton', () => {
  beforeEach(() => {
    pendingUpdatesSingleton._reset()
  })
  it('should properly indicate pending updates based on the current number of updates', () => {
    expect(pendingUpdatesSingleton.hasPendingUpdates()).toBe(false)
    pendingUpdatesSingleton.increment()
    expect(pendingUpdatesSingleton.hasPendingUpdates()).toBe(true)
    pendingUpdatesSingleton.decrement()
    expect(pendingUpdatesSingleton.hasPendingUpdates()).toBe(false)
  })
  it('should allow multiple decrements sequentially to never decrease pending beyond 0', () => {
    pendingUpdatesSingleton.decrement()
    pendingUpdatesSingleton.decrement()
    expect(pendingUpdatesSingleton.hasPendingUpdates()).toBe(false)

    // after a single increment, the number of pending updates should be 1, as the decrement should not have gone below 0
    pendingUpdatesSingleton.increment()
    expect(pendingUpdatesSingleton.hasPendingUpdates()).toBe(true)
  })
  it('should report that there are no pending updates if the last update was 60 seconds ago', () => {
    pendingUpdatesSingleton.increment()
    expect(pendingUpdatesSingleton.hasPendingUpdates()).toBe(true)

    // after 60 seconds, the pending updates should be reset to 0
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 60 * 1000)
    expect(pendingUpdatesSingleton.hasPendingUpdates()).toBe(false)
  })
})
