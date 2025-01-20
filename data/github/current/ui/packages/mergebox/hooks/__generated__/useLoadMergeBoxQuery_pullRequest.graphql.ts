/**
 * @generated SignedSource<<45da83b64f2674a9fd6e8f8076cdcbbc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type MergeQueueEntryState = "AWAITING_CHECKS" | "LOCKED" | "MERGEABLE" | "QUEUED" | "UNMERGEABLE" | "%future added value";
export type MergeStateStatus = "BEHIND" | "BLOCKED" | "CLEAN" | "DIRTY" | "DRAFT" | "HAS_HOOKS" | "UNKNOWN" | "UNSTABLE" | "%future added value";
export type PullRequestMergeAction = "DIRECT_MERGE" | "MERGE_QUEUE" | "%future added value";
export type PullRequestMergeConditionResult = "FAILED" | "PASSED" | "UNKNOWN" | "%future added value";
export type PullRequestMergeMethod = "MERGE" | "REBASE" | "SQUASH" | "%future added value";
export type PullRequestMergeRequirementsState = "MERGEABLE" | "UNKNOWN" | "UNMERGEABLE" | "%future added value";
export type PullRequestReviewState = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING" | "%future added value";
export type PullRequestRuleFailureReason = "CHANGES_REQUESTED" | "CODE_OWNER_REVIEW_REQUIRED" | "MORE_REVIEWS_REQUIRED" | "SOC2_APPROVAL_PROCESS_REQUIRED" | "THREAD_RESOLUTION_REQUIRED" | "%future added value";
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type RepositoryRuleEvaluationResult = "FAILED" | "PASSED" | "%future added value";
export type RepositoryRuleType = "AUTHORIZATION" | "BRANCH_NAME_PATTERN" | "CODE_SCANNING" | "COMMITTER_EMAIL_PATTERN" | "COMMIT_AUTHOR_EMAIL_PATTERN" | "COMMIT_MESSAGE_PATTERN" | "COMMIT_OID" | "CREATION" | "DELETION" | "FILE_EXTENSION_RESTRICTION" | "FILE_PATH_RESTRICTION" | "LOCK_BRANCH" | "MAX_FILE_PATH_LENGTH" | "MAX_FILE_SIZE" | "MAX_REF_UPDATES" | "MERGE_QUEUE" | "MERGE_QUEUE_LOCKED_REF" | "NON_FAST_FORWARD" | "PULL_REQUEST" | "REPOSITORY_TRANSFER" | "REQUIRED_DEPLOYMENTS" | "REQUIRED_LINEAR_HISTORY" | "REQUIRED_REVIEW_THREAD_RESOLUTION" | "REQUIRED_SIGNATURES" | "REQUIRED_STATUS_CHECKS" | "REQUIRED_WORKFLOW_STATUS_CHECKS" | "RESTRICT_REPOSITORY_NAME" | "RESTRICT_REPO_DELETE" | "RESTRICT_REPO_VISIBILITY" | "SECRET_SCANNING" | "TAG" | "TAG_NAME_PATTERN" | "UPDATE" | "WORKFLOWS" | "WORKFLOW_UPDATES" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type useLoadMergeBoxQuery_pullRequest$data = {
  readonly autoMergeRequest: {
    readonly mergeMethod: PullRequestMergeMethod;
  } | null | undefined;
  readonly baseRefChannel: string | null | undefined;
  readonly baseRefName: string;
  readonly commitHeadShaChannel: string | null | undefined;
  readonly commits: {
    readonly totalCount: number;
  };
  readonly deployedChannel: string | null | undefined;
  readonly gitMergeStateChannel: string | null | undefined;
  readonly headRefChannel: string | null | undefined;
  readonly headRefName: string;
  readonly headRefOid: any;
  readonly headRepository: {
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  } | null | undefined;
  readonly id: string;
  readonly isDraft: boolean;
  readonly isInMergeQueue: boolean;
  readonly latestOpinionatedReviews: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly author: {
          readonly avatarUrl: string;
          readonly login: string;
          readonly name: string | null | undefined;
          readonly url: string;
        } | null | undefined;
        readonly authorCanPushToRepository: boolean;
        readonly onBehalfOf: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly name: string;
            } | null | undefined;
          } | null | undefined> | null | undefined;
        };
        readonly state: PullRequestReviewState;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly mergeQueue: {
    readonly url: string;
  } | null | undefined;
  readonly mergeQueueChannel: string | null | undefined;
  readonly mergeQueueEntry: {
    readonly position: number;
    readonly state: MergeQueueEntryState;
  } | null | undefined;
  readonly mergeRequirements: {
    readonly commitAuthor: string;
    readonly commitMessageBody: string | null | undefined;
    readonly commitMessageHeadline: string | null | undefined;
    readonly conditions: ReadonlyArray<{
      readonly __typename: string;
      readonly conflicts?: ReadonlyArray<string>;
      readonly isConflictResolvableInWeb?: boolean;
      readonly message: string | null | undefined;
      readonly result: PullRequestMergeConditionResult;
      readonly ruleRollups?: ReadonlyArray<{
        readonly failureReasons?: ReadonlyArray<PullRequestRuleFailureReason>;
        readonly message: string | null | undefined;
        readonly requiredReviewers?: number;
        readonly requiresCodeowners?: boolean;
        readonly result: RepositoryRuleEvaluationResult;
        readonly ruleType: RepositoryRuleType;
      }>;
    }>;
    readonly state: PullRequestMergeRequirementsState;
  };
  readonly mergeStateStatus: MergeStateStatus;
  readonly resourcePath: string;
  readonly reviewStateChannel: string | null | undefined;
  readonly state: PullRequestState;
  readonly stateChannel: string | null | undefined;
  readonly viewerCanAddAndRemoveFromMergeQueue: boolean;
  readonly viewerCanDeleteHeadRef: boolean;
  readonly viewerCanDisableAutoMerge: boolean;
  readonly viewerCanEnableAutoMerge: boolean;
  readonly viewerCanRestoreHeadRef: boolean;
  readonly viewerCanUpdate: boolean;
  readonly viewerCanUpdateBranch: boolean;
  readonly viewerDidAuthor: boolean;
  readonly viewerMergeActions: ReadonlyArray<{
    readonly isAllowable: boolean;
    readonly mergeMethods: ReadonlyArray<{
      readonly isAllowable: boolean;
      readonly isAllowableWithBypass: boolean;
      readonly name: PullRequestMergeMethod;
    }>;
    readonly name: PullRequestMergeAction;
  }>;
  readonly workflowsChannel: string | null | undefined;
  readonly " $fragmentType": "useLoadMergeBoxQuery_pullRequest";
};
export type useLoadMergeBoxQuery_pullRequest$key = {
  readonly " $data"?: useLoadMergeBoxQuery_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"useLoadMergeBoxQuery_pullRequest">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "useLoadMergeBoxQuery_pullRequest"
};

(node as any).hash = "319ed4afaedc868461319761ebef5a48";

export default node;
