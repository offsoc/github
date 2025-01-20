import {
  getConflictsCondition,
  getFailingMergeConditionsWithoutRulesCondition,
  getFailingRulesConditions,
  getReviewRuleRollupMetadata,
} from '../json-api-helpers'
import {mergeBoxMockData} from '../../test-utils/mocks/json-api-response.mock'

describe('getReviewRuleRollupMetadata', () => {
  test('returns the right metadata for the pull request rule rollup', () => {
    const reviewerRules = getReviewRuleRollupMetadata(mergeBoxMockData().mergeRequirements)
    expect(reviewerRules).toEqual([
      {requiredReviewers: 1, requiresCodeowners: false, failureReasons: ['SOC2_APPROVAL_PROCESS_REQUIRED']},
    ])
  })
})

describe('getConflictsCondition', () => {
  test('returns the conflict condition if it exists', () => {
    const conflictCondition = getConflictsCondition(mergeBoxMockData().mergeRequirements)
    expect(conflictCondition).toEqual({
      type: 'PULL_REQUEST_MERGE_CONFLICT_STATE',
      displayName: 'Pull request merge conflict state',
      description: 'The pull request must not have any unresolved merge conflicts',
      message: null,
      result: 'PASSED',
      ruleRollups: null,
      conflicts: [],
      isConflictResolvableInWeb: true,
    })
  })
})

describe('getFailingMergeConditionsWithoutRulesCondition', () => {
  test('returns the failing merge conditions excluding the pull request rules condition', () => {
    const failingMergeConditions = getFailingMergeConditionsWithoutRulesCondition(mergeBoxMockData().mergeRequirements)
    expect(failingMergeConditions).toEqual([
      {
        type: 'PULL_REQUEST_MERGE_METHOD',
        displayName: 'Pull request merge method',
        description: 'The selected merge method must be valid for the base repository.',
        message: null,
        result: 'FAILED',
        ruleRollups: null,
      },
    ])
  })
})

describe('getFailingRulesCondition', () => {
  test('returns the failing rules condition if it exists', () => {
    const failingRulesCondition = getFailingRulesConditions(mergeBoxMockData().mergeRequirements)
    expect(failingRulesCondition).toEqual([
      {
        type: 'PULL_REQUEST_RULES',
        displayName: 'Repo rules',
        description: 'Pull request repository rules',
        message:
          'Changes must be made through the merge queue Missing successful active production deployment. Waiting on approval from at least one compliance team: my-cool-reviewers.',
        result: 'FAILED',
        ruleRollups: [
          {
            ruleType: 'PULL_REQUEST',
            displayName: 'Require a pull request before merging',
            message: 'Waiting on approval from at least one compliance team: my-cool-reviewers.',
            result: 'FAILED',
            bypassable: false,
            metadata: {
              requiredReviewers: 1,
              requiresCodeowners: false,
              failureReasons: ['soc2_approval_process_required'],
            },
          },
          {
            ruleType: 'WORKFLOWS',
            displayName: 'Require workflows to pass before merging',
            message: '',
            result: 'PASSED',
            bypassable: true,
            metadata: null,
          },
          {
            ruleType: 'DELETION',
            displayName: 'Restrict deletions',
            message: '',
            result: 'PASSED',
            bypassable: false,
            metadata: null,
          },
          {
            ruleType: 'NON_FAST_FORWARD',
            displayName: 'Block force pushes',
            message: '',
            result: 'PASSED',
            bypassable: false,
            metadata: null,
          },
          {
            ruleType: 'REQUIRED_STATUS_CHECKS',
            displayName: 'Require status checks to pass',
            message: '',
            result: 'PASSED',
            bypassable: false,
            metadata: {
              statusCheckResults: [
                {
                  context: 'job / job-name',
                  integrationId: 12345,
                  result: 'success',
                },
              ],
            },
          },
        ],
      },
    ])
  })
})
