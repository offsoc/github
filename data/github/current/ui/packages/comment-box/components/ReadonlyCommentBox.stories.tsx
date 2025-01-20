import type {Meta, StoryObj} from '@storybook/react'
import {ReadonlyCommentBox} from './ReadonlyCommentBox'
import {AlertIcon} from '@primer/octicons-react'

type ReadonlyCommentBoxProps = React.ComponentProps<typeof ReadonlyCommentBox>

const meta = {
  title: 'Recipes/CommentBox/CommentBox/ReadonlyCommentBox',
  component: ReadonlyCommentBox,
} satisfies Meta<typeof ReadonlyCommentBox>

const args = {
  reason: 'You do not have permissions to comment on this issue.',
  icon: AlertIcon,
} satisfies ReadonlyCommentBoxProps

export default meta

export const Example: StoryObj = {args, name: 'ReadonlyCommentBox'}
