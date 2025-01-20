import type {Meta} from '@storybook/react'
import {Assignees, type AssigneesProps} from './Assignees'

const meta = {
  title: 'IssuesComponents/Assignees',
  component: Assignees,
} satisfies Meta<typeof Assignees>

export default meta

const defaultArgs: Partial<AssigneesProps> = {
  assignees: [
    {
      login: 'monalisa',
      name: 'Mona Lisa',
      id: '1',
      avatarUrl: '',
      ' $fragmentType': 'AssigneePickerAssignee',
    },
  ],
}

export const AssigneesExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: AssigneesProps) => <Assignees {...args} />,
}
