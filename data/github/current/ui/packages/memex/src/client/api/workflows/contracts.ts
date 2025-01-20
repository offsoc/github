export const MemexWorkflowTriggerType = {
  ItemAdded: 'item_added',
  Reopened: 'reopened',
  ReviewChangesRequested: 'review_changes_requested',
  ReviewApproved: 'review_approved',
  Closed: 'closed',
  Merged: 'merged',
  QueryMatched: 'query_matched',
  ProjectItemColumnUpdate: 'project_item_column_update',
  SubIssues: 'sub_issues',
} as const
export type MemexWorkflowTriggerType = ObjectValues<typeof MemexWorkflowTriggerType>

export const MemexActionType = {
  SetField: 'set_field',
  GetItems: 'get_items',
  GetProjectItems: 'get_project_items',
  ArchiveProjectItem: 'archive_project_item',
  AddProjectItem: 'add_project_item',
  CloseItem: 'close_item',
  GetSubIssues: 'get_sub_issues',
} as const
export type MemexActionType = ObjectValues<typeof MemexActionType>

export const MemexWorkflowActionPriority: Record<MemexActionType, number> = {
  get_project_items: 0,
  get_items: 0,
  get_sub_issues: 0,
  add_project_item: 1,
  archive_project_item: 1,
  close_item: 2,
  set_field: 2,
}

export type MemexWorkflowType = `${MemexWorkflowTriggerType}_${MemexActionType}`

export type MemexWorkflowId = number | MemexWorkflowType

export interface CreateWorkflowRequest {
  workflow: Omit<MemexWorkflow, 'id' | 'actions'> & {actions: Array<Omit<MemexWorkflowAction, 'id'>>}
}

export interface CreateWorkflowResponse {
  workflow: MemexWorkflowPersisted
}

export type UpdateWorkflowRequestChanges = Partial<
  Pick<MemexWorkflowPersisted, 'name' | 'enabled' | 'contentTypes' | 'actions'>
>
export type CreateWorkflowRequestChanges = Partial<Pick<MemexWorkflow, 'name' | 'enabled' | 'contentTypes' | 'actions'>>
export interface UpdateWorkflowRequest extends UpdateWorkflowRequestChanges {
  workflowNumber: number
}

export type UpdateWorkflowResponse = CreateWorkflowResponse

export const MemexWorkflowContentType = {
  Issue: 'Issue',
  PullRequest: 'PullRequest',
} as const
export type MemexWorkflowContentType = ObjectValues<typeof MemexWorkflowContentType>

export interface MemexWorkflow {
  id?: MemexWorkflowId
  name: string
  triggerType: MemexWorkflowTriggerType
  contentTypes: Array<MemexWorkflowContentType>
  enabled: boolean
  actions: Array<MemexWorkflowAction>
}

export type ClientMemexWorkflow = MemexWorkflow & {
  clientId: string
  isUserWorkflow: boolean
}

export type MemexWorkflowPersisted = MemexWorkflow & {
  id: number
  number: number
  actions: Array<MemexWorkflowActionPersisted>
}

interface SetFieldActionArguments {
  fieldId: number
  fieldOptionId: string
}

interface GetProjectItemsActionArguments {
  query: string
  fieldId?: number
  fieldOptionId?: string
}

interface GetItemsActionArguments {
  query: string
  repositoryId?: number
}

interface AddProjectItemActionArguments {
  repositoryId?: number
  subIssue?: boolean
}

export interface MemexWorkflowAction {
  id?: number
  actionType: MemexActionType
  arguments: Partial<
    SetFieldActionArguments & GetProjectItemsActionArguments & GetItemsActionArguments & AddProjectItemActionArguments
  >
}

export type MemexWorkflowActionPersisted = MemexWorkflowAction & {
  id: number
}

export interface MemexWorkflowConfiguration {
  triggerType: MemexWorkflowTriggerType
  enableable: boolean
  constraints: {contentTypes: Array<MemexWorkflowContentType>}
  defaultWorkflow: MemexWorkflow
}

export interface UpdateMemexWorkflowEnabledRequest {
  workflow: ClientMemexWorkflow
  enable: boolean
}

export type MemexWorkflowMenuState = {
  [key: string]: boolean
}
