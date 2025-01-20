import type {Meta, StoryObj} from '@storybook/react'
import {MemoryRouter} from 'react-router-dom'
import {BlockedSection, type BlockedSectionProps} from './BlockedSection'
import {useRenderWarnings} from '../../test-utils/use-render-warnings'

const BlockedSectionStoryWrapper = (
  props: BlockedSectionProps & {mergeabilityState: PullRequestMergeRequirementsState; failureReasons: string[]},
) => <BlockedSection {...props} />

type PullRequestMergeRequirementsState = 'UNMERGEABLE' | 'MERGEABLE' | 'UNKNOWN'

type Story = StoryObj<typeof BlockedSectionStoryWrapper>

const meta = {
  title: 'Pull Requests/mergebox/BlockedSection',
  parameters: {
    controls: {expanded: false},
  },
  decorators: [
    Story => (
      <MemoryRouter>
        <div style={{maxWidth: '935px'}}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof BlockedSection>

const defaultMergeRequirements = {
  state: 'UNMERGEABLE',
  conditions: [
    {
      __typename: 'PullRequestRulesCondition',
      result: 'FAILED',
      message:
        'At least one approving review is required by reviewers with write access. Missing successful deployment.',
      ruleRollups: [
        {
          ruleType: 'PULL_REQUEST',
          result: 'FAILED',
          message: 'At least one approving review is required by reviewers with write access.',
        },
        {
          ruleType: 'REQUIRED_DEPLOYMENTS',
          result: 'FAILED',
          message: 'Missing successful deployment.',
        },
      ],
    },
    {
      __typename: 'PullRequestStateCondition',
      result: 'FAILED',
      message: 'Pull request must be open and not in draft mode in order to be merged.',
      ruleRollups: [],
    },
    {
      __typename: 'PullRequestRepoStateCondition',
      result: 'FAILED',
      message: 'Pull request cannot be merged because repository is not in a writable state.',
      ruleRollups: [],
    },
    {
      __typename: 'PullRequestUserStateCondition',
      result: 'FAILED',
      message: 'User is unable to merge this pull request.',
      ruleRollups: [],
    },
    {
      __typename: 'PullRequestMergeConflictStateCondition',
      result: 'FAILED',
      message: 'Pull request cannot be merged because it has a merge conflict.',
      ruleRollups: [],
    },
  ],
}

const PRMergeStateConditions = [
  'PullRequestRulesCondition',
  'PullRequestStateCondition',
  'PullRequestRepoStateCondition',
  'PullRequestUserStateCondition',
  'PullRequestMergeConflictStateCondition',
]

export const Default: Story = {
  args: {
    isDraft: false,
    mergeRequirementsState: 'UNMERGEABLE',
    failureReasons: PRMergeStateConditions,
  },
  argTypes: {
    mergeRequirementsState: {
      options: ['UNMERGEABLE', 'MERGEABLE', 'UNKNOWN'],
      control: {
        type: 'inline-radio',
      },
    },
    failureReasons: {
      options: PRMergeStateConditions,
      control: {
        type: 'check',
      },
    },
  },
  render: function Component(args) {
    const {failureReasons, mergeRequirementsState, isDraft} = args
    const {warnIf, RenderWarnings} = useRenderWarnings()

    warnIf(isDraft, 'BlockedSection does not render for draft PRs')
    warnIf(mergeRequirementsState !== 'UNMERGEABLE', `BlockedSection does not render for ${mergeRequirementsState} PRs`)

    const blockedConditions = defaultMergeRequirements.conditions.filter(condition => {
      return failureReasons.includes(condition.__typename)
    })

    return (
      <>
        <RenderWarnings />
        <BlockedSectionStoryWrapper
          {...args}
          isDraft={isDraft}
          mergeRequirementsState={mergeRequirementsState}
          failingMergeConditionsWithoutRulesCondition={defaultMergeRequirements.conditions}
          failingRulesConditions={blockedConditions}
        />
      </>
    )
  },
}

export default meta
