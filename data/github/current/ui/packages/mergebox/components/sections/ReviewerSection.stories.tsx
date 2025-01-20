import type {Meta, StoryObj} from '@storybook/react'

import {ReviewerSection, type ReviewerSectionProps} from './ReviewerSection'

const meta: Meta<typeof ReviewerSection> = {
  title: 'Pull Requests/mergebox/ReviewerSection',
  component: ReviewerSection,
}

type StoryProps = {state: keyof typeof REVIEW_STATES}
type Story = StoryObj<ReviewerSectionProps & StoryProps>

const REVIEW_STATES: {[key: string]: ReviewerSectionProps} = {
  CHANGES_REQUESTED: {
    latestOpinionatedReviews: [
      {
        state: 'CHANGES_REQUESTED',
        author: {login: 'octocat', name: 'Octo Cat', avatarUrl: '', url: ''},
        authorCanPushToRepository: true,
        onBehalfOf: ['special-reviewer-team'],
      },
    ],
    reviewerRuleRollups: [
      {
        failureReasons: ['CHANGES_REQUESTED'],
        requiredReviewers: 1,
        requiresCodeowners: false,
      },
    ],
  },
  APPROVED: {
    latestOpinionatedReviews: [
      {
        state: 'APPROVED',
        author: {login: 'octocat', name: 'Octo Cat', avatarUrl: '', url: ''},
        authorCanPushToRepository: true,
        onBehalfOf: ['special-reviewer-team', 'another-reviewer-team'],
      },
    ],
    reviewerRuleRollups: [
      {
        requiredReviewers: 1,
        requiresCodeowners: true,
      },
    ],
  },
  REVIEW_REQUIRED: {
    latestOpinionatedReviews: [
      {
        state: 'APPROVED',
        author: {login: 'octocat', name: 'Octo Cat', avatarUrl: '', url: ''},
        authorCanPushToRepository: true,
        onBehalfOf: ['special-reviewer-team'],
      },
    ],
    reviewerRuleRollups: [
      {
        failureReasons: ['MORE_REVIEWS_REQUIRED'],
        requiredReviewers: 2,
        requiresCodeowners: true,
      },
    ],
  },
  NO_REVIEW_REQUIRED: {
    latestOpinionatedReviews: [
      {
        state: 'APPROVED',
        author: {login: 'octocat', name: 'Octo Cat', avatarUrl: '', url: ''},
        authorCanPushToRepository: true,
        onBehalfOf: ['special-reviewer-team'],
      },
    ],
    reviewerRuleRollups: [],
  },
  CODEOWNER_REVIEW_REQUIRED: {
    latestOpinionatedReviews: [
      {
        state: 'APPROVED',
        author: {login: 'octocat', name: 'Octo Cat', avatarUrl: '', url: ''},
        authorCanPushToRepository: true,
        onBehalfOf: ['special-reviewer-team'],
      },
    ],
    reviewerRuleRollups: [
      {
        requiredReviewers: 1,
        requiresCodeowners: true,
        failureReasons: ['CODE_OWNER_REVIEW_REQUIRED'],
      },
    ],
  },
}

export const Story: Story = {
  args: {
    state: 'APPROVED',
  },
  argTypes: {
    state: {
      options: Object.keys(REVIEW_STATES),
      control: {
        type: 'radio',
      },
    },
  },
  render: ({state}: StoryProps) => {
    const props = REVIEW_STATES[state]

    if (!props) return <></>

    return <ReviewerSection {...props} />
  },
}

export default meta
