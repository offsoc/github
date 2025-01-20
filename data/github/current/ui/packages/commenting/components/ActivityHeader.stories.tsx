import type {Meta, StoryObj} from '@storybook/react'

import {ActivityHeader} from '../components/ActivityHeader'

type ActivityHeaderProps = React.ComponentProps<typeof ActivityHeader>

const meta = {
  title: 'Recipes/CommentBox/ActivityHeader',
  component: ActivityHeader,
} satisfies Meta<typeof ActivityHeader>

const args = {
  avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  comment: {
    authorAssociation: 'MEMBER',
    id: '1',
    createdAt: '2021-08-05T18:00:00Z',
    isHidden: false,
    minimizedReason: null,
    repository: {
      id: '1',
      isPrivate: true,
      name: 'repo-name',
      owner: {
        login: 'owner-login',
        url: 'url',
      },
    },
    url: 'url',
  },
  commentAuthorLogin: 'displayLogin',
  isMinimized: false,
} satisfies ActivityHeaderProps

export default meta

export const Example: StoryObj = {args, name: 'ActivityHeader'}

const pendingReviewCommentArgs = {...args, comment: {...args.comment, state: 'PENDING'}} satisfies ActivityHeaderProps
export const PendingReviewComment: StoryObj = {
  args: pendingReviewCommentArgs,
  name: 'With Pending Review Comment',
}
