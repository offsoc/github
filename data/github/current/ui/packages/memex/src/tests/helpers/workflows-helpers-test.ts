import {MemexWorkflowConverter} from '../../client/helpers/workflow-utilities'
import {mergeInitialWorkflows} from '../../client/state-providers/workflows/workflows-helpers'
import {
  autoAddItemsWorkflow,
  autoAddItemsWorkflowPersisted,
  closedWorkflowPersisted,
  closedWorkflowUncreated,
} from '../../mocks/data/workflows'

describe('mergeInitialWorkflows', () => {
  it('merges workflow configurations with created workflows correctly', () => {
    const workflowConfigurations = [closedWorkflowUncreated, autoAddItemsWorkflow]
    const persistedWorkflows = [closedWorkflowPersisted]

    const workflows = mergeInitialWorkflows([], workflowConfigurations, persistedWorkflows, false)

    expect(workflows).toEqual([
      {
        ...MemexWorkflowConverter.toClient(closedWorkflowPersisted),
        isUserWorkflow: false,
        clientId: closedWorkflowPersisted.id.toString(),
      },
      {
        ...MemexWorkflowConverter.toClient(autoAddItemsWorkflow.defaultWorkflow),
        isUserWorkflow: false,
        clientId: expect.any(String),
      },
    ])
  })

  it('takes the first workflow of its type as the default workflow', () => {
    const autoAddItemsWorkflowPersisted2 = {
      ...autoAddItemsWorkflowPersisted,
      id: 10,
      number: 10,
    }
    const workflowConfigurations = [closedWorkflowUncreated, autoAddItemsWorkflow]
    const persistedWorkflows = [autoAddItemsWorkflowPersisted, autoAddItemsWorkflowPersisted2]

    const workflows = mergeInitialWorkflows([], workflowConfigurations, persistedWorkflows, false)

    expect(workflows).toEqual([
      {
        ...MemexWorkflowConverter.toClient(closedWorkflowUncreated.defaultWorkflow),
        isUserWorkflow: false,
        clientId: expect.any(String),
      },
      {
        ...autoAddItemsWorkflowPersisted,
        isUserWorkflow: false,
        clientId: autoAddItemsWorkflowPersisted.id.toString(),
      },
      {
        ...autoAddItemsWorkflowPersisted2,
        isUserWorkflow: true,
        clientId: autoAddItemsWorkflowPersisted2.id.toString(),
      },
    ])
  })

  it('merges existing workflows with updated workflow configurations from server correctly during live update', () => {
    const existingWorkflows = [
      MemexWorkflowConverter.toClient(closedWorkflowPersisted, false, closedWorkflowPersisted.id.toString()),
      MemexWorkflowConverter.toClient(autoAddItemsWorkflow.defaultWorkflow),
    ]
    const updatedAutoAddConfig = {
      ...autoAddItemsWorkflow,
      defaultWorkflow: {
        ...autoAddItemsWorkflow.defaultWorkflow,
        name: 'Updated default auto add items workflow',
      },
    }
    const workflowConfigurations = [closedWorkflowUncreated, updatedAutoAddConfig]
    const persistedWorkflows = [closedWorkflowPersisted]

    const workflows = mergeInitialWorkflows(existingWorkflows, workflowConfigurations, persistedWorkflows, false)

    expect(workflows).toEqual([
      existingWorkflows[0],
      {
        ...existingWorkflows[1],
        isUserWorkflow: false,
        name: 'Updated default auto add items workflow',
      },
    ])
  })

  it('merges existing workflows with updated persisted workflows from server correctly during live update', () => {
    const existingWorkflows = [
      MemexWorkflowConverter.toClient(closedWorkflowPersisted, false, closedWorkflowPersisted.id.toString()),
      MemexWorkflowConverter.toClient(autoAddItemsWorkflow.defaultWorkflow),
    ]

    const persistedAutoAddWorkflow = {
      ...autoAddItemsWorkflowPersisted,
      name: 'Updated default auto add items workflow',
    }

    const workflowConfigurations = [closedWorkflowUncreated, autoAddItemsWorkflow]
    const persistedWorkflows = [closedWorkflowPersisted, persistedAutoAddWorkflow]

    const workflows = mergeInitialWorkflows(existingWorkflows, workflowConfigurations, persistedWorkflows, false)

    expect(workflows).toEqual([
      existingWorkflows[0],
      {
        ...persistedAutoAddWorkflow,
        isUserWorkflow: false,
        clientId: persistedAutoAddWorkflow.id.toString(),
      },
    ])
  })
})
