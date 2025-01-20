import type {Meta, StoryObj} from '@storybook/react'
import {useArgs} from '@storybook/preview-api'
import {CommentEditor} from './CommentEditor'
import {noop} from '@github-ui/noop'
import type {Subject as CommentEditorSubject} from './subject'

type StoryProps = React.ComponentProps<typeof CommentEditor>

const meta = {
  title: 'Recipes/CommentBox/CommentEditor/CommentEditor',
  component: CommentEditor,
  decorators: [
    (Story, ctx) => {
      const [, setArgs] = useArgs<typeof ctx.args>()
      const onChange = (body: string) => {
        setArgs({value: body})
      }
      return <Story args={{...ctx.args, onChange}} />
    },
  ],
} satisfies Meta<typeof CommentEditor>

const subject: CommentEditorSubject = {
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
} satisfies StoryProps

export default meta

export const Example: StoryObj = {args, name: 'CommentEditor'}
