/**
 * TYPES GENERATED FROM RELAY
 *
 * In many cases, we reference these types in the Merge Box components to make the components more forgiving and defensive.
 * Once Relay is removed completely, we can consolidate these types with the merge box page data types and remove any mentions of '%other ' and '%future added value'.
 */

export enum MergeAction {
  DIRECT_MERGE = 'DIRECT_MERGE',
  AUTO_MERGE = 'AUTO_MERGE',
  MERGE_QUEUE = 'MERGE_QUEUE',
}

export enum MergeMethod {
  MERGE = 'MERGE',
  SQUASH = 'SQUASH',
  REBASE = 'REBASE',
}

export enum MergeQueueMethod {
  GROUP = 'GROUP',
  SOLO = 'SOLO',
}

export type CheckRunState =
  | 'ACTION_REQUIRED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'FAILURE'
  | 'IN_PROGRESS'
  | 'NEUTRAL'
  | 'PENDING'
  | 'QUEUED'
  | 'SKIPPED'
  | 'STALE'
  | 'STARTUP_FAILURE'
  | 'SUCCESS'
  | 'TIMED_OUT'
  | 'WAITING'
  // eslint-disable-next-line relay/no-future-added-value
  | '%future added value'

// eslint-disable-next-line relay/no-future-added-value
export type StatusState = 'ERROR' | 'EXPECTED' | 'FAILURE' | 'PENDING' | 'SUCCESS' | '%future added value'

export type CheckConclusionState =
  | 'ACTION_REQUIRED'
  | 'CANCELLED'
  | 'FAILURE'
  | 'NEUTRAL'
  | 'SKIPPED'
  | 'STALE'
  | 'STARTUP_FAILURE'
  | 'SUCCESS'
  | 'TIMED_OUT'
  // eslint-disable-next-line relay/no-future-added-value
  | '%future added value'

export type CheckStatusState =
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'QUEUED'
  | 'REQUESTED'
  | 'WAITING'
  // eslint-disable-next-line relay/no-future-added-value
  | '%future added value'

// eslint-disable-next-line relay/no-future-added-value
export type PullRequestMergeConditionResult = 'FAILED' | 'PASSED' | 'UNKNOWN' | '%future added value'

// eslint-disable-next-line relay/no-future-added-value
export type PullRequestMergeRequirementsState = 'MERGEABLE' | 'UNKNOWN' | 'UNMERGEABLE' | '%future added value'

// eslint-disable-next-line relay/no-future-added-value
export type PullRequestMergeMethod = 'MERGE' | 'REBASE' | 'SQUASH' | '%future added value'

// eslint-disable-next-line relay/no-future-added-value
export type PullRequestMergeAction = 'DIRECT_MERGE' | 'MERGE_QUEUE' | '%future added value'

// eslint-disable-next-line relay/no-future-added-value
export type PullRequestState = 'CLOSED' | 'MERGED' | 'OPEN' | '%future added value'

export type MergeStateStatus =
  | 'BEHIND'
  | 'BLOCKED'
  | 'CLEAN'
  | 'DIRTY'
  | 'DRAFT'
  | 'HAS_HOOKS'
  | 'UNKNOWN'
  | 'UNSTABLE'
  // eslint-disable-next-line relay/no-future-added-value
  | '%future added value'

export type PullRequestRuleFailureReason =
  | 'CHANGES_REQUESTED'
  | 'CODE_OWNER_REVIEW_REQUIRED'
  | 'MORE_REVIEWS_REQUIRED'
  | 'SOC2_APPROVAL_PROCESS_REQUIRED'
  | 'THREAD_RESOLUTION_REQUIRED'
  // eslint-disable-next-line relay/no-future-added-value
  | '%future added value'

// eslint-disable-next-line relay/no-future-added-value
type RepositoryRuleEvaluationResult = 'FAILED' | 'PASSED' | '%future added value'

export type RepositoryRuleType =
  | 'AUTHORIZATION'
  | 'BRANCH_NAME_PATTERN'
  | 'CODE_SCANNING'
  | 'COMMITTER_EMAIL_PATTERN'
  | 'COMMIT_AUTHOR_EMAIL_PATTERN'
  | 'COMMIT_MESSAGE_PATTERN'
  | 'COMMIT_OID'
  | 'CREATION'
  | 'DELETION'
  | 'FILE_EXTENSION_RESTRICTION'
  | 'FILE_PATH_RESTRICTION'
  | 'LOCK_BRANCH'
  | 'MAX_FILE_PATH_LENGTH'
  | 'MAX_FILE_SIZE'
  | 'MAX_REF_UPDATES'
  | 'MERGE_QUEUE'
  | 'MERGE_QUEUE_LOCKED_REF'
  | 'NON_FAST_FORWARD'
  | 'PULL_REQUEST'
  | 'REQUIRED_DEPLOYMENTS'
  | 'REQUIRED_LINEAR_HISTORY'
  | 'REQUIRED_REVIEW_THREAD_RESOLUTION'
  | 'REQUIRED_SIGNATURES'
  | 'REQUIRED_STATUS_CHECKS'
  | 'REQUIRED_WORKFLOW_STATUS_CHECKS'
  | 'RESTRICT_REPO_DELETE'
  | 'REPOSITORY_TRANSFER'
  | 'SECRET_SCANNING'
  | 'TAG'
  | 'TAG_NAME_PATTERN'
  | 'UPDATE'
  | 'WORKFLOWS'
  | 'WORKFLOW_UPDATES'
  | 'RESTRICT_REPO_DELETE'
  | 'RESTRICT_REPOSITORY_NAME'
  | 'RESTRICT_REPO_VISIBILITY'
  // eslint-disable-next-line relay/no-future-added-value
  | '%future added value'

export type PullRequestReviewState =
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'COMMENTED'
  | 'DISMISSED'
  | 'PENDING'
  // eslint-disable-next-line relay/no-future-added-value
  | '%future added value'

export type PullRequestMergeRequirementConditions = ReadonlyArray<
  | {
      __typename: string
      conflicts?: readonly string[]
      isConflictResolvableInWeb?: boolean
      message: string | null | undefined
      result: PullRequestMergeConditionResult
      ruleRollups?: ReadonlyArray<{
        failureReasons?: readonly PullRequestRuleFailureReason[]
        message: string | null | undefined
        requiredReviewers?: number
        requiresCodeowners?: boolean
        result: RepositoryRuleEvaluationResult
        ruleType: RepositoryRuleType
      }>
    }
  | {__typename: '%other'}
>

export type PullRequestMergeRequirements = {
  conditions: PullRequestMergeRequirementConditions
  state: PullRequestMergeRequirementsState
  commitAuthor: string
  commitMessageBody: string | null | undefined
  commitMessageHeadline: string | null | undefined
}

export type MergeStatusButtonData = {
  isDraft: boolean
  state: PullRequestState
  isInMergeQueue: boolean
  mergeRequirements: PullRequestMergeRequirements
  viewerDidAuthor: boolean
}

export type ViewerMergeMethods = ReadonlyArray<{
  isAllowable: boolean
  isAllowableWithBypass: boolean
  name: PullRequestMergeMethod
}>

export type ViewerMergeActions = ReadonlyArray<{
  isAllowable: boolean
  mergeMethods: ViewerMergeMethods
  name: PullRequestMergeAction
}>

export type AutoMergeRequest =
  | {
      mergeMethod: PullRequestMergeMethod
    }
  | null
  | undefined

export type MergeQueue =
  | {
      url: string
    }
  | null
  | undefined

export type CheckStateRollup = {
  count: number
  state: CheckRunState | StatusState
}

export type MergeQueueEntryState =
  | 'AWAITING_CHECKS'
  | 'LOCKED'
  | 'MERGEABLE'
  | 'QUEUED'
  | 'UNMERGEABLE'
  // eslint-disable-next-line relay/no-future-added-value
  | '%future added value'

export type Review = {
  authorCanPushToRepository: boolean
  author?: {
    login: string
    avatarUrl: string
    name?: string | null
    url: string
  } | null
  onBehalfOf: string[]
  state: PullRequestReviewState
}

export type ViewerPayload = {
  login: string
}

export type RelayPullRequest = {
  autoMergeRequest: AutoMergeRequest | null | undefined
  baseRefChannel: string | null | undefined
  baseRefName: string
  commitHeadShaChannel: string | null | undefined
  commits: {
    totalCount: number
  }
  deployedChannel: string | null | undefined
  gitMergeStateChannel: string | null | undefined
  headRefChannel: string | null | undefined
  headRefName: string
  headRefOid: string
  headRepository:
    | {
        name: string
        owner: {
          login: string
        }
      }
    | null
    | undefined
  id: string
  isDraft: boolean
  isInMergeQueue: boolean
  latestOpinionatedReviews:
    | {
        edges:
          | ReadonlyArray<
              | {
                  node:
                    | {
                        author:
                          | {
                              avatarUrl: string
                              login: string
                              name: string | null | undefined
                              url: string
                            }
                          | null
                          | undefined
                        authorCanPushToRepository: boolean
                        onBehalfOf: {
                          edges:
                            | ReadonlyArray<
                                | {
                                    node:
                                      | {
                                          name: string
                                        }
                                      | null
                                      | undefined
                                  }
                                | null
                                | undefined
                              >
                            | null
                            | undefined
                        }
                        state: PullRequestReviewState
                      }
                    | null
                    | undefined
                }
              | null
              | undefined
            >
          | null
          | undefined
      }
    | null
    | undefined
  mergeQueue: MergeQueue | null | undefined
  mergeQueueChannel: string | null | undefined
  mergeQueueEntry:
    | {
        position: number
        state: MergeQueueEntryState
      }
    | null
    | undefined
  mergeRequirements: PullRequestMergeRequirements
  mergeStateStatus: MergeStateStatus
  resourcePath: string
  reviewStateChannel: string | null | undefined
  state: PullRequestState
  stateChannel: string | null | undefined
  viewerCanAddAndRemoveFromMergeQueue: boolean
  viewerCanDeleteHeadRef: boolean
  viewerCanDisableAutoMerge: boolean
  viewerCanEnableAutoMerge: boolean
  viewerCanRestoreHeadRef: boolean
  viewerCanUpdate: boolean
  viewerCanUpdateBranch: boolean
  viewerDidAuthor: boolean
  viewerMergeActions: ViewerMergeActions
  workflowsChannel: string | null | undefined
}
