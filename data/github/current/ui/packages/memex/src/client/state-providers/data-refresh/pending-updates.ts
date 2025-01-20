/**
 * PendingUpdates keeps track of the how many update API calls are pending, allowing consumers to check if there is
 * a chance of in-progress optimistic updates. This is structured as is to be a singleton, so that it can be imported
 * into any file and used to check if the item being updated is the most recent.
 */
class PendingUpdates {
  private lastIncremented = 0
  private value = 0

  public increment = () => {
    this.lastIncremented = Date.now()
    this.value++
  }

  public decrement = () => {
    // Ensure that we don't accidentally go negative
    this.value = Math.max(0, this.value - 1)
    if (this.value === 0) {
      this.lastIncremented = 0
    }
  }

  public hasPendingUpdates = () => {
    // if the last update was more than 60 seconds ago, then we can assume that there was an error state and the pending
    // updates value wasn't set, and should be reset
    if (this.value > 0 && this.lastIncremented <= Date.now() - 60 * 1000) {
      this.value = 0
      this.lastIncremented = 0
    }
    return this.value > 0
  }

  // used by tests to reset the the singleton
  public _reset = () => {
    this.lastIncremented = 0
    this.value = 0
  }
}

export const pendingUpdatesSingleton = new PendingUpdates()
