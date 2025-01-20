import type {Label} from '../../client/api/common-contracts'
import {deepCopy} from './utils'

export class LabelsCollection {
  private labels: Array<Label>

  constructor(labels: Array<Label> = []) {
    this.labels = deepCopy(labels)
  }

  public all() {
    return this.labels
  }

  public byId(id: number): Label {
    const label = this.labels.find(l => l.id === id)
    if (!label) throw new Error('Label not found')
    return label
  }
}
