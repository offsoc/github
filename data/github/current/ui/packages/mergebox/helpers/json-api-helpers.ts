import type {
  PullRequestMergeRequirementsPayload,
  ConflictMergeConditionPayload,
  MergeConditionPayload,
  JSONAPIPullRequestPayload,
} from '../page-data/payloads/merge-box'
import type {PullRequestRuleFailureReason} from '../types'

type ReviewerRollup = {
  requiredReviewers: number
  requiresCodeowners: boolean
  failureReasons: PullRequestRuleFailureReason[]
}
/**
 * Extracts the metadata for the pull request rule from the merge requirements payload
 * @param mergeRequirements
 * @returns ReviewerRuleMetadata[]
 */
export function getReviewRuleRollupMetadata(
  mergeRequirements: PullRequestMergeRequirementsPayload | null,
): ReviewerRollup[] {
  const pullRequestCondition =
    mergeRequirements && mergeRequirements.conditions.find(c => c.type === 'PULL_REQUEST_RULES')
  const rollupMetadata =
    pullRequestCondition?.ruleRollups?.filter(rr => rr.ruleType === 'PULL_REQUEST').map(rollup => rollup.metadata) ?? []

  return (
    rollupMetadata
      .filter(metadata => metadata !== null)
      .filter(
        metadata => 'requiredReviewers' in metadata && 'requiresCodeowners' in metadata && 'failureReasons' in metadata,
      )
      .map(metadata => {
        const failureReasons = metadata.failureReasons.map(
          reason => reason.toUpperCase() as PullRequestRuleFailureReason,
        )
        return {
          requiredReviewers: metadata.requiredReviewers,
          requiresCodeowners: metadata.requiresCodeowners,
          failureReasons,
        }
      }) ?? []
  )
}

/**
 * Gets the conflict condition from the merge requirements payload
 * @param mergeRequirements
 * @returns ConflictMergeConditionPayload | undefined
 */
export function getConflictsCondition(
  mergeRequirements: PullRequestMergeRequirementsPayload | null,
): ConflictMergeConditionPayload | undefined {
  const condition =
    mergeRequirements && mergeRequirements.conditions.find(c => c.type === 'PULL_REQUEST_MERGE_CONFLICT_STATE')
  if (condition && 'conflicts' in condition && 'isConflictResolvableInWeb' in condition) {
    return condition
  }
}

/**
 * Gets the failing merge conditions excluding the pull request rules condition from the merge requirements payload
 * The rules condition has a rollup of additional rules that have messages, so we handle those separately
 * @param mergeRequirements
 * @returns MergeConditionPayload[]
 */
export function getFailingMergeConditionsWithoutRulesCondition(
  mergeRequirements: PullRequestMergeRequirementsPayload | null,
): MergeConditionPayload[] {
  const failedConditions =
    mergeRequirements?.conditions.filter(
      condition => condition.type !== 'PULL_REQUEST_RULES' && condition.result === 'FAILED',
    ) ?? []
  return failedConditions
}

/**
 * Gets the failing pull request rules conditions from the merge requirements payload
 * @param mergeRequirements
 * @returns MergeConditionPayload[]
 */
export function getFailingRulesConditions(
  mergeRequirements: PullRequestMergeRequirementsPayload | null,
): MergeConditionPayload[] {
  const failedRules =
    mergeRequirements?.conditions.filter(
      condition => condition.type === 'PULL_REQUEST_RULES' && condition.result === 'FAILED',
    ) ?? []
  return failedRules
}

/**
 * Helper to make the head repository the same shape as expected
 */
export function transformProperties(pullRequest: JSONAPIPullRequestPayload) {
  return {
    ...pullRequest,
    headRepository: pullRequest.headRepository
      ? {...pullRequest.headRepository, owner: {login: pullRequest.headRepository.ownerLogin}}
      : null,
  }
}
