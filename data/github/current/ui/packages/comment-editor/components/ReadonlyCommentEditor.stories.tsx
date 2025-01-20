import type {Meta, StoryObj} from '@storybook/react'
import {ReadonlyCommentEditor} from './ReadonlyCommentEditor'
import {AlertIcon} from '@primer/octicons-react'

type ReadonlyCommentEditorProps = React.ComponentProps<typeof ReadonlyCommentEditor>

const meta = {
  title: 'Recipes/CommentBox/CommentEditor/ReadonlyCommentEditor',
  component: ReadonlyCommentEditor,
} satisfies Meta<typeof ReadonlyCommentEditor>

const args = {
  reason: 'You do not have permissions to comment on this issue.',
  icon: AlertIcon,
} satisfies ReadonlyCommentEditorProps

export default meta

export const Example: StoryObj = {args, name: 'ReadonlyCommentEditor'}
