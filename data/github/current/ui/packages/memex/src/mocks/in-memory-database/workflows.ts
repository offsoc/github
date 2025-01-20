import type {MemexWorkflowPersisted} from '../../client/api/workflows/contracts'
import {deepCopy} from './utils'

export class WorkflowsCollection {
  private workflows: Array<MemexWorkflowPersisted>

  constructor(workflows: Array<MemexWorkflowPersisted> = []) {
    this.workflows = deepCopy(workflows)
  }

  public all(): Array<MemexWorkflowPersisted> {
    return this.workflows
  }

  public byId(id: number): MemexWorkflowPersisted {
    const workflow = this.workflows.find(wf => wf.id === id)
    if (!workflow) throw new Error('Workflow not found')
    return workflow
  }

  public add(workflow: MemexWorkflowPersisted) {
    this.workflows.push(workflow)
  }
}
