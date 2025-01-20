import type {ParentIssue} from '../../client/api/common-contracts'
import {deepCopy} from './utils'

export class ParentIssuesCollection {
  private parentIssues: Array<ParentIssue>

  constructor(issues?: Array<ParentIssue>) {
    if (issues) {
      this.parentIssues = deepCopy(issues)
    }
  }

  public all() {
    return this.parentIssues
  }
}
