import type {ColorName} from '@github-ui/use-named-color'

import type {MemexChartType} from './charts/contracts/api'
import type {MemexColumnDataType} from './columns/contracts/memex-column'
import type {ViewTypeParam} from './view/contracts'
import type {MemexWorkflowTriggerType} from './workflows/contracts'

export interface User {
  id: number
  global_relay_id: string
  login: string
  name: string | null
  avatarUrl: string
  isSpammy: boolean
}

export interface Team {
  id: number
  slug: string
  name: string | null
  avatarUrl: string
}

export interface Owner {
  id: number
  login: string
  name: string | null
  avatarUrl: string
  type: 'organization' | 'user'
  isEnterpriseManaged?: boolean
  planName?: string
}

export type ActorType = 'user' | 'team'

interface UserCollaborator extends User {
  actor_type: 'user'
  role: CollaboratorRole
}

export interface TeamCollaborator extends Team {
  actor_type: 'team'
  role: CollaboratorRole
  membersCount: number
}

export type Collaborator = UserCollaborator | TeamCollaborator

export type Review = {
  reviewer: Reviewer
}

type ReviewerBase = {
  id: number
  name: string
  avatarUrl: string
  url: string
}

export type ReviewerUser = ReviewerBase & {
  type: 'User'
}

export type ReviewerTeam = ReviewerBase & {
  type: 'Team'
}

type Reviewer = ReviewerUser | ReviewerTeam

export interface Repository {
  name: string
  nameWithOwner: string
  id: number
  url: string
}

export interface ExtendedRepository extends Repository {
  isForked: boolean
  isPublic: boolean
  isArchived: boolean
  hasIssues: boolean
}

export type IAssignee = User

export const MilestoneState = {
  Open: 'open',
  Closed: 'closed',
} as const

export type MilestoneState = ObjectValues<typeof MilestoneState>

export interface Milestone {
  id: number
  title: string
  url: string
  state: MilestoneState
  dueDate?: string | null
  repoNameWithOwner: string
}

export interface Label {
  id: number
  name: string
  nameHtml: string
  color: string
  url: string
}

export const State = {
  Open: 'open',
  Closed: 'closed',
  Merged: 'merged',
  Draft: 'draft',
} as const

export type State = ObjectValues<typeof State>

export const StateReason = {
  NotPlanned: 'not_planned',
  Completed: 'completed',
  Reopened: 'reopened',
} as const
export type StateReason = ObjectValues<typeof StateReason>

export const PullRequestState = {
  Open: 'open',
  Closed: 'closed',
  Merged: 'merged',
} as const
export type PullRequestState = ObjectValues<typeof PullRequestState>

export const IssueState = {
  Open: 'open',
  Closed: 'closed',
} as const

export type IssueState = ObjectValues<typeof IssueState>

export const IssueStateReason = {
  NotPlanned: 'not_planned',
  Completed: 'completed',
  Reopened: 'reopened',
} as const

export type IssueStateReason = ObjectValues<typeof IssueStateReason>

export interface LinkedPullRequest {
  id: number
  number: number
  url: string
  isDraft: boolean
  state: PullRequestState
}

export interface IssueType {
  id: number
  name: string
  color?: ColorName
  description?: string
}

export interface ParentIssue {
  id: number
  globalRelayId: string
  number: number
  state: IssueState
  stateReason?: IssueStateReason
  nwoReference: string
  title: string
  url: string
  repository: string
  owner: string
  subIssueList: {
    total: number
    completed: number
    percentCompleted: number
  }
}

export interface SubIssuesProgress {
  id: number
  total: number
  completed: number
  percentCompleted: number
}

/**
 * This models the role of the current viewer
 */
export const Role = {
  Read: 'read',
  Write: 'write',
  Admin: 'admin',
  None: 'no access',
} as const

export type Role = ObjectValues<typeof Role>

export const CollaboratorRole = {
  Admin: 'project_admin',
  Writer: 'project_writer',
  Reader: 'project_reader',
  None: 'none',
} as const
export type CollaboratorRole = ObjectValues<typeof CollaboratorRole>

export const CollaboratorType = {
  User: 'user',
  Team: 'team',
  None: 'none',
} as const
export type CollaboratorType = ObjectValues<typeof CollaboratorType>

export interface Privileges {
  role: Role
  canChangeProjectVisibility: boolean
  canCopyAsTemplate: boolean
}

export const DefaultPrivileges: Privileges = {
  role: Role.Read,
  canChangeProjectVisibility: false,
  canCopyAsTemplate: false,
}

/**
 * This maps client-side role names to server-side role names.
 */
export const rolesMap = new Map<Role, CollaboratorRole>([
  [Role.Read, CollaboratorRole.Reader],
  [Role.Write, CollaboratorRole.Writer],
  [Role.Admin, CollaboratorRole.Admin],
  [Role.None, CollaboratorRole.None],
])

export const collaboratorRolesMap = new Map<CollaboratorRole, Role>([...rolesMap.entries()].map(([k, v]) => [v, k]))

export type CustomTemplate = {
  projectTitle: string
  projectNumber: number
  projectViews: Array<{name: string; viewType: ViewTypeParam}>
  projectFields: Array<{name: string; dataType: MemexColumnDataType; customField: boolean}>
  projectWorkflows: Array<{name: string; triggerType: MemexWorkflowTriggerType}>
  projectCharts: Array<{name: string; chartType: MemexChartType}>

  projectId: number
  projectUpdatedAt: string
  projectDescription?: string
  projectShortDescription?: string
}
