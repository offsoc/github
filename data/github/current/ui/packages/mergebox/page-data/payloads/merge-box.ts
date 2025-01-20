/**
 * These represent the merge box page data payloads from the JSON API.
 */
import type {
  AutoMergeRequest,
  MergeQueue,
  MergeQueueEntryState,
  MergeStateStatus,
  PullRequestReviewState,
  PullRequestState,
  ViewerMergeActions,
  PullRequestMergeRequirementsState,
  PullRequestMergeConditionResult,
  RepositoryRuleType,
} from '../../types'

type AuthorPayload = {
  login: string
  avatarUrl: string
  name: string
  url: string
}

type OpinionatedReviewPayload = {
  authorCanPushToRepository: boolean
  author: AuthorPayload | null
  onBehalfOf: string[]
  state: PullRequestReviewState
}

export type JSONAPIPullRequestPayload = {
  autoMergeRequest: AutoMergeRequest | null
  baseRefName: string
  headRefName: string
  headRefOid: string
  headRepository: {
    name: string
    ownerLogin: string
  } | null
  id: string
  isDraft: boolean
  isInMergeQueue: boolean
  latestOpinionatedReviews: OpinionatedReviewPayload[]
  mergeBoxAliveChannels: {
    baseRefChannel: string
    commitHeadShaChannel: string
    deployedChannel: string
    gitMergeStateChannel: string
    headRefChannel: string
    mergeQueueChannel: string
    reviewStateChannel: string
    stateChannel: string
    workflowsChannel: string
  }
  mergeQueue: MergeQueue | null
  mergeQueueEntry: {
    position: number
    state: MergeQueueEntryState
  } | null
  mergeStateStatus: MergeStateStatus
  numberOfCommits: number
  resourcePath: string
  state: PullRequestState
  viewerCanAddAndRemoveFromMergeQueue: boolean
  viewerCanDeleteHeadRef: boolean
  viewerCanDisableAutoMerge: boolean
  viewerCanEnableAutoMerge: boolean
  viewerCanRestoreHeadRef: boolean
  viewerCanUpdate: boolean
  viewerCanUpdateBranch: boolean
  viewerDidAuthor: boolean
  viewerMergeActions: ViewerMergeActions
}

type RuleSpecificMetadata =
  | ReviewerRuleMetadata
  | {
      statusCheckResults: Array<{context: string; integrationId: number | null; result: string}>
    }
  | {
      missingEnvironments: string[]
      DeployedEnvironments: string[]
    }

export type ReviewerRuleMetadata = {
  requiredReviewers: number
  requiresCodeowners: boolean
  failureReasons: string[] // this is snake case, all lower case
}
type RuleRollupResult = 'PASSED' | 'FAILED'
type RuleRollupPayload = {
  ruleType: RepositoryRuleType
  displayName: string
  message: string | null | undefined
  result: RuleRollupResult
  bypassable: boolean
  metadata: RuleSpecificMetadata | null
}

type MergeConditionType =
  | 'PULL_REQUEST_STATE'
  | 'PULL_REQUEST_REPO_STATE'
  | 'PULL_REQUEST_USER_STATE'
  | 'PULL_REQUEST_RULES'
  | 'PULL_REQUEST_MERGE_CONFLICT_STATE'
  | 'PULL_REQUEST_MERGE_METHOD'
  | 'UNKNOWN'

export type MergeConditionPayload = {
  type: MergeConditionType
  displayName: string
  description: string
  message: string | null | undefined
  result: PullRequestMergeConditionResult
  ruleRollups: RuleRollupPayload[] | null | undefined
}

type MergeRequirementsConditionsPayload = Array<MergeConditionPayload | ConflictMergeConditionPayload>
export type ConflictMergeConditionPayload = {
  type: 'PULL_REQUEST_MERGE_CONFLICT_STATE'
  displayName: string
  description: string
  message: string | null
  result: PullRequestMergeConditionResult
  ruleRollups: RuleRollupPayload[] | null
  conflicts: string[] | null | undefined
  isConflictResolvableInWeb: boolean | null | undefined
}

export type PullRequestMergeRequirementsPayload = {
  conditions: MergeRequirementsConditionsPayload
  state: PullRequestMergeRequirementsState
  commitAuthor: string
  commitMessageBody: string
  commitMessageHeadline: string
}

export type MergeBoxPageData = {
  mergeRequirements: PullRequestMergeRequirementsPayload | null
  pullRequest: JSONAPIPullRequestPayload
}
