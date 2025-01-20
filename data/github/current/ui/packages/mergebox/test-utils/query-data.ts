import {MergeAction, MergeMethod} from '../types'
import {aliveChannels} from './mocks/alive-channels-mock'
import type {
  PullRequestMergeRequirements,
  PullRequestMergeMethod,
  PullRequestMergeAction,
  PullRequestReviewState,
  MergeStateStatus,
  RelayPullRequest,
} from '../types'
import type {useLoadMergeBoxQuery_pullRequest$data} from '../hooks/__generated__/useLoadMergeBoxQuery_pullRequest.graphql'
import type {ConflictsSectionProps} from '../components/sections/ConflictsSection'

const userAvatarUrl = 'http://alambic.github.localhost/avatars/u/2'

function mockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function wrapListAsEdges<T>(list: T[], connectionId = mockUUID()) {
  const wrappedItems = list.map(item => ({node: item}))
  return {__id: connectionId, edges: wrappedItems}
}

// TODO: Reconcile these types with the ones in types.ts
type Review = NonNullable<
  NonNullable<NonNullable<useLoadMergeBoxQuery_pullRequest$data['latestOpinionatedReviews']>['edges']>[number]
>['node']
type ViewerMergeAction = useLoadMergeBoxQuery_pullRequest$data['viewerMergeActions'][number]
type ViewerMergeMethod = ViewerMergeAction['mergeMethods'][number]

// TODO: Replace these builder function
export function buildReview(data: {
  avatarUrl?: string
  id?: string
  login: string
  url?: string
  state?: PullRequestReviewState
  onBehalfOfReviewers?: Array<{name: string}>
  authorCanPushToRepository?: boolean
}): Review {
  return {
    author: {
      avatarUrl: data.avatarUrl ?? userAvatarUrl,
      login: data.login,
      url: data.url ?? '',
      name: data.login,
    },
    onBehalfOf: data.onBehalfOfReviewers ? wrapListAsEdges(data.onBehalfOfReviewers) : {edges: []},
    state: data.state ?? 'APPROVED',
    authorCanPushToRepository: data.authorCanPushToRepository || false,
  }
}

export function buildMergeAction(
  data: {
    name?: PullRequestMergeAction
    isAllowable?: boolean
    mergeMethods?: ViewerMergeMethod[]
  } = {},
): ViewerMergeAction {
  return {
    name: data.name || (MergeAction.DIRECT_MERGE as PullRequestMergeAction),
    isAllowable: data.isAllowable || false,
    mergeMethods: data.mergeMethods || [],
  }
}

export function buildMergeMethod(
  data: {
    name?: PullRequestMergeMethod
    isAllowable?: boolean
    isAllowableWithBypass?: boolean
  } = {},
): ViewerMergeMethod {
  return {
    name: data.name || (MergeMethod.MERGE as PullRequestMergeMethod),
    isAllowable: data.isAllowable ?? false,
    isAllowableWithBypass: data.isAllowableWithBypass ?? false,
  }
}

export function buildMergeQueue(data: {url?: string} = {}) {
  return {
    url: data.url || 'http://github.localhost.com/monalisa/smile/queue',
  }
}

/**
 * The default pull request payload for the merge box
 */
export const defaultPullRequest: RelayPullRequest = {
  autoMergeRequest: null,
  baseRefName: 'main',
  commits: {
    totalCount: 1,
  },
  headRefName: 'update-packages-and-readme-ref',
  headRepository: {
    name: 'smile',
    owner: {
      login: 'monalisa',
    },
  },
  headRefOid: 'fakeHeadRefOid',
  id: 'fakeId',
  isDraft: false,
  isInMergeQueue: false,
  latestOpinionatedReviews: wrapListAsEdges([]),
  mergeQueueEntry: null,
  mergeQueue: null,
  mergeRequirements: {
    state: 'UNKNOWN',
    commitAuthor: 'monalisa',
    commitMessageBody: '',
    commitMessageHeadline: '',
    conditions: [
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        conflicts: [],
        isConflictResolvableInWeb: true,
        result: 'PASSED',
        message: null,
      },
    ],
  },
  mergeStateStatus: 'CLEAN',
  state: 'OPEN',
  resourcePath: '/monalisa/smile/pull/1',
  viewerCanAddAndRemoveFromMergeQueue: false,
  viewerCanDeleteHeadRef: false,
  viewerCanDisableAutoMerge: false,
  viewerCanEnableAutoMerge: false,
  viewerCanRestoreHeadRef: false,
  viewerCanUpdate: false,
  viewerCanUpdateBranch: false,
  viewerDidAuthor: false,
  viewerMergeActions: [
    buildMergeAction({
      name: MergeAction.DIRECT_MERGE,
      isAllowable: true,
      mergeMethods: [buildMergeMethod({name: MergeMethod.MERGE, isAllowable: true})],
    }),
  ],
  ...aliveChannels,
}

interface ConflictsSectionMergeState {
  mergeStateStatus: MergeStateStatus
  conflictsCondition: ConflictsSectionProps['conflictsCondition']
}

type defaultCommitAuthorData = {
  commitAuthor: string
  commitMessageBody: string | null | undefined
  commitMessageHeadline: string | null | undefined
}

/**
 * Default commit author data for the merge box
 */
export const defaultCommitAuthorData: defaultCommitAuthorData = {
  commitAuthor: 'monalisa',
  commitMessageHeadline: 'This is a headline',
  commitMessageBody: 'This is a body',
}

/**
 * Preset states for the conflicts section of the MergeBox
 */

export const conflictsSectionCleanMergeState: ConflictsSectionMergeState = {
  mergeStateStatus: 'CLEAN',
  conflictsCondition: {
    conflicts: [],
    isConflictResolvableInWeb: true,
    result: 'PASSED',
    message: null,
  },
}

export const conflictsSectionPendingMergeState: ConflictsSectionMergeState = {
  mergeStateStatus: 'UNKNOWN',
  conflictsCondition: {
    conflicts: [],
    isConflictResolvableInWeb: true,
    result: 'PASSED',
    message: null,
  },
}

export const conflictsSectionStandardConflictsMergeState: ConflictsSectionMergeState = {
  mergeStateStatus: 'DIRTY',
  conflictsCondition: {
    conflicts: ['conflict.md', 'conflict2.md'],
    isConflictResolvableInWeb: true,
    result: 'FAILED',
    message: null,
  },
}

export const conflictsSectionComplexConflictsMergeState: ConflictsSectionMergeState = {
  mergeStateStatus: 'DIRTY',
  conflictsCondition: {
    conflicts: ['conflict.md', 'conflict2.md'],
    isConflictResolvableInWeb: false,
    result: 'FAILED',
    message: null,
  },
}

export const mockMergeRequirementsFromRelay = {
  mergeable: {
    commitAuthor: 'octocat@github.com',
    commitMessageBody: '',
    commitMessageHeadline: '',
    state: 'MERGEABLE',
    conditions: [
      {
        __typename: 'PullRequestStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRepoStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestUserStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRulesCondition',
        result: 'PASSED',
        ruleRollups: [
          {
            result: 'FAILED',
            ruleType: 'MERGE_QUEUE',
          },
          {
            result: 'FAILED',
            ruleType: 'REQUIRED_DEPLOYMENTS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOWS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOW_UPDATES',
          },
          {
            result: 'PASSED',
            ruleType: 'DELETION',
          },
          {
            result: 'PASSED',
            ruleType: 'NON_FAST_FORWARD',
          },
          {
            __typename: 'RequiredStatusChecksRuleRollup',
            result: 'PASSED',
            ruleType: 'REQUIRED_STATUS_CHECKS',
          },
          {
            __typename: 'PullRequestRuleRollup',
            result: 'PASSED',
            ruleType: 'PULL_REQUEST',
          },
        ],
      },
    ],
  } as PullRequestMergeRequirements,
  checksPending: {
    commitAuthor: 'octocat@github.com',
    commitMessageBody: '',
    commitMessageHeadline: '',
    state: 'UNMERGEABLE',
    conditions: [
      {
        __typename: 'PullRequestStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRepoStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestUserStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRulesCondition',
        result: 'FAILED',
        ruleRollups: [
          {
            result: 'FAILED',
            ruleType: 'MERGE_QUEUE',
          },
          {
            result: 'FAILED',
            ruleType: 'REQUIRED_DEPLOYMENTS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOWS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOW_UPDATES',
          },
          {
            result: 'PASSED',
            ruleType: 'DELETION',
          },
          {
            result: 'PASSED',
            ruleType: 'NON_FAST_FORWARD',
          },
          {
            __typename: 'RequiredStatusChecksRuleRollup',

            message: '10 of 14 required status checks have not succeeded: 8 expected.',
            result: 'FAILED',
            ruleType: 'REQUIRED_STATUS_CHECKS',
            statusCheckResults: [{result: 'PENDING'}, {result: 'EXPECTED'}, {result: 'SUCCESS'}],
          },
          {
            __typename: 'PullRequestRuleRollup',

            result: 'PASSED',
            ruleType: 'PULL_REQUEST',
          },
        ],
      },
    ],
  } as PullRequestMergeRequirements,
  checksFailing: {
    commitAuthor: 'octocat@github.com',
    commitMessageBody: '',
    commitMessageHeadline: '',
    state: 'UNMERGEABLE',
    conditions: [
      {
        __typename: 'PullRequestStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRepoStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestUserStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRulesCondition',
        result: 'FAILED',
        ruleRollups: [
          {
            result: 'FAILED',
            ruleType: 'MERGE_QUEUE',
          },
          {
            result: 'FAILED',
            ruleType: 'REQUIRED_DEPLOYMENTS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOWS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOW_UPDATES',
          },
          {
            result: 'PASSED',
            ruleType: 'DELETION',
          },
          {
            result: 'PASSED',
            ruleType: 'NON_FAST_FORWARD',
          },
          {
            __typename: 'RequiredStatusChecksRuleRollup',
            message: '10 of 14 required status checks have not succeeded: 8 expected, 1 failing.',
            result: 'FAILED',
            ruleType: 'REQUIRED_STATUS_CHECKS',
            statusCheckResults: [{result: 'FAILURE'}, {result: 'EXPECTED'}, {result: 'SUCCESS'}],
          },
          {
            __typename: 'PullRequestRuleRollup',

            result: 'PASSED',
            ruleType: 'PULL_REQUEST',
          },
        ],
      },
    ],
  } as PullRequestMergeRequirements,
  awaitingReview: {
    commitAuthor: 'octocat@github.com',
    commitMessageBody: '',
    commitMessageHeadline: '',
    state: 'UNMERGEABLE',
    conditions: [
      {
        __typename: 'PullRequestStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRepoStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestUserStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRulesCondition',
        result: 'FAILED',
        ruleRollups: [
          {
            result: 'FAILED',
            ruleType: 'MERGE_QUEUE',
          },
          {
            result: 'FAILED',
            ruleType: 'REQUIRED_DEPLOYMENTS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOWS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOW_UPDATES',
          },
          {
            result: 'PASSED',
            ruleType: 'DELETION',
          },
          {
            result: 'PASSED',
            ruleType: 'NON_FAST_FORWARD',
          },
          {
            __typename: 'RequiredStatusChecksRuleRollup',

            result: 'PASSED',
            ruleType: 'REQUIRED_STATUS_CHECKS',
          },
          {
            __typename: 'PullRequestRuleRollup',

            result: 'FAILED',
            ruleType: 'PULL_REQUEST',
            failureReasons: ['CODE_OWNER_REVIEW_REQUIRED'],
          },
        ],
      },
    ],
  } as PullRequestMergeRequirements,
  changesRequested: {
    commitAuthor: 'octocat@github.com',
    commitMessageBody: '',
    commitMessageHeadline: '',
    state: 'UNMERGEABLE',
    conditions: [
      {
        __typename: 'PullRequestStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRepoStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestUserStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRulesCondition',
        result: 'FAILED',
        ruleRollups: [
          {
            result: 'FAILED',
            ruleType: 'MERGE_QUEUE',
          },
          {
            result: 'FAILED',
            ruleType: 'REQUIRED_DEPLOYMENTS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOWS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOW_UPDATES',
          },
          {
            result: 'PASSED',
            ruleType: 'DELETION',
          },
          {
            result: 'PASSED',
            ruleType: 'NON_FAST_FORWARD',
          },
          {
            __typename: 'RequiredStatusChecksRuleRollup',

            result: 'PASSED',
            ruleType: 'REQUIRED_STATUS_CHECKS',
          },
          {
            __typename: 'PullRequestRuleRollup',

            result: 'FAILED',
            ruleType: 'PULL_REQUEST',
            failureReasons: ['CHANGES_REQUESTED'],
          },
        ],
      },
    ],
  } as PullRequestMergeRequirements,
  mergeConflicts: {
    commitAuthor: 'octocat@github.com',
    commitMessageBody: '',
    commitMessageHeadline: '',
    state: 'UNKNOWN',
    conditions: [
      {
        __typename: 'PullRequestStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRepoStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestUserStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        result: 'FAILED',
      },
      {
        __typename: 'PullRequestRulesCondition',
        result: 'PASSED',
        ruleRollups: [
          {
            result: 'FAILED',
            ruleType: 'MERGE_QUEUE',
          },
          {
            result: 'FAILED',
            ruleType: 'REQUIRED_DEPLOYMENTS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOWS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOW_UPDATES',
          },
          {
            result: 'PASSED',
            ruleType: 'DELETION',
          },
          {
            result: 'PASSED',
            ruleType: 'NON_FAST_FORWARD',
          },
          {
            __typename: 'RequiredStatusChecksRuleRollup',

            result: 'PASSED',
            ruleType: 'REQUIRED_STATUS_CHECKS',
          },
          {
            __typename: 'PullRequestRuleRollup',

            result: 'PASSED',
            ruleType: 'PULL_REQUEST',
          },
        ],
      },
    ],
  } as PullRequestMergeRequirements,
  unknown: {
    commitAuthor: 'octocat@github.com',
    commitMessageBody: '',
    commitMessageHeadline: '',
    state: 'UNKNOWN',
    conditions: [
      {
        __typename: 'PullRequestStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRepoStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestUserStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRulesCondition',
        result: 'PASSED',
        ruleRollups: [
          {
            result: 'FAILED',
            ruleType: 'MERGE_QUEUE',
          },
          {
            result: 'FAILED',
            ruleType: 'REQUIRED_DEPLOYMENTS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOWS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOW_UPDATES',
          },
          {
            result: 'PASSED',
            ruleType: 'DELETION',
          },
          {
            result: 'PASSED',
            ruleType: 'NON_FAST_FORWARD',
          },
          {
            __typename: 'RequiredStatusChecksRuleRollup',

            result: 'PASSED',
            ruleType: 'REQUIRED_STATUS_CHECKS',
          },
          {
            __typename: 'PullRequestRuleRollup',

            result: 'PASSED',
            ruleType: 'PULL_REQUEST',
          },
        ],
      },
    ],
  } as PullRequestMergeRequirements,
  unableToMerge: {
    commitAuthor: 'octocat@github.com',
    commitMessageBody: '',
    commitMessageHeadline: '',
    state: 'UNMERGEABLE',
    conditions: [
      {
        __typename: 'PullRequestStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRepoStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestUserStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestMergeConflictStateCondition',
        result: 'PASSED',
      },
      {
        __typename: 'PullRequestRulesCondition',
        result: 'FAILED',
        ruleRollups: [
          {
            result: 'FAILED',
            ruleType: 'MERGE_QUEUE',
          },
          {
            result: 'FAILED',
            ruleType: 'REQUIRED_DEPLOYMENTS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOWS',
          },
          {
            result: 'PASSED',
            ruleType: 'WORKFLOW_UPDATES',
          },
          {
            result: 'PASSED',
            ruleType: 'DELETION',
          },
          {
            result: 'FAILED',
            ruleType: 'NON_FAST_FORWARD',
          },
          {
            __typename: 'RequiredStatusChecksRuleRollup',

            result: 'PASSED',
            ruleType: 'REQUIRED_STATUS_CHECKS',
          },
          {
            __typename: 'PullRequestRuleRollup',

            result: 'PASSED',
            ruleType: 'PULL_REQUEST',
          },
        ],
      },
    ],
  } as PullRequestMergeRequirements,
}
