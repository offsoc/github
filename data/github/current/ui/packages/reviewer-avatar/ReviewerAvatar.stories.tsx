import type {Meta} from '@storybook/react'
import {Box} from '@primer/react'
import {ReviewerAvatar, type ReviewerAvatarProps} from './ReviewerAvatar'
import {REVIEW_STATES} from './review-states'

const meta = {
  title: 'ReviewerAvatar',
  component: ReviewerAvatar,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    state: {
      options: Object.keys(REVIEW_STATES),
      control: {type: 'radio'},
    },
  },
} satisfies Meta<typeof ReviewerAvatar>

export default meta

const defaultArgs: Partial<ReviewerAvatarProps> = {
  state: 'APPROVED',
  author: {
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
}

export const ReviewerAvatarExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ReviewerAvatarProps) => (
    <Box sx={{height: '20px', width: '20px'}}>
      <ReviewerAvatar {...args} />
    </Box>
  ),
}
