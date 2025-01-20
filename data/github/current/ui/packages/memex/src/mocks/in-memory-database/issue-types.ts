import type {IssueType} from '../../client/api/common-contracts'

export class IssueTypesCollection {
  private issueTypes: Map<number, Array<IssueType>>

  constructor(issueTypes: Map<number, Array<IssueType>> = new Map()) {
    this.issueTypes = new Map<number, Array<IssueType>>()

    if (issueTypes) {
      for (const [key, value] of issueTypes) {
        this.issueTypes.set(key, value)
      }
    }
  }

  public all() {
    return this.issueTypes
  }

  public byRepositoryId(id: number): Array<IssueType> {
    const issueTypes = this.issueTypes.get(id)
    if (!issueTypes) {
      return []
    }
    return issueTypes
  }

  public byId(id: number): IssueType {
    for (const value of this.issueTypes.values()) {
      const issueType = value.find(v => v.id === id)
      if (issueType) {
        return issueType
      }
    }

    throw new Error('IssueType not found')
  }
}
