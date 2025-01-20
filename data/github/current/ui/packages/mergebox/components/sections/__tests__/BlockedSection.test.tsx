import {render, screen} from '@testing-library/react'
import {BlockedSection as TestComponent} from '../BlockedSection'
import type {BlockedSectionProps} from '../BlockedSection'
import type {PullRequestMergeRequirements} from '../../../types'

const defaultProps: BlockedSectionProps = {
  isDraft: false,
  mergeRequirementsState: 'MERGEABLE',
  failingMergeConditionsWithoutRulesCondition: [],
  failingRulesConditions: [],
}

describe('Blocked section', () => {
  test('it does not render if the merge state status is mergeable', async () => {
    const {container} = render(<TestComponent {...defaultProps} />)

    expect(container).toBeEmptyDOMElement()
  })

  test('if the merge requirements status is unmergeable, it renders', async () => {
    render(<TestComponent {...{...defaultProps, mergeRequirementsState: 'UNMERGEABLE'}} />)

    expect(screen.getByText('Merging is blocked')).toBeInTheDocument()
  })

  describe('enforcing repo rules', () => {
    const NotInMergeQueue = {
      result: 'FAILED',
      ruleType: 'MERGE_QUEUE',
      message: 'Changes must be made through the merge queue',
    }
    const MissingApprovingReview = {
      result: 'FAILED',
      ruleType: 'PULL_REQUEST',
      message: 'At least one approving review is required by reviewers with write access.',
    }
    const MissingSuccessfulDeployment = {
      result: 'FAILED',
      ruleType: 'REQUIRED_DEPLOYMENTS',
      message: 'Missing successful deployment',
    }
    const EmptyPassed = {result: 'PASSED', ruleType: 'AUTHORIZATION', message: ''}

    const PRStateCondition = {
      __typename: 'PullRequestStateCondition',
      result: 'FAILED',
      message: 'Pull request must be open and not in draft mode in order to be merged.',
    }
    const PRRepoStateCondition = {
      __typename: 'PullRequestRepoStateCondition',
      result: 'FAILED',
      message: 'Pull request cannot be merged because repository is not in a writable state.',
    }
    const PRUserStateCondition = {
      __typename: 'PullRequestUserStateCondition',
      result: 'FAILED',
      message: 'User is unable to merge this pull request.',
    }
    const PRMergeConflictStateCondition = {
      __typename: 'PullRequestMergeConflictStateCondition',
      result: 'FAILED',
      message: 'Pull request cannot be merged because it has a merge conflict.',
    }

    const pullRequestRulesCondition = (rollup: {message: string; ruleType: string; result: string}) => ({
      __typename: 'PullRequestRulesCondition',
      result: 'FAILED',
      message: `${MissingApprovingReview.message} ${rollup.message}`,
      ruleRollups: [MissingApprovingReview, rollup, EmptyPassed],
    })

    const mergeRequirements = {
      state: 'UNMERGEABLE' as PullRequestMergeRequirements['state'],
      conditions: [PRStateCondition, PRRepoStateCondition, PRUserStateCondition, PRMergeConflictStateCondition],
    }

    test('if the merge state status is blocked due to repo rules, it renders the reasons', async () => {
      const props: BlockedSectionProps = {
        ...defaultProps,
        mergeRequirementsState: mergeRequirements.state,
        failingRulesConditions: [pullRequestRulesCondition(MissingSuccessfulDeployment)],
        failingMergeConditionsWithoutRulesCondition: mergeRequirements.conditions,
      }
      render(<TestComponent {...props} />)

      expect(screen.getByText('Merging is blocked')).toBeInTheDocument()

      expect(screen.getByText(PRStateCondition.message)).toBeInTheDocument()
      expect(screen.getByText(PRRepoStateCondition.message)).toBeInTheDocument()
      expect(screen.getByText(PRMergeConflictStateCondition.message)).toBeInTheDocument()
      expect(screen.getByText(PRUserStateCondition.message)).toBeInTheDocument()
      expect(screen.getByText(MissingApprovingReview.message)).toBeInTheDocument()
      expect(screen.getByText(MissingSuccessfulDeployment.message)).toBeInTheDocument()

      // We don't show the rollup for the rules condition. Instead we show the individual failure messages.
      expect(
        screen.queryByText(
          'At least one approving review is required by reviewers with write access. Missing successful deployment',
        ),
      ).not.toBeInTheDocument()
    })

    test('if the merge state status is blocked due to repo rules, it renders the reasons, excluding the merge queue rule', async () => {
      const props = {
        ...defaultProps,
        mergeRequirementsState: mergeRequirements.state,
        failingRulesConditions: [pullRequestRulesCondition(NotInMergeQueue)],
        failingMergeConditionsWithoutRulesCondition: mergeRequirements.conditions,
      }

      render(<TestComponent {...props} />)

      expect(screen.getByText('Merging is blocked')).toBeInTheDocument()

      expect(screen.getByText(PRStateCondition.message)).toBeInTheDocument()
      expect(screen.getByText(PRRepoStateCondition.message)).toBeInTheDocument()
      expect(screen.getByText(PRMergeConflictStateCondition.message)).toBeInTheDocument()
      expect(screen.getByText(PRUserStateCondition.message)).toBeInTheDocument()
      expect(screen.getByText(MissingApprovingReview.message)).toBeInTheDocument()

      expect(screen.queryByText('Changes must be made through the merge queue')).not.toBeInTheDocument()

      // We don't show the rollup for the rules condition. Instead we show the individual failure messages.
      expect(
        screen.queryByText(
          'At least one approving review is required by reviewers with write access. Missing successful deployment',
        ),
      ).not.toBeInTheDocument()
    })
  })
})
