import invariant from 'tiny-invariant'

import type {IAssignee} from '../../client/api/common-contracts'
import {deepCopy} from './utils'

export class AssigneesCollection {
  private assignees: Array<IAssignee>

  constructor(assignees: Array<IAssignee> = []) {
    this.assignees = deepCopy(assignees)
  }

  public all() {
    return this.assignees
  }

  public byId(id: number): IAssignee {
    const assignee = this.assignees.find(a => a.id === id)
    if (!assignee) throw new Error('Assignee not found')
    return assignee
  }

  public getRandom() {
    const index = Math.floor(Math.random() * this.assignees.length)
    const rdm = this.assignees[index]
    invariant(rdm, 'Assignee not found')
    return rdm
  }
}
