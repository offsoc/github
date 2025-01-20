import invariant from 'tiny-invariant'

import type {SuggestedRepository} from '../../client/api/repository/contracts'
import {deepCopy} from './utils'

export class RepositoriesCollection {
  private repositories: Array<SuggestedRepository>

  constructor(repositories: Array<SuggestedRepository> = []) {
    this.repositories = deepCopy(repositories)
  }

  public byId(id: number): SuggestedRepository {
    const repository = this.repositories.find(r => r.id === id)
    if (!repository) throw new Error('Repository not found')
    return repository
  }

  public all() {
    return this.repositories
  }

  public getRandom() {
    const index = Math.floor(Math.random() * this.repositories.length)
    const rdm = this.repositories[index]
    invariant(rdm, 'Repository not found')
    return rdm
  }
}
