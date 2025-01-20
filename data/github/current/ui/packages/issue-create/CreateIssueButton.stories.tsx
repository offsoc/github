import type {Meta, StoryObj} from '@storybook/react'
import {CreateIssueButton, type CreateIssueButtonProps} from './CreateIssueButton'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

const meta = {
  title: 'IssueCreate',
  component: CreateIssueButton,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    size: {control: 'inline-radio', options: ['small', 'medium']},
  },
} satisfies Meta<typeof CreateIssueButton>

export default meta
type Story = StoryObj<typeof CreateIssueButton>

const defaultArgs: Partial<CreateIssueButtonProps> = {
  label: 'Create issue',
}

function RelayStoryComponent({children}: {children: React.ReactNode}) {
  const environment = createMockEnvironment()

  return <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>
}

export const CreateIssueButtonExample: Story = {
  args: {
    ...defaultArgs,
  },
  decorators: [
    Story => (
      <RelayStoryComponent>
        <Story />
      </RelayStoryComponent>
    ),
  ],
}
