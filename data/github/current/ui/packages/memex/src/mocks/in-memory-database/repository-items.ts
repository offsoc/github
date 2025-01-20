import invariant from 'tiny-invariant'

import type {RepositoryItem} from '../../client/api/repository/contracts'
import {
  DefaultSuggestedRepositoryItems,
  SuggestedRepoItemsForManyBulkAdd,
  SuggestedRepositoryItemsForMemex,
} from '../data/suggestions'

export class RepositoryItemsCollection {
  private declare repositoryItems: Array<RepositoryItem>
  private declare repositoryItemsForMemex: Array<RepositoryItem>
  private declare repositoryItemsForMemexWithManyItems: Array<RepositoryItem>

  constructor() {
    this.repositoryItems = [...DefaultSuggestedRepositoryItems]
    this.repositoryItemsForMemex = [...SuggestedRepositoryItemsForMemex]
    this.repositoryItemsForMemexWithManyItems = [...SuggestedRepoItemsForManyBulkAdd]
  }

  public byId(id: number) {
    const repositoryItem = this.repositoryItems.find(item => item.id === id)
    if (!repositoryItem) throw new Error('Repository item not found')
    return repositoryItem
  }

  public all() {
    return this.repositoryItems
  }

  // for the mock repo with > 25 items to test the bulk add side panel
  public getManyItems() {
    return this.repositoryItemsForMemexWithManyItems
  }

  public removeAddedItems() {
    this.repositoryItemsForMemexWithManyItems.splice(0, 25)
  }

  public getForMemex() {
    return this.repositoryItemsForMemex
  }

  public getRandom() {
    const index = Math.floor(Math.random() * this.repositoryItemsForMemex.length)
    const rdm = this.repositoryItemsForMemex[index]
    invariant(rdm, 'Repository item not found')
    return rdm
  }
}
