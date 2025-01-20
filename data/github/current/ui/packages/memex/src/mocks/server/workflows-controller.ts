import type {
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  MemexWorkflowActionPersisted,
  MemexWorkflowPersisted,
  UpdateWorkflowRequest,
  UpdateWorkflowResponse,
} from '../../client/api/workflows/contracts'
import {post_createWorkflow, put_updateWorkflow} from '../msw-responders/workflows'
import {BaseController} from './base-controller'

export class WorkflowsController extends BaseController {
  // Offset to avoid conflicting with test fixtures.
  private nextWorkflowId = 100
  private nextActionId = 1000

  public get(): Array<MemexWorkflowPersisted> {
    return this.db.workflows.all()
  }

  public getById(id: number): MemexWorkflowPersisted {
    return this.db.workflows.byId(id)
  }

  public async add(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
    const actions: Array<MemexWorkflowActionPersisted> = request.workflow.actions.map(action => {
      return {...action, id: this.nextActionId++}
    })

    const id = this.nextWorkflowId++

    const newWorkflow: MemexWorkflowPersisted = {
      ...request.workflow,
      id,
      number: id,
      actions,
    }
    this.db.workflows.add(newWorkflow)
    this.log(
      `Creating workflow with triggerType ${newWorkflow.triggerType} and contentTypes ${newWorkflow.contentTypes}`,
    )
    return {workflow: newWorkflow}
  }

  public async update({
    workflowNumber,
    enabled,
    contentTypes,
    actions,
  }: UpdateWorkflowRequest): Promise<UpdateWorkflowResponse> {
    const workflow = this.db.workflows.byId(workflowNumber)
    if (enabled !== undefined) {
      workflow.enabled = enabled
    }
    if (contentTypes !== undefined) {
      workflow.contentTypes = contentTypes
    }

    if (actions !== undefined) {
      workflow.actions = actions
    }

    this.log(
      `Updating workflow with id ${workflow.id} with ${Object.entries({enabled, contentTypes})
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `Set ${key} to ${Array.isArray(value) ? `[${value.join(',')}]` : value}`)}`,
    )
    return {workflow}
  }

  public override handlers = [
    post_createWorkflow(async body => {
      return this.add(body)
    }),
    put_updateWorkflow(async body => {
      return this.update(body)
    }),
  ]
}
