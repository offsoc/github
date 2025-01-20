/**
 * This file keeps track of the most recent update made to an item in the project. This is structured as is to be a
 * singleton, so that it can be imported into any file and used to check if the item being updated is the most recent.
 */
class MostRecentUpdate {
  private updatedAt = 0

  public set = (updatedAt: number) => {
    if (updatedAt > this.updatedAt) {
      this.updatedAt = updatedAt
    }
  }

  public get = () => {
    return this.updatedAt
  }

  // used by tests to reset the most recent update
  public _reset = () => {
    this.updatedAt = 0
  }
}

export const mostRecentUpdateSingleton = new MostRecentUpdate()
