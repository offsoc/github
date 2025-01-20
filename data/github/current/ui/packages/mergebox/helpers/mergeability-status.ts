import {
  CheckCircleFillIcon,
  DotFillIcon,
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  XCircleFillIcon,
  type Icon,
} from '@primer/octicons-react'
import type {MergeStatusButtonData, PullRequestRuleFailureReason, RepositoryRuleType} from '../types'
import type {MergeBoxPageData, PullRequestMergeRequirementsPayload} from '../page-data/payloads/merge-box'

export enum Status {
  AwaitingReview,
  ChangesRequested,
  ChecksFailing,
  ChecksPending,
  DraftReadyForReview,
  DraftNotReadyForReview,
  InMergeQueue,
  MergeConflicts,
  Mergeable,
  NonactionableFailure,
  UnableToMerge,
  Unknown,
  Merged,
  Closed,
}

type ButtonPresentation = {
  icon: Icon
  iconColor: string
  title: string
}

/**
 * Returns the button presentation details for the given mergeability status
 */
export function presentationForStatus(status: Status): ButtonPresentation {
  switch (status) {
    case Status.Mergeable:
      return {
        icon: CheckCircleFillIcon,
        iconColor: 'success.emphasis',
        title: 'Merge pull request',
      }
    case Status.DraftReadyForReview:
      return {
        icon: GitPullRequestDraftIcon,
        iconColor: 'neutral.emphasis',
        title: 'Draft',
      }
    case Status.DraftNotReadyForReview:
      return {
        icon: GitPullRequestDraftIcon,
        iconColor: 'neutral.emphasis',
        title: 'Draft',
      }
    case Status.InMergeQueue:
      return {
        icon: GitMergeQueueIcon,
        iconColor: 'attention.emphasis',
        title: 'Queued',
      }
    case Status.ChecksPending:
      return {
        icon: DotFillIcon,
        iconColor: 'neutral.emphasis',
        title: 'Checks pending',
      }
    case Status.ChecksFailing:
      return {
        icon: XCircleFillIcon,
        iconColor: 'danger.emphasis',
        title: 'Checks failing',
      }
    case Status.AwaitingReview:
      return {
        icon: DotFillIcon,
        iconColor: 'attention.emphasis',
        title: 'Awaiting reviews',
      }
    case Status.ChangesRequested:
      return {
        icon: XCircleFillIcon,
        iconColor: 'danger.emphasis',
        title: 'Changes requested',
      }
    case Status.MergeConflicts:
      return {
        icon: XCircleFillIcon,
        iconColor: 'danger.emphasis',
        title: 'Merge conflicts',
      }
    case Status.Unknown:
      return {
        icon: DotFillIcon,
        iconColor: 'neutral.emphasis',
        title: 'Unknown',
      }
    case Status.Merged:
      return {
        icon: GitMergeIcon,
        iconColor: 'done.emphasis',
        title: 'Merged',
      }
    case Status.Closed:
      return {
        icon: GitPullRequestClosedIcon,
        iconColor: 'neutral.emphasis',
        title: 'Closed',
      }
    default:
      return {
        icon: XCircleFillIcon,
        iconColor: 'danger.emphasis',
        title: 'Unable to merge',
      }
  }
}

/**
 * Returns the border color for a given mergeability status
 */
export function borderColorClassForStatus(status: Status): string {
  switch (status) {
    case Status.Mergeable:
      return 'borderColor-success-emphasis'
    case Status.DraftReadyForReview:
      return 'borderColor-default'
    case Status.DraftNotReadyForReview:
      return 'borderColor-default'
    case Status.InMergeQueue:
      return 'borderColor-attention-emphasis'
    case Status.ChecksPending:
      return 'borderColor-attention-emphasis'
    case Status.ChecksFailing:
      return 'borderColor-danger-emphasis'
    case Status.AwaitingReview:
      return 'borderColor-attention-emphasis'
    case Status.ChangesRequested:
      return 'borderColor-danger-emphasis'
    case Status.MergeConflicts:
      return 'borderColor-danger-emphasis'
    case Status.Merged:
      return 'borderColor-done-emphasis'
    case Status.Closed:
      return 'borderColor-muted'
    case Status.Unknown:
      return 'borderColor-default'
    default:
      return 'borderColor-danger-emphasis'
  }
}

/**
 * This file returns the mergebility status for a pull request.
 * There are two versions, one that is compatible with Relay and one that is compatible with the bespoke JSON endpoint.
 */

function failingConditionsFromRelay(pull: MergeStatusButtonData): string[] {
  const failures = pull.mergeRequirements.conditions.filter(cond => 'result' in cond && cond.result === 'FAILED')
  return failures.map(cond => cond.__typename)
}

function failingRuleRollupTypesFromRelay(pull: MergeStatusButtonData): RepositoryRuleType[] {
  const ruleCondition = pull.mergeRequirements.conditions.find(cond => cond.__typename === 'PullRequestRulesCondition')
  if (!ruleCondition || !('ruleRollups' in ruleCondition)) return []

  const failures = ruleCondition.ruleRollups?.filter(rollup => rollup.result === 'FAILED')
  if (!failures) return []

  return failures.map(rollup => rollup.ruleType)
}

function hasNonactionableFailuresFromRelay(pull: MergeStatusButtonData): boolean {
  const failing = failingConditionsFromRelay(pull)
  return failing.includes('PullRequestRepoStateCondition') || failing.includes('PullRequestUserStateCondition')
}

function hasConflictsFromRelay(pull: MergeStatusButtonData): boolean {
  return failingConditionsFromRelay(pull).includes('PullRequestMergeConflictStateCondition')
}

function requiredStatusCheckMessageFromRelay(pull: MergeStatusButtonData): string {
  const ruleCondition = pull.mergeRequirements.conditions.find(cond => cond.__typename === 'PullRequestRulesCondition')
  const reqChecksRollup =
    ruleCondition?.__typename === 'PullRequestRulesCondition'
      ? ruleCondition.ruleRollups!.find(rollup => rollup.ruleType === 'REQUIRED_STATUS_CHECKS')
      : null
  if (!reqChecksRollup || reqChecksRollup.result !== 'FAILED') return ''

  return reqChecksRollup.message ?? ''
}

function hasPendingRequiredChecksFromRelay(pull: MergeStatusButtonData): boolean {
  return (
    failingRuleRollupTypesFromRelay(pull).includes('REQUIRED_STATUS_CHECKS') && !hasFailingRequiredChecksFromRelay(pull)
  )
}

function hasFailingRequiredChecksFromRelay(pull: MergeStatusButtonData): boolean {
  return (
    failingRuleRollupTypesFromRelay(pull).includes('REQUIRED_STATUS_CHECKS') &&
    !!requiredStatusCheckMessageFromRelay(pull).match(/failing|errored/)
  )
}

function pullRequestRuleFailureReasonsFromRelay(pull: MergeStatusButtonData): readonly PullRequestRuleFailureReason[] {
  const ruleCondition = pull.mergeRequirements.conditions.find(cond => cond.__typename === 'PullRequestRulesCondition')
  const pullRequestRollup =
    ruleCondition?.__typename === 'PullRequestRulesCondition'
      ? ruleCondition.ruleRollups!.find(rollup => rollup.ruleType === 'PULL_REQUEST')
      : null
  if (!pullRequestRollup || pullRequestRollup.result !== 'FAILED') return []

  return pullRequestRollup.failureReasons || []
}

function isAwaitingReviewFromRelay(pull: MergeStatusButtonData): boolean {
  return (
    failingRuleRollupTypesFromRelay(pull).includes('PULL_REQUEST') &&
    !pullRequestRuleFailureReasonsFromRelay(pull).includes('CHANGES_REQUESTED')
  )
}

function hasRequestedChangesFromRelay(pull: MergeStatusButtonData): boolean {
  return pullRequestRuleFailureReasonsFromRelay(pull).includes('CHANGES_REQUESTED')
}

/**
 * Computes the mergeability status of a pull request,
 * which is used to determine the color and presentation of the
 * merge status button and various other UI elements.
 * This is the version that is compatible with Relay.
 */
export function mergeabilityStatusFromRelay(pull: MergeStatusButtonData): Status {
  const reqs = pull.mergeRequirements
  if (pull.state === 'MERGED') {
    return Status.Merged
  } else if (pull.state === 'CLOSED') {
    return Status.Closed
  } else if (hasNonactionableFailuresFromRelay(pull)) {
    return Status.NonactionableFailure
  } else if (pull.isInMergeQueue) {
    return Status.InMergeQueue
  } else if (pull.isDraft && !failingRuleRollupTypesFromRelay(pull).includes('REQUIRED_STATUS_CHECKS')) {
    return Status.DraftReadyForReview
  } else if (pull.isDraft) {
    return Status.DraftNotReadyForReview
  } else if (reqs.state === 'MERGEABLE') {
    return Status.Mergeable
  } else if (hasPendingRequiredChecksFromRelay(pull)) {
    return Status.ChecksPending
  } else if (hasFailingRequiredChecksFromRelay(pull)) {
    return Status.ChecksFailing
  } else if (isAwaitingReviewFromRelay(pull)) {
    return Status.AwaitingReview
  } else if (hasRequestedChangesFromRelay(pull)) {
    return Status.ChangesRequested
  } else if (reqs.state === 'UNKNOWN' && !hasConflictsFromRelay(pull)) {
    return Status.Unknown
  } else if (hasConflictsFromRelay(pull)) {
    return Status.MergeConflicts
  } else {
    return Status.UnableToMerge
  }
}

function failingConditions(mergeRequirements: PullRequestMergeRequirementsPayload | null): string[] {
  const failures = mergeRequirements?.conditions.filter(cond => cond.result === 'FAILED') ?? []
  return failures.map(cond => cond.type)
}

function hasNonactionableFailures(mergeRequirements: PullRequestMergeRequirementsPayload | null) {
  const failing = failingConditions(mergeRequirements)
  return failing.includes('PULL_REQUEST_REPO_STATE') || failing.includes('PULL_REQUEST_USER_STATE')
}

function failingRuleRollupTypes(mergeRequirements: PullRequestMergeRequirementsPayload | null): RepositoryRuleType[] {
  const ruleCondition = mergeRequirements?.conditions.find(cond => cond.type === 'PULL_REQUEST_RULES')
  if (!ruleCondition) return []

  const failures = ruleCondition?.ruleRollups?.filter(rollup => rollup.result === 'FAILED')
  if (!failures) return []

  return failures.map(rollup => rollup.ruleType)
}

function hasPendingRequiredChecks(mergeRequirements: PullRequestMergeRequirementsPayload | null): boolean {
  return (
    failingRuleRollupTypes(mergeRequirements).includes('REQUIRED_STATUS_CHECKS') &&
    !hasFailingRequiredChecks(mergeRequirements)
  )
}

function requiredStatusCheckMessage(mergeRequirements: PullRequestMergeRequirementsPayload | null): string {
  const ruleCondition = mergeRequirements?.conditions.find(cond => cond.type === 'PULL_REQUEST_RULES')
  const reqChecksRollup = ruleCondition?.ruleRollups?.find(rollup => rollup.ruleType === 'REQUIRED_STATUS_CHECKS')
  if (!reqChecksRollup || reqChecksRollup.result !== 'FAILED') return ''

  return reqChecksRollup.message ?? ''
}

function hasFailingRequiredChecks(mergeRequirements: PullRequestMergeRequirementsPayload | null): boolean {
  return (
    failingRuleRollupTypes(mergeRequirements).includes('REQUIRED_STATUS_CHECKS') &&
    !!requiredStatusCheckMessage(mergeRequirements).match(/failing|errored/)
  )
}

function isAwaitingReview(mergeRequirements: PullRequestMergeRequirementsPayload | null): boolean {
  return (
    failingRuleRollupTypes(mergeRequirements).includes('PULL_REQUEST') &&
    !pullRequestRuleFailureReasons(mergeRequirements).includes('CHANGES_REQUESTED')
  )
}

function pullRequestRuleFailureReasons(
  mergeRequirements: PullRequestMergeRequirementsPayload | null,
): PullRequestRuleFailureReason[] {
  const ruleCondition = mergeRequirements?.conditions.find(cond => cond.type === 'PULL_REQUEST_RULES')
  const pullRequestRollup = ruleCondition?.ruleRollups?.find(rollup => rollup.ruleType === 'PULL_REQUEST')
  if (!pullRequestRollup || pullRequestRollup.result !== 'FAILED') return []
  const metadata = pullRequestRollup.metadata

  return metadata && 'failureReasons' in metadata
    ? (metadata.failureReasons.map(r => r.toUpperCase()) as PullRequestRuleFailureReason[]) || []
    : []
}

function hasRequestedChanges(mergeRequirements: PullRequestMergeRequirementsPayload | null): boolean {
  return pullRequestRuleFailureReasons(mergeRequirements).includes('CHANGES_REQUESTED')
}

function hasConflicts(mergeRequirements: PullRequestMergeRequirementsPayload | null) {
  return failingConditions(mergeRequirements).includes('PULL_REQUEST_MERGE_CONFLICT_STATE')
}

/**
 * Computes the mergeability status of a pull request,
 * which is used to determine the color and presentation of the
 * merge status button and various other UI elements.
 * This is the version that is compatible with the bespoke JSON endpoint.
 */
export function mergeabilityStatus({pullRequest: pull, mergeRequirements}: MergeBoxPageData) {
  if (pull.state === 'MERGED') {
    return Status.Merged
  } else if (pull.state === 'CLOSED') {
    return Status.Closed
  } else if (hasNonactionableFailures(mergeRequirements)) {
    return Status.NonactionableFailure
  } else if (pull.isInMergeQueue) {
    return Status.InMergeQueue
  } else if (pull.isDraft && !failingRuleRollupTypes(mergeRequirements).includes('REQUIRED_STATUS_CHECKS')) {
    return Status.DraftReadyForReview
  } else if (pull.isDraft) {
    return Status.DraftNotReadyForReview
  } else if (mergeRequirements?.state === 'MERGEABLE') {
    return Status.Mergeable
  } else if (hasPendingRequiredChecks(mergeRequirements)) {
    return Status.ChecksPending
  } else if (hasFailingRequiredChecks(mergeRequirements)) {
    return Status.ChecksFailing
  } else if (isAwaitingReview(mergeRequirements)) {
    return Status.AwaitingReview
  } else if (hasRequestedChanges(mergeRequirements)) {
    return Status.ChangesRequested
  } else if (mergeRequirements?.state === 'UNKNOWN' && !hasConflicts(mergeRequirements)) {
    return Status.Unknown
  } else if (hasConflicts(mergeRequirements)) {
    return Status.MergeConflicts
  } else {
    return Status.UnableToMerge
  }
}
