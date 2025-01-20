import type {Meta, StoryObj} from '@storybook/react'
import {useArgs} from '@storybook/preview-api'
import {CommentBox} from './CommentBox'
import {noop} from '@github-ui/noop'
import type {Subject as CommentBoxSubject} from './subject'

type StoryProps = React.ComponentProps<typeof CommentBox>

const meta = {
  title: 'Recipes/CommentBox/CommentBox/CommentBox',
  component: CommentBox,
  decorators: [
    (Story, ctx) => {
      const [, setArgs] = useArgs<typeof ctx.args>()
      const onChange = (body: string) => {
        setArgs({value: body})
      }
      return <Story args={{...ctx.args, onChange}} />
    },
  ],
} satisfies Meta<typeof CommentBox>

const subject: CommentBoxSubject = {
  type: 'issue',
  repository: {
    databaseId: 1,
    nwo: 'nwo',
    slashCommandsEnabled: true,
  },
}

const args = {
  subject,
  value: 'Lorem ipsum dolor sit amet',
  onChange: noop,
  markdownErrorMessage: '',
} satisfies StoryProps

export default meta

export const Example: StoryObj = {args, name: 'CommentBox'}
