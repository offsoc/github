import type {Meta} from '@storybook/react'
import {CreateIssueButtonLoading, type CreateIssueButtonLoadingProps} from './CreateIssueButtonLoading'

const meta = {
  title: 'IssueCreate',
  component: CreateIssueButtonLoading,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    label: {control: 'text', defaultValue: 'Create issue'},
    size: {control: 'inline-radio', options: ['small', 'medium']},
  },
} satisfies Meta<typeof CreateIssueButtonLoading>

export default meta

const defaultArgs: Partial<CreateIssueButtonLoadingProps> = {
  label: 'Create issue',
}

export const CreateIssueButtonLoadingExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: CreateIssueButtonLoadingProps) => <CreateIssueButtonLoading {...args} />,
}
