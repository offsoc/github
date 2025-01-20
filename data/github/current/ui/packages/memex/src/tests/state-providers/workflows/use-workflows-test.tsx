import {act, renderHook} from '@testing-library/react'
import type {MemoryRouterProps} from 'react-router-dom'

import type {Memex} from '../../../client/api/memex/contracts'
import {
  type ClientMemexWorkflow,
  MemexActionType,
  type MemexWorkflow,
  type MemexWorkflowConfiguration,
  MemexWorkflowContentType,
  type MemexWorkflowPersisted,
  MemexWorkflowTriggerType,
} from '../../../client/api/workflows/contracts'
import {MemexWorkflowConverter} from '../../../client/helpers/workflow-utilities'
import {useWorkflows} from '../../../client/state-providers/workflows/use-workflows'
import {statusColumn} from '../../../mocks/data/columns'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {statusOptions} from '../../../mocks/data/single-select'
import {
  autoAddItemsWorkflow,
  autoAddItemsWorkflowPersisted,
  closedWorkflowPersisted,
  closedWorkflowUncreated,
  customAutoAddWorkflowUncreated,
  DefaultWorkflowConfigurations,
  mergedWorkflowPersisted,
  reopenedWorkflowUncreated,
} from '../../../mocks/data/workflows'
import {DefaultColumns} from '../../../mocks/mock-data'
import type {MockServer} from '../../../mocks/server/mock-server'
import {InitialItems} from '../../../stories/data-source'
import {createMockEnvironment} from '../../create-mock-environment'
import {createWrapperForWorkflowEditor, type WrapperType} from './helpers'

let server: MockServer
let wrapper: WrapperType

const expectClientMemexWorkflowEquality = (
  clientWorkflow: ClientMemexWorkflow | undefined,
  workflow: MemexWorkflow,
) => {
  return expect(clientWorkflow).toEqual({
    ...workflow,
    clientId: expect.any(String),
    isUserWorkflow: false,
  })
}

describe('useWorkflows', () => {
  const setupTest = (
    initialServerData: {
      memex?: Memex
      workflows?: Array<MemexWorkflowPersisted>
      workflowConfigurations?: Array<MemexWorkflowConfiguration>
    } = {},
    routerProps?: MemoryRouterProps,
  ) => {
    const mockEnvironment = createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': DefaultColumns,
        'memex-data': 'memex' in initialServerData ? initialServerData.memex : DefaultMemex,
        'memex-workflows-data': initialServerData.workflows,
        'memex-workflow-configurations-data': initialServerData.workflowConfigurations,
        'memex-items-data': InitialItems,
      },
    })
    server = mockEnvironment.server
    wrapper = createWrapperForWorkflowEditor(routerProps)
  }

  it('returns default workflows', () => {
    setupTest({
      workflowConfigurations: [closedWorkflowUncreated],
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(result.current.workflows.length).toBe(1)
  })

  it('returns a workflow with no defaults', () => {
    setupTest({
      workflows: [closedWorkflowPersisted],
    })
    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(result.current.workflows.length).toBe(1)
  })

  it('does not return default workflow if created workflow with the same trigger type', () => {
    setupTest({
      workflows: [closedWorkflowPersisted],
      workflowConfigurations: [closedWorkflowUncreated],
    })
    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(result.current.workflows.length).toBe(1)
    expect(result.current.workflows[0].triggerType).toBe(MemexWorkflowTriggerType.Closed)
    expect(result.current.workflows[0].id).toBe(1)
  })

  it('handleEnabledChangeRequest prevents two simulatenous create requests for the same trigger type', async () => {
    setupTest({
      workflowConfigurations: [
        {
          triggerType: MemexWorkflowTriggerType.Closed,
          enableable: true,
          constraints: {
            contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
          },
          defaultWorkflow: {
            enabled: true,
            name: 'Closed',
            id: `${MemexWorkflowTriggerType.Closed}_${MemexActionType.SetField}`,
            triggerType: MemexWorkflowTriggerType.Closed,
            contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
            actions: [
              {
                actionType: MemexActionType.SetField,
                id: 1,
                arguments: {fieldId: statusColumn.databaseId, fieldOptionId: ''},
              },
            ],
          },
        },
      ],
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(result.current.workflows.length).toBe(1)

    await act(async () => {
      void result.current.handleEnabledChangeRequest.perform({workflow: result.current.workflows[0], enable: true})
      await result.current.handleEnabledChangeRequest.perform({workflow: result.current.workflows[0], enable: true})
    })

    // Only the first request is actually sent to the server
    expect(server.workflows.get().length).toBe(1)
    expect(result.current.workflows.length).toBe(1)
    expect(result.current.workflows[0].triggerType).toBe(MemexWorkflowTriggerType.Closed)
    expect(result.current.workflows[0].id).toBe(server.workflows.get()[0].id)
  })

  it('handleEnabledChangeRequest sets enabled for persisted state and in state provider', async () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [
      {
        id: 2,
        number: 2,
        enabled: false,
        name: 'Re-opened',
        triggerType: MemexWorkflowTriggerType.Closed,
        contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
        actions: [],
      },
    ]
    setupTest({workflows: initialWorkflows})

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(server.workflows.getById(2).enabled).toBe(false)
    expect(result.current.workflows[0].enabled).toBe(false)

    await act(async () => {
      await result.current.handleEnabledChangeRequest.perform({
        workflow: MemexWorkflowConverter.toClient(initialWorkflows[0]),
        enable: true,
      })
    })

    expect(server.workflows.getById(2).enabled).toBe(true)
    expect(result.current.workflows[0].enabled).toBe(true)
  })

  it('handleEnabledChangeRequest can set enabled: false for persisted state and in state provider', async () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [
      {
        id: 2,
        number: 2,
        enabled: true,
        name: 'Re-opened',
        triggerType: MemexWorkflowTriggerType.Closed,
        contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
        actions: [],
      },
    ]
    setupTest({workflows: initialWorkflows})

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(server.workflows.getById(2).enabled).toBe(true)
    expect(result.current.workflows[0].enabled).toBe(true)

    await act(async () => {
      await result.current.handleEnabledChangeRequest.perform({
        workflow: MemexWorkflowConverter.toClient(initialWorkflows[0]),
        enable: false,
      })
    })

    expect(server.workflows.getById(2).enabled).toBe(false)
    expect(result.current.workflows[0].enabled).toBe(false)
  })

  it('updateWorkflowAndAction will update both the workflow and action', async () => {
    setupTest({
      workflowConfigurations: [autoAddItemsWorkflow],
      workflows: [autoAddItemsWorkflowPersisted],
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(server.workflows.get().length).toBe(1)

    await act(async () => {
      await result.current.updateWorkflowAndAction(
        {
          ...result.current.workflows[0],
          contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
          enabled: true,
        },
        [
          {
            actionType: MemexActionType.GetItems,
            arguments: {query: 'is:issue,pr is:open label:bug', repositoryId: 3},
          },
        ],
      )
    })

    expect(server.workflows.get().length).toBe(1)
    expect(server.workflows.get()[0].contentTypes).toEqual([
      MemexWorkflowContentType.Issue,
      MemexWorkflowContentType.PullRequest,
    ])
    expect(server.workflows.get()[0].enabled).toBe(true)
    expect(
      server.workflows
        .get()[0]
        .actions.some(action => action.actionType === MemexActionType.GetItems && action.arguments.repositoryId === 3),
    ).toBe(true)
  })

  it('updateWorkflowAndAction replaces the correct workflow in state after updating', async () => {
    setupTest({
      workflowConfigurations: [reopenedWorkflowUncreated, autoAddItemsWorkflow],
      // Sets enabled to true so it defaults to the active workflow
      workflows: [{...autoAddItemsWorkflowPersisted, enabled: true}],
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(server.workflows.get()).toHaveLength(1)
    expect(result.current.workflows).toHaveLength(2)

    const reopenedWorkflowUncreatedClientId = result.current.workflows[0].clientId
    const autoAddClientId = result.current.workflows[1].clientId

    await act(async () => {
      await result.current.updateWorkflowAndAction(
        {
          ...result.current.workflows[1],
          contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
          enabled: true,
        },
        [
          {
            actionType: MemexActionType.GetItems,
            arguments: {query: 'is:issue,pr is:open label:bug', repositoryId: 3},
          },
          {
            actionType: MemexActionType.AddProjectItem,
            arguments: {repositoryId: 3},
          },
        ],
      )
    })

    expect(server.workflows.get()).toHaveLength(1)
    expect(result.current.workflows).toHaveLength(2)

    expect(result.current.workflows[0].clientId).toBe(reopenedWorkflowUncreatedClientId)
    expect(result.current.workflows[0].enabled).toBe(false)
    expect(result.current.workflows[1].clientId).toBe(autoAddClientId)
    expect(result.current.workflows[1].enabled).toBe(true)
  })

  it('updateWorkflowAndAction replaces the correct workflow in state after creating', async () => {
    setupTest({
      workflowConfigurations: [autoAddItemsWorkflow, reopenedWorkflowUncreated],
      workflows: [],
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(server.workflows.get()).toHaveLength(0)
    expect(result.current.workflows).toHaveLength(2)

    const autoAddClientIdAfterCreation = '100'
    const reopenedWorkflowUncreatedClientId = result.current.workflows[1].clientId

    await act(async () => {
      await result.current.updateWorkflowAndAction(
        {
          ...result.current.workflows[0],
          contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
          enabled: true,
        },
        [
          {
            actionType: MemexActionType.GetItems,
            arguments: {query: 'is:issue,pr is:open label:bug', repositoryId: 3},
          },
          {
            actionType: MemexActionType.AddProjectItem,
            arguments: {repositoryId: 3},
          },
        ],
      )
    })

    expect(server.workflows.get()).toHaveLength(1)
    expect(result.current.workflows).toHaveLength(2)

    expect(result.current.workflows[0].clientId).toBe(autoAddClientIdAfterCreation)
    expect(result.current.workflows[0].enabled).toBe(true)
    expect(result.current.workflows[1].clientId).toBe(reopenedWorkflowUncreatedClientId)
    expect(result.current.workflows[1].enabled).toBe(false)
  })

  it('getValidContentTypesForTriggerType reads from configuration data', () => {
    setupTest({
      workflowConfigurations: DefaultWorkflowConfigurations,
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(result.current.getValidContentTypesForTriggerType(MemexWorkflowTriggerType.Closed)).toEqual([
      MemexWorkflowContentType.Issue,
      MemexWorkflowContentType.PullRequest,
    ])

    expect(result.current.getValidContentTypesForTriggerType(MemexWorkflowTriggerType.Merged)).toEqual([
      MemexWorkflowContentType.PullRequest,
    ])
  })

  it('workflowWithTriggerTypeIsEnableable reads from configuration data', () => {
    setupTest({
      // Make the Reopened trigger type enableable: false, so that we can make sure things are properly
      // read from the JSON island
      workflowConfigurations: DefaultWorkflowConfigurations.map(configuration => {
        if (configuration.triggerType === MemexWorkflowTriggerType.Reopened) {
          return {...configuration, enableable: false}
        }
        return configuration
      }),
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})

    expect(result.current.workflowWithTriggerTypeIsEnableable(MemexWorkflowTriggerType.Closed)).toBe(true)
    expect(result.current.workflowWithTriggerTypeIsEnableable(MemexWorkflowTriggerType.Reopened)).toBe(false)
  })

  it('workflowsUsingColumnOption returns persisted workflows with actions that reference the column option', () => {
    const columnId = statusColumn.databaseId
    const columnOptionId = statusOptions[statusOptions.length - 1].id
    const anyOtherOptionId = statusOptions[statusOptions.length - 2].id

    const targetWorkflow = {...closedWorkflowPersisted, name: 'Match Me!'}
    const anotherWorkflow = {
      ...mergedWorkflowPersisted,
      actions: [
        {
          actionType: MemexActionType.SetField,
          id: 2,
          arguments: {fieldId: statusColumn.databaseId, fieldOptionId: anyOtherOptionId},
        },
      ],
    }
    const persistedWorkflows: Array<MemexWorkflowPersisted> = [targetWorkflow, anotherWorkflow]
    const configurationWorkflows: Array<MemexWorkflowConfiguration> = [reopenedWorkflowUncreated]

    setupTest({
      workflows: persistedWorkflows,
      workflowConfigurations: configurationWorkflows,
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(result.current.workflows.length).toBe(3)
    expect(result.current.workflowsUsingColumnOption(columnId, columnOptionId).length).toBe(1)
    expect(result.current.workflowsUsingColumnOption(columnId, columnOptionId)[0].name).toBe('Match Me!')
  })

  it('workflowsUsingMissingColumnOption returns persisted workflows with actions that reference a missing column option', () => {
    const columnId = statusColumn.databaseId
    const columnOptionId = statusOptions[statusOptions.length - 1].id
    const anyOtherOptionId = statusOptions[statusOptions.length - 2].id
    const anyOtherOptionId2 = statusOptions[statusOptions.length - 3].id

    const targetWorkflow = {
      ...closedWorkflowPersisted,
      name: 'Match Me!',
      actions: [
        {
          actionType: MemexActionType.SetField,
          id: 2,
          arguments: {fieldId: columnId, fieldOptionId: columnOptionId},
        },
      ],
    }
    const anotherWorkflow = {
      ...mergedWorkflowPersisted,
      actions: [
        {
          actionType: MemexActionType.SetField,
          id: 2,
          arguments: {fieldId: statusColumn.databaseId, fieldOptionId: anyOtherOptionId},
        },
      ],
    }

    const persistedWorkflows: Array<MemexWorkflowPersisted> = [targetWorkflow, anotherWorkflow]
    const configurationWorkflows: Array<MemexWorkflowConfiguration> = [reopenedWorkflowUncreated]

    setupTest({
      workflows: persistedWorkflows,
      workflowConfigurations: configurationWorkflows,
    })

    const otherColumnOptionsIds = [anyOtherOptionId, anyOtherOptionId2]

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(result.current.workflows.length).toBe(3)
    expect(result.current.workflowsUsingMissingColumnOption(columnId, otherColumnOptionsIds).length).toBe(1)
    expect(result.current.workflowsUsingMissingColumnOption(columnId, otherColumnOptionsIds)[0].name).toBe('Match Me!')
  })

  it('setAllWorkflows merges unpersisted and created workflows correctly', () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [closedWorkflowPersisted]
    const workflowConfigurations: Array<MemexWorkflowConfiguration> = [
      closedWorkflowUncreated,
      customAutoAddWorkflowUncreated,
    ]
    setupTest({
      workflows: initialWorkflows,
      workflowConfigurations,
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})

    const workflows = result.current.workflows

    expect(workflows).toHaveLength(2)
    expectClientMemexWorkflowEquality(workflows[0], closedWorkflowPersisted)
    expectClientMemexWorkflowEquality(workflows[1], customAutoAddWorkflowUncreated.defaultWorkflow)
  })

  it('setAllWorkflows can replace persisted workflow state in state provider', () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [closedWorkflowPersisted]
    setupTest({
      workflows: initialWorkflows,
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expectClientMemexWorkflowEquality(result.current.workflows[0], initialWorkflows[0])

    const replacedWorkflows: Array<MemexWorkflowPersisted> = [{...closedWorkflowPersisted, id: 2, number: 2}]

    act(() => {
      result.current.setAllWorkflows([], replacedWorkflows)
    })

    expectClientMemexWorkflowEquality(result.current.workflows[0], replacedWorkflows[0])
  })

  it('newWorkflow can add a new non persisted workflow to the workflows state in state provider', () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [closedWorkflowPersisted]
    setupTest({
      workflows: initialWorkflows,
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})

    act(() => {
      result.current.newWorkflow(
        'New workflow',
        `${MemexWorkflowTriggerType.QueryMatched}_${MemexActionType.AddProjectItem}`,
      )
    })

    expect(result.current.workflows[result.current.workflows.length - 1].name).toEqual('New workflow')
  })

  it('newWorkflow can returns false when it cannot create a new non persisted workflow to the workflows state in state provider', () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [closedWorkflowPersisted]
    setupTest({
      workflows: initialWorkflows,
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})

    act(() => {
      const didCreate = result.current.newWorkflow(
        initialWorkflows[0].name,
        `${MemexWorkflowTriggerType.QueryMatched}_${MemexActionType.AddProjectItem}`,
      )
      expect(didCreate).toBe(false)
    })

    expect(result.current.workflows.length).toEqual(initialWorkflows.length)
  })

  it('sets the active workflow to match the workflow Id in the URL', () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [closedWorkflowPersisted, mergedWorkflowPersisted]
    setupTest(
      {
        workflows: initialWorkflows,
      },
      {initialEntries: ['/orgs/github/projects/1/workflows/2']},
    )

    const {result} = renderHook(() => useWorkflows(), {wrapper})

    expectClientMemexWorkflowEquality(result.current.activeWorkflow, initialWorkflows[1])
  })

  it('sets the active workflow to match the workflow client Id in the URL', () => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValueOnce('123-abc-def-456-789')
    const initialWorkflows: Array<MemexWorkflowPersisted> = [closedWorkflowPersisted, mergedWorkflowPersisted]

    setupTest(
      {
        workflows: initialWorkflows,
        workflowConfigurations: [customAutoAddWorkflowUncreated],
      },
      {initialEntries: ['/orgs/github/projects/1/workflows/123-abc-def-456-789']},
    )

    const {result} = renderHook(() => useWorkflows(), {wrapper})
    expect(result.current.workflows.length).toBe(3)

    expectClientMemexWorkflowEquality(result.current.activeWorkflow, customAutoAddWorkflowUncreated.defaultWorkflow)
  })

  it('sets active workflow to the first workflow when workflow Id in the URL is invalid', () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [closedWorkflowPersisted, mergedWorkflowPersisted]
    setupTest(
      {
        workflows: initialWorkflows,
      },
      {initialEntries: ['/orgs/github/projects/1/workflows/-1']},
    )

    const {result} = renderHook(() => useWorkflows(), {wrapper})

    expectClientMemexWorkflowEquality(result.current.activeWorkflow, initialWorkflows[0])
  })

  it('returns case-insensitive workflowNames of existing workflows excluding the active workflow', () => {
    const initialWorkflows: Array<MemexWorkflowPersisted> = [closedWorkflowPersisted, mergedWorkflowPersisted]
    setupTest({
      workflows: initialWorkflows,
    })

    const {result} = renderHook(() => useWorkflows(), {wrapper})

    expectClientMemexWorkflowEquality(result.current.activeWorkflow, initialWorkflows[0])
    expect(result.current.workflowNames).toEqual(new Set([mergedWorkflowPersisted.name.toLocaleLowerCase()]))
  })
})
