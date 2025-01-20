import type {MemexChart} from '../charts/contracts/api'
import type {ServerDateValue} from '../columns/contracts/date'
import type {MemexColumn, MemexProjectColumnId, SystemColumnId} from '../columns/contracts/memex-column'
import type {NumericValue} from '../columns/contracts/number'
import type {PersistedOption} from '../columns/contracts/single-select'
import type {EnrichedText} from '../columns/contracts/text'
import type {
  Collaborator,
  CollaboratorRole,
  CustomTemplate,
  ExtendedRepository,
  IAssignee,
  IssueType,
  Label,
  LinkedPullRequest,
  Milestone,
  Review,
  Role,
  Team,
  User,
} from '../common-contracts'
import type {CreatedWithTemplateMemex} from '../created-with-template-memex/api'
import type {MemexItem} from '../memex-items/contracts'
import type {PageView} from '../view/contracts'
import type {MemexWorkflowConfiguration, MemexWorkflowPersisted} from '../workflows/contracts'

export type MemexMetricsData = {
  consistency?: number
  inconsistencyThreshold?: number
}

export interface Memex extends MemexMetricsData {
  id: number
  number: number
  title?: string
  titleHtml?: string
  description?: string
  shortDescription?: string
  shortDescriptionHtml?: string
  closedAt: string | null
  public: boolean
  isTemplate: boolean
  templateId?: number
}

export type BetaSignupBannerState = 'hidden' | 'visible' | 'staffship'
export type MemexServiceData = {
  betaSignupBanner: BetaSignupBannerState
  killSwitchEnabled: boolean
  killSwitchRecentlyDisabled?: boolean
}

export interface GetAllMemexDataRequest {
  /**
   * This aligns with local view query param overrides
   */
  visibleFields: Array<SystemColumnId | number>
}

export interface GetAllMemexDataResponse {
  memexProject: Memex
  memexProjectItems: Array<MemexItem>
  memexProjectAllColumns: Array<MemexColumn>
  memexViews: Array<PageView>
  memexWorkflows: Array<MemexWorkflowPersisted>
  memexWorkflowConfigurations: Array<MemexWorkflowConfiguration>
  memexCharts: Array<MemexChart>
  createdWithTemplateMemex?: CreatedWithTemplateMemex
  memexService?: MemexServiceData
}

export type IToggleMemexCloseRequest = {
  closed: boolean
}

export interface DeleteMemexResponse {
  redirectUrl: string
}

export type IUpdateMemexRequest = Partial<Memex> | IToggleMemexCloseRequest

export interface UpdateMemexResponse {
  memexProject: Partial<Memex>
}

type SuggestedUserCollaborator = User & {
  isCollaborator: boolean
  actor_type: 'user'
}

type SuggestedTeamCollaborator = Team & {
  isCollaborator: boolean
  actor_type: 'team'
}

export type SuggestedCollaborator = SuggestedUserCollaborator | SuggestedTeamCollaborator

export type IGetSuggestedCollaboratorsRequest = {query: string}
export interface GetSuggestedCollaboratorsResponse {
  suggestions: Array<{user: User} | {team: Team}>
}

export interface GetCollaboratorsResponse {
  collaborators: Array<Collaborator>
}

export type IUpdateCollaboratorsRequest = {
  role: Role
  collaborators: Array<string>
}

export type IUpdateOrganizationAccessRequest = {
  role: Role
}

/**
 * failed: array of user ids which could not be granted permissions
 */
export interface UpdateCollaboratorsResponse {
  failed: Array<string>
  collaborators: Array<Collaborator>
}

export type IRemoveCollaboratorsRequest = {
  collaborators: Array<string>
}

export interface BackwardsCompatibleGetOrganizationAccessResponse {
  role?: CollaboratorRole
  permission: CollaboratorRole
}

export interface GetOrganizationAccessResponse {
  role: CollaboratorRole
}

export interface RemoveCollaboratorsResponse {
  failed: Array<string>
}

// Update this contract to allow an optional custom template id
export type ApplyTemplateRequest = {
  template: string
}
export interface ApplyTemplateResponse {
  success: boolean
  copyingDraftsAsync: boolean
}

export interface MemexLimits {
  projectItemLimit: number
  projectItemArchiveLimit: number
  /** The maximum number of current state charts that can be saved when basic features are not enabled */
  limitedChartsLimit: number
  /** maximum number of options for a single select field */
  singleSelectColumnOptionsLimit: number
  /** maximum number of characters for a single select option description */
  singleSelectDescriptionMaxLength?: number
  /** maximum number of auto add workflows */
  autoAddCreationLimit: number
  /** the maximum number of views that can be created */
  viewsLimit: number
}

export interface MemexRelayIDs {
  memexProject: string
}

export interface GetCustomTemplatesResponse {
  templates: Array<CustomTemplate>
  recommendedTemplates?: Array<CustomTemplate>
}

/** Represents the type for a GitHub system template */
export type SystemTemplate = {
  title: string
  id: string
  shortDescription?: string
  imageUrl: {
    light: string
    dark: string
  }
}

export type MemexStatus = {
  id: number
  updatedAt: string
  creator: Pick<User, 'id' | 'login' | 'name' | 'avatarUrl'>
  statusValue: {
    status: PersistedOption | null
    statusId: string | null
    startDate: string | null
    targetDate: string | null
  }
  body: string
  bodyHtml: string
  userHidden: boolean
}

export type MemexStatusResponse = {
  status: MemexStatus
  viewerIsSubscribed: boolean
}

export type MemexStatusesResponse = {
  // existing statuses for this project
  statuses: Array<MemexStatus>
  // metadata to enable author to submit new status
  form: {
    status: {
      options: Array<PersistedOption>
    }
  }
}

export type MemexWithoutLimitsBetaSignupResponse = {
  success: boolean
}

export type MemexWithoutLimitsBetaOptoutResponse = {
  success: boolean
}

export type FilterSuggestionsRequest = {
  fieldId: MemexProjectColumnId
}

type AssigneesFilterSuggestions = Array<IAssignee>
type DateFilterSuggestions = Array<ServerDateValue>
type IssueTypeFilterSuggestions = Array<IssueType>
type LabelsFilterSuggestions = Array<Label>
type LinkedPullRequestsFilterSuggestions = Array<LinkedPullRequest>
type MilestoneFilterSuggestions = Array<Milestone>
type NumberFilterSuggestions = Array<NumericValue>
type RepositoryFilterSuggestions = Array<ExtendedRepository>
type ReviewersFilterSuggestions = Array<Review>
type TextFilterSuggestions = Array<EnrichedText>

export type FilterSuggestionsResponse =
  | AssigneesFilterSuggestions
  | DateFilterSuggestions
  | IssueTypeFilterSuggestions
  | LabelsFilterSuggestions
  | LinkedPullRequestsFilterSuggestions
  | MilestoneFilterSuggestions
  | NumberFilterSuggestions
  | RepositoryFilterSuggestions
  | ReviewersFilterSuggestions
  | TextFilterSuggestions
