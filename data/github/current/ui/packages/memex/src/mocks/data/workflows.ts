import {
  MemexActionType,
  type MemexWorkflowConfiguration,
  MemexWorkflowContentType,
  type MemexWorkflowPersisted,
  MemexWorkflowTriggerType,
} from '../../client/api/workflows/contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {statusColumn} from './columns'
import {statusOptions} from './single-select'

export const MAX_ARCHIVED_ITEMS = 10000

const itemAddedWorkflowUncreated: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.ItemAdded,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Item added to project',
    id: `${MemexWorkflowTriggerType.ItemAdded}_${MemexActionType.SetField}`,
    triggerType: MemexWorkflowTriggerType.ItemAdded,
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.SetField,
        arguments: {
          fieldId: statusColumn.databaseId,
          fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[0]).id,
        },
      },
    ],
  },
}

export const autoCloseItemWorkflow: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.ProjectItemColumnUpdate,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.Issue],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Auto-close issue',
    id: `${MemexWorkflowTriggerType.ProjectItemColumnUpdate}_${MemexActionType.CloseItem}`,
    triggerType: MemexWorkflowTriggerType.ProjectItemColumnUpdate,
    contentTypes: [MemexWorkflowContentType.Issue],
    actions: [
      {
        actionType: MemexActionType.GetProjectItems,
        arguments: {
          fieldId: statusColumn.databaseId,
          fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[statusOptions.length - 1]).id,
        },
      },
      {
        actionType: MemexActionType.CloseItem,
        arguments: {},
      },
    ],
  },
}

export const autoArchiveItemsWorkflow: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.QueryMatched,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Auto-archive items',
    id: `${MemexWorkflowTriggerType.QueryMatched}_${MemexActionType.ArchiveProjectItem}`,
    triggerType: MemexWorkflowTriggerType.QueryMatched,
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.ArchiveProjectItem,
        arguments: {},
      },
      {
        actionType: MemexActionType.GetProjectItems,
        arguments: {query: 'is:closed'},
      },
    ],
  },
}

export const autoAddItemsWorkflow: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.QueryMatched,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Auto-add to project',
    id: `${MemexWorkflowTriggerType.QueryMatched}_${MemexActionType.AddProjectItem}`,
    triggerType: MemexWorkflowTriggerType.QueryMatched,
    contentTypes: [MemexWorkflowContentType.Issue],
    actions: [
      {
        actionType: MemexActionType.AddProjectItem,
        arguments: {},
      },
      {
        actionType: MemexActionType.GetItems,
        arguments: {query: 'is:issue label:bug'},
      },
    ],
  },
}

export const reopenedWorkflowUncreated: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.Reopened,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Item reopened',
    id: `${MemexWorkflowTriggerType.Reopened}_${MemexActionType.SetField}`,
    triggerType: MemexWorkflowTriggerType.Reopened,
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.SetField,
        arguments: {
          fieldId: statusColumn.databaseId,
          fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[1]).id,
        },
      },
    ],
  },
}

export const closedWorkflowUncreated: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.Closed,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Item closed',
    id: `${MemexWorkflowTriggerType.Closed}_${MemexActionType.SetField}`,
    triggerType: MemexWorkflowTriggerType.Closed,
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.SetField,
        arguments: {
          fieldId: statusColumn.databaseId,
          fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[statusOptions.length - 1]).id,
        },
      },
    ],
  },
}

const reviewChangesRequestedWorkflowUncreated: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.ReviewChangesRequested,
  enableable: false,
  constraints: {
    contentTypes: [MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Code changes requested',
    id: `${MemexWorkflowTriggerType.ReviewChangesRequested}_${MemexActionType.SetField}`,
    triggerType: MemexWorkflowTriggerType.ReviewChangesRequested,
    contentTypes: [MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.SetField,
        arguments: {
          fieldId: statusColumn.databaseId,
          fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[1]).id,
        },
      },
    ],
  },
}

const reviewApprovedWorkflowUncreated: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.ReviewApproved,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Code review approved',
    id: `${MemexWorkflowTriggerType.ReviewApproved}_${MemexActionType.SetField}`,
    triggerType: MemexWorkflowTriggerType.ReviewApproved,
    contentTypes: [MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.SetField,
        arguments: {
          fieldId: statusColumn.databaseId,
          fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[1]).id,
        },
      },
    ],
  },
}

export const customAutoAddWorkflowUncreated: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.QueryMatched,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'New workflow',
    id: undefined,
    triggerType: MemexWorkflowTriggerType.QueryMatched,
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.AddProjectItem,
        arguments: {},
      },
      {
        actionType: MemexActionType.GetItems,
        arguments: {query: 'is:issue label:bug'},
      },
    ],
  },
}

const mergedWorkflowConfiguration: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.Merged,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: false,
    name: 'Pull request merged',
    id: `${MemexWorkflowTriggerType.Merged}_${MemexActionType.SetField}`,
    triggerType: MemexWorkflowTriggerType.Merged,
    contentTypes: [MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.SetField,
        arguments: {
          fieldId: statusColumn.databaseId,
          fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[statusOptions.length - 1]).id,
        },
      },
    ],
  },
}

export const DefaultWorkflowConfigurations = [
  itemAddedWorkflowUncreated,
  reopenedWorkflowUncreated,
  closedWorkflowUncreated,
  reviewChangesRequestedWorkflowUncreated,
  reviewApprovedWorkflowUncreated,
  mergedWorkflowConfiguration,
  autoArchiveItemsWorkflow,
  autoAddItemsWorkflow,
  autoCloseItemWorkflow,
]

export const closedWorkflowPersisted: MemexWorkflowPersisted = {
  id: 1,
  number: 1,
  enabled: true,
  name: 'Item closed',
  contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  triggerType: MemexWorkflowTriggerType.Closed,
  actions: [
    {
      actionType: MemexActionType.SetField,
      id: 1,
      arguments: {
        fieldId: statusColumn.databaseId,
        fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[statusOptions.length - 1]).id,
      },
    },
  ],
}

export const mergedWorkflowPersisted: MemexWorkflowPersisted = {
  id: 2,
  number: 2,
  enabled: true,
  name: 'Pull request merged',
  contentTypes: [MemexWorkflowContentType.PullRequest],
  triggerType: MemexWorkflowTriggerType.Merged,
  actions: [
    {
      actionType: MemexActionType.SetField,
      id: 2,
      arguments: {
        fieldId: statusColumn.databaseId,
        fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[statusOptions.length - 1]).id,
      },
    },
  ],
}

export const autoArchiveItemsWorkflowPersisted: MemexWorkflowPersisted = {
  id: 3,
  number: 3,
  enabled: false,
  name: 'Auto-archive items',
  contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  triggerType: MemexWorkflowTriggerType.QueryMatched,
  actions: [
    {
      id: 3,
      actionType: MemexActionType.ArchiveProjectItem,
      arguments: {},
    },
    {
      id: 4,
      actionType: MemexActionType.GetProjectItems,
      arguments: {query: 'is:closed'},
    },
  ],
}

export const autoAddItemsWorkflowPersisted: MemexWorkflowPersisted = {
  id: 4,
  number: 4,
  enabled: false,
  name: 'Auto-add to project',
  contentTypes: [MemexWorkflowContentType.Issue],
  triggerType: MemexWorkflowTriggerType.QueryMatched,
  actions: [
    {
      id: 5,
      actionType: MemexActionType.AddProjectItem,
      arguments: {repositoryId: 1},
    },
    {
      id: 6,
      actionType: MemexActionType.GetItems,
      arguments: {query: 'is:issue label:bug', repositoryId: 1},
    },
  ],
}

export const closedWorkflowMigratedPersisted: MemexWorkflowPersisted = {
  id: 5,
  number: 6,
  enabled: true,
  name: 'Item closed (1)',
  contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  triggerType: MemexWorkflowTriggerType.Closed,
  actions: [
    {
      actionType: MemexActionType.SetField,
      id: 7,
      arguments: {
        fieldId: statusColumn.databaseId,
        fieldOptionId: not_typesafe_nonNullAssertion(statusOptions[statusOptions.length - 1]).id,
      },
    },
  ],
}

export const DefaultWorkflowsPersisted = [
  closedWorkflowPersisted,
  mergedWorkflowPersisted,
  autoArchiveItemsWorkflowPersisted,
  autoAddItemsWorkflowPersisted,
]

export const invalidClosedWorkflowUncreated: MemexWorkflowConfiguration = {
  triggerType: MemexWorkflowTriggerType.Closed,
  enableable: true,
  constraints: {
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  },
  defaultWorkflow: {
    enabled: true,
    name: 'Item closed',
    id: `${MemexWorkflowTriggerType.Closed}_${MemexActionType.SetField}`,
    triggerType: MemexWorkflowTriggerType.Closed,
    contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
    actions: [
      {
        actionType: MemexActionType.SetField,
        arguments: {fieldId: statusColumn.databaseId, fieldOptionId: ''},
      },
    ],
  },
}

export const invalidClosedWorkflowPersisted: MemexWorkflowPersisted = {
  id: 1,
  number: 1,
  enabled: true,
  name: 'Item closed',
  contentTypes: [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest],
  triggerType: MemexWorkflowTriggerType.Closed,
  actions: [
    {
      actionType: MemexActionType.SetField,
      id: 1,
      arguments: {fieldId: statusColumn.databaseId, fieldOptionId: ''},
    },
  ],
}

export const invalidAutoAddItemsWorkflowPersisted: MemexWorkflowPersisted = {
  id: 4,
  number: 4,
  enabled: false,
  name: 'Auto-add to project',
  contentTypes: [MemexWorkflowContentType.Issue],
  triggerType: MemexWorkflowTriggerType.QueryMatched,
  actions: [
    {
      id: 5,
      actionType: MemexActionType.AddProjectItem,
      arguments: {},
    },
    {
      id: 6,
      actionType: MemexActionType.GetItems,
      arguments: {query: 'is:issue label:bug', repositoryId: 1},
    },
  ],
}
