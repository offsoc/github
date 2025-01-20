import {noop} from '@github-ui/noop'
import type {Meta} from '@storybook/react'

import {IssueBodyEditor, type IssueBodyEditorProps} from './IssueBodyEditor'

const meta = {
  title: 'IssueBodyEditor',
  component: IssueBodyEditor,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof IssueBodyEditor>

export default meta

const defaultArgs: Partial<IssueBodyEditorProps> = {
  subjectId: '123',
  subject: {
    type: 'project',
  },
  body: 'Message goes here',
  bodyIsStale: false,
  onChange: noop,
  onCancel: noop,
  onCommit: noop,
}

export const IssueBodyEditorExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: IssueBodyEditorProps) => <IssueBodyEditor {...args} />,
}
