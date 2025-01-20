import type {Milestone} from '../../client/api/common-contracts'

export class MilestonesCollection {
  // milestones should be keyed by the repository id to test how we handle
  // mismatched milestones in an organization
  private milestones: Map<number, Array<Milestone>>

  constructor(milestones: Map<number, Array<Milestone>> = new Map()) {
    this.milestones = new Map<number, Array<Milestone>>()

    if (milestones) {
      for (const [key, value] of milestones) {
        this.milestones.set(key, value)
      }
    }
  }

  public all() {
    return this.milestones
  }

  public byRepositoryId(id: number): Array<Milestone> {
    const milestones = this.milestones.get(id)
    if (!milestones) {
      return []
    }
    return milestones
  }

  public byId(id: number): Milestone {
    for (const value of this.milestones.values()) {
      const milestone = value.find(m => m.id === id)
      if (milestone) {
        return milestone
      }
    }

    throw new Error('Milestone not found')
  }
}
