import type {Repository} from '@github-ui/current-repository'
import type {ValueType} from '@github-ui/custom-properties-types'
import type {Enterprise, Organization} from '@github-ui/repos-types'
import type {SafeHTMLString} from '@github-ui/safe-html'
import type {User} from '@github-ui/user-selector'
import type {BypassActor, OrgAdminBypassMode} from '@github-ui/bypass-actors/types'
import type {RefObject} from 'react'

export const DEFAULT_BRANCH_PATTERN = '~DEFAULT_BRANCH'
export const INCLUDE_ALL_PATTERN = '~ALL'

export type ParameterValue = string | number | boolean | object | Array<number | string | object> | undefined

export type RuleStatus = 'all' | 'pass' | 'fail' | 'bypass'
export type TimePeriod = 'hour' | 'day' | 'week' | 'month'
export type EvaluateStatus = 'all' | 'active' | 'evaluate'

export type TargetType =
  | 'repository_name'
  | 'repository_id'
  | 'ref_name'
  | 'repository_property'
  | 'organization_name'
  | 'organization_id'
export type ExpandedRepoTargetType = TargetType | 'all_repos'
export type ExpandedOrgTargetType = TargetType | 'all_orgs'
export type ExpandedTargetType = ExpandedRepoTargetType | ExpandedOrgTargetType

export type TargetObjectType = 'organization' | 'repository' | 'ref'

export interface PropertyDescriptor {
  name: string
  description: string
  valueType: ValueType
  allowedValues: string[] | undefined
  source: PropertySource
  icon: string
  displayName: string
}

export type PropertySource = 'custom' | 'system'

export type RulesetTarget = 'branch' | 'tag' | 'push' | 'member_privilege'

export interface DetailedValidationErrors {
  message?: string
  general: Record<string, ValidationError[]>
  rules: Record<string, ValidationError[]>
  conditions: Record<string, ValidationError[]>
  bypass_actors: Record<string, ValidationError[]>
}

export interface ValidationError {
  error_code: string
  message: string
  index?: number
  field?: string
  value?: string
  sub_errors?: ValidationError[]
  registered_suberrors?: ValidationError[]
  unregistered_suberrors?: ValidationError[]
}

export interface WorkflowError extends ValidationError {
  repo_and_path?: string
}

export interface Ruleset {
  id: number
  target: RulesetTarget
  name: string
  matches: string[] | string
  source: {
    id: number
    type: string
    name: string
    url?: string
  }
  conditions: Condition[]
  orgAdminBypassMode: OrgAdminBypassMode
  deployKeyBypass: boolean
  enforcement: RulesetEnforcement
  rules: Rule[]
  formData?: string
  bypassActors?: BypassActor[]
  histories?: History[]
  missingConditionTargets: TargetObjectType[]
}

export const enum RulesetEnforcement {
  Enabled = 'enabled',
  Disabled = 'disabled',
  Evaluate = 'evaluate',
}

export interface Condition {
  parameters: ConditionParameters
  target: TargetType
  _dirty: boolean
  metadata?: ConditionMetadata
}

export interface IncludeExcludeCondition extends Condition {
  parameters: IncludeExcludeParameters
}

export interface RepositoryIdCondition extends Condition {
  parameters: RepositoryIdParameters
  metadata?: RepositoryIdConditionMetadata
}

export interface ConditionMetadata {}

export interface RepositoryIdConditionMetadata extends ConditionMetadata {
  repositories: SimpleRepository[]
}

export interface SimpleRepository {
  id: number
  nodeId: string
  name: string
  ownerLogin: string
  public: boolean
  private: boolean
  isOrgOwned: boolean
}

export interface OrganizationIdConditionMetadata extends ConditionMetadata {
  organizations: SimpleOrganization[]
}

export interface SimpleOrganization {
  id: number
  nodeId: string
  name: string
}

export type ConditionParameters =
  | IncludeExcludeParameters
  | RepositoryIdParameters
  | RepositoryPropertyParameters
  | OrganizationIdParameters

export interface IncludeExcludeParameters {
  protected?: boolean
  include_emu_accounts?: boolean
  include: string[]
  exclude: string[]
}

export interface RepositoryPropertyParameters {
  include: PropertyConfiguration[]
  exclude: PropertyConfiguration[]
}

export interface PropertyConfiguration {
  name: string
  property_values: string[]
  source: PropertySource | undefined
}

export interface RepositoryIdParameters {
  protected?: boolean
  repository_ids: string[]
}

export interface OrganizationIdParameters {
  include_emu_accounts?: boolean
  organization_ids: string[]
}

export type Parameter = Record<string, ParameterValue>

export type RuleSuiteResult =
  | 'allowed'
  | 'failed'
  | 'git_error'
  | 'bypassed'
  | 'push_rejected'
  // NOTE: ('entered_queue' should never be visible in UI)
  | 'enter_queue_failed'
export interface RuleSuite {
  id: number
  ruleRuns: RuleRun[]
  repository: Repository
  result: RuleSuiteResult
  actor?: User | null
  actorIsPublicKey?: boolean
  beforeOid?: string | null
  afterOid?: string | null
  refName: string
  commit?: Commit | null
  createdAt: Date
  usedExemptionRequests?: ExemptionRequestMetadata[] | null
  evaluationMetadata: RuleSuiteMetadata
}

export interface RuleSuiteMetadata {
  preReceiveFailure?: boolean
  pullRequest?: PullRequestSummary
  pullRequestHeadSha?: string
  pullRequestPolicySha?: string
  pullRequestMergeBaseSha?: string
  mergeGroupPullRequests?: PullRequestSummary[]
  mergeQueueMergeMethod?: 'merge' | 'squash' | 'rebase'
  mergeQueueRemovalReason?: MergeQueueRemovalReason
  mergeQueueCheckResults?: MergeQueueCheckResult[]
  blobEvaluation?: boolean
}

export interface ExemptionRequestMetadata {
  id: number
  number: number
  status: 'pending' | 'completed' | 'rejected' | 'cancelled'
  requester: User
  url?: string | null
}

export type MergeQueueRemovalReason =
  | 'unknown'
  | 'manual'
  | 'merged'
  | 'merge_conflict'
  | 'failed_checks'
  | 'checks_timed_out'
  | 'already_merged'
  | 'queue_cleared'
  | 'branch_protection_failure'
  | 'git_tree_invalid'
  | 'invalid_merge_commit'
  | 'roll_back'

export interface MergeQueueCheckResult {
  context: string | null
  state?: 'error' | 'failure' | 'pending' | 'success' | null
  integration_id?: number | null
}

export interface PullRequestSummary {
  id: number
  number: number
  link: string
}

export interface Commit {
  message: string
  shortMessageHtmlLink?: SafeHTMLString | null
}

export interface RuleRun {
  ruleType: string
  ruleDisplayName: string
  insightsCategory: {
    name: string
    id: number | null
    link?: string
    viewLink?: string
  }
  insightsSourceOutOfDate: boolean
  id: number
  rulesetId?: number
  message: string | null
  result: RuleRunResult
  violations?: RunViolationsData
  exemptionResponses?: ExemptionResponseMetadata[] | null
  metadata: RunMetadata | null
}

export interface ExemptionResponseMetadata {
  id: number
  exemptionRequestId: number
  exemptionRequestUrl?: string | null
  status: 'approved' | 'rejected'
  message: string | null
  reviewer: User
}

export type RunMetadata =
  | PullRequestMetadata
  | ChecksMetadata
  | DeploymentsMetadata
  | SecretsMetadata
  | ContentScanSecretsMetadata

export type PullRequestMetadata = {
  prNumber: number
  prLink: string
  prReviewers: Array<{
    state: 'approved' | 'commented' | 'changes_requested'
    stateSummary: string
    user: {
      login: string
      primaryAvatarUrl: string
    }
  }>
}

export type ChecksMetadata = {
  checks: Array<{
    integrationName: string
    integrationAvatarUrl: string
    checkRunName: string
    id: string
    state: string
    sha: number
    description: string
    warning: string
  }>
}

export type DeploymentsMetadata = {
  deploymentResults: Array<{
    status: string
    name: string
    sha: string
    id: string
  }>
}

export type SecretsMetadata = {
  completed: boolean
  num_secrets_found_over_limit: number
  secrets: Array<{
    type: string
    locations: Array<{
      path: string
      blob_oid: string
      end_line: number
      commit_oid: string
      start_line: number
      end_line_byte_position: number
      start_line_byte_position: number
    }>
    fingerprint: string
    token_metadata: {
      slug: string
      label: string
      provider: string
      token_type: string
    }
    bypass_placeholder_ksuid: string
  }>
}

export type ContentScanSecretsMetadata = object

type RuleRunResult = 'allowed' | 'failed' | 'evaluate_allowed' | 'evaluate_failed'

export type RunViolationsData = {
  items: RunViolationItem[]
  total: number
}

export type RunViolationItem = {
  candidate: string
  commit_oid?: string
}

/*
 * Split out rules by what the server returns/expects and
 * what is used locally in context/components, where unless
 * overwritten, Metadata and Dynamic Rules are serverside
 */
export interface ServerRule {
  id?: number
  ruleType: string
  parameters: Parameter
  metadata?: RuleConfigMetadata
}

export interface LocalRule {
  _id?: number
  _enabled: boolean
  _dirty: boolean
  _modalState?: RuleModalState
}

interface RuleInterface extends ServerRule, LocalRule {}

/*
 * Each rule type uses its own parameter schema, and assumes the react-y base rule unless
 * set explicitly otherwise. Only Rule and ServerRule are allowed as generic types
 */
export type Rule<T extends Rule | ServerRule = RuleInterface> = T & {
  parameters: unknown
}

export type ParameterSchema = {
  name: string
  ui_options?: {
    hide_settings_container: boolean
  }
  fields: Array<
    {
      name: string
      display_name: string
      description: string
      required: boolean
      ui_control?: string
    } & (
      | {
          type: 'boolean' | 'string' | 'integer'
          default_value?: boolean | string | number
          allowed_options?: Array<{display_name: string; value: string}>
          allowed_range?: string
          allowed_values?: string[]
          ui_prefer_dropdown?: boolean
        }
      | {type: 'object'; default_value?: object}
      | {
          type: 'array'
          default_value?: Array<number | string | object>
          content_type: 'object'
          content_object: ParameterSchema
        }
    )
  >
}

type MetadataPatternSchema = {
  supportedOperators: Array<{type: string; displayName: string}>
  propertyDescription: string
}

export type RuleSchema = {
  type: string
  displayName: string
  description: string
  beta: boolean
  parameterSchema: ParameterSchema
  metadataPatternSchema?: MetadataPatternSchema
}

export type ErrorRef = {
  [type: string]: {
    errorRef: RefObject<HTMLDivElement>
    fields: FieldRef
  }
}

export type FieldRef = Record<string, RefObject<HTMLElement | HTMLInputElement | HTMLButtonElement>>

export type SourceType = 'repository' | 'organization' | 'enterprise'

export type InheritedSourceType = 'Upstream' | 'Enterprise' | 'Organization' | 'Repository'

export type UpsellCtaInfo = {
  featureEnabled: boolean
  cta: {
    visible: boolean
    path?: string
  }
}

export type UpsellInfo = {
  rulesets: UpsellCtaInfo
  enterpriseRulesets: UpsellCtaInfo
  organization: boolean
  askAdmin: boolean
}

export type HelpUrls = {
  fnmatch: string
  statusChecks: string
  deploymentEnvironments: string
  commitMetadataRules?: string
  codeScanning?: string
}

export type HomeRoutePayload = {
  source: Repository | Organization | Enterprise
  sourceType: SourceType
  upsellInfo: UpsellInfo
  rulesets: Ruleset[]
  matchingRulesets: number[]
  editableRulesets: number[]
  branch?: string
  readOnly?: boolean
  branchListCacheKey: string
  supportedTargets: RulesetTarget[]
}

export type RulesetRoutePayload = {
  source: Repository | Organization | Enterprise
  sourceType: SourceType
  upsellInfo: UpsellInfo
  currentName?: string
  ruleset: Ruleset
  ruleSchemas: RuleSchema[]
  readOnly?: boolean
  isHistoryView?: boolean
  baseAvatarUrl: string
  supportedConditionTargetObjects: TargetObjectType[]
  helpUrls?: HelpUrls
  isImportedRuleset?: boolean
  isRestoredRuleset?: boolean
  noRulesets?: boolean
  initialErrors?: DetailedValidationErrors
}

export type InsightsRoutePayload = {
  source: Repository | Organization | Enterprise
  sourceType: SourceType
  upsellInfo?: UpsellInfo
  rulesets: Ruleset[]
  repositories?: string[]
  ruleSuiteRuns: RuleSuite[]
  visibleResults: Record<number, RuleSuiteResult>
  branchListCacheKey?: string
  filter: InsightsFilter
  hasMoreSuites: boolean
  readOnly?: boolean
  learnMoreUrl: string
  supportedTargets: RulesetTarget[]
}

export type HistoryComparisonRoutePayload = {
  ruleset: Ruleset
  history: History
  diffHtml: string
}

export type HistorySummaryRoutePayload = {
  source: Repository | Organization | Enterprise
  sourceType: SourceType
  ruleset: Ruleset
  hasMore: boolean
  page: number
  readOnly?: boolean
}

export type InsightsFilter = {
  branch?: string
  repository?: string
  actor?: User
  ruleset?: Ruleset
  timePeriod?: TimePeriod
  ruleStatus?: RuleStatus
  evaluateStatus?: EvaluateStatus
  page?: number
}

export type BypassFilter = {
  branch?: string
  repository?: string
  actor?: User
  ruleset?: Ruleset
  timePeriod?: TimePeriod
  ruleStatus?: RuleStatus
  page?: number
}

export type SetRoutePayload = RulesetRoutePayload & {
  message: string
}

export enum RuleModalState {
  CREATING = 'creating',
  EDITING = 'editing',
  CLOSED = 'closed',
}

export type RegisteredRuleSchemaComponent = {
  rulesetId?: number
  sourceType: SourceType
  field: RuleSchema['parameterSchema']['fields'][0]
  // Once fieldRef is added to all existing registered components, we can make this required
  fieldRef?: RefObject<HTMLElement | HTMLButtonElement>
  value: ParameterValue
  onValueChange?: (value: ParameterValue) => void
  readOnly?: boolean
  helpUrls?: HelpUrls
  metadata?: RuleConfigMetadata
  errors: ValidationError[]
}

export type RegisteredRuleErrorComponent = {
  // errorId is a unique identifier used to   reference the rule input/target that caused the error,
  // it should be the same value as the aria-describedby attribute in the input/target element
  errorId: string
  // This is used to focus on the rule error
  errorRef?: RefObject<HTMLDivElement>
  sourceType: SourceType
  fields: RuleSchema['parameterSchema']['fields']
  errors: ValidationError[]
  rulesetId?: number
  // Certain errors should link to an element that should be changed in order to fix the error
  // Use this ref to target that element
  targetRef?: RefObject<HTMLElement>
}

export type RuleConfigMetadata = WorkflowsRuleMetadata | RequiredStatusChecksMetadata | object

export type WorkflowsRuleMetadata = {
  workflows: Array<{name: string; path: string; repository?: WorkflowRepository}>
}

export type RequiredStatusChecksMetadata = {
  integrations: Array<{id: number; name: string; preferred_avatar_url?: string}>
}

export interface WorkflowRepository extends Repository {
  refCacheKey: string
  actionsSharing: boolean
}

export type RefType = 'branch' | 'tag'

export type History = {
  id: number
  created_at: string
  state: string
  is_current?: boolean
  updated_by: {
    id: number
    display_login: string
    static_avatar_url: string
  }
}

export type RuleWithSchema = Rule & {schema: RuleSchema}
