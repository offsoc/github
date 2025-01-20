import type {Meta, StoryObj} from '@storybook/react'

import {CommitsBlankState, type CommitsBlankStateProps} from './CommitsBlankState'

const meta = {
  title: 'Apps/Commits/Shared/CommitsBlankState',
  component: CommitsBlankState,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof CommitsBlankState>

export default meta

type Story = StoryObj<typeof CommitsBlankState>

export const Timeout: Story = {
  args: {
    timeoutMessage: 'git log my-cool-feature',
  },
  render: (args: CommitsBlankStateProps) => <CommitsBlankState {...args} />,
}

export const UnavailableDefaultMessage: Story = {
  args: {
    timeoutMessage: '',
  },
  render: (args: CommitsBlankStateProps) => <CommitsBlankState {...args} />,
}

export const UnavailableCustomMessage: Story = {
  args: {
    timeoutMessage: '',
    unavailableMessage: 'Nothing to see here',
  },
  render: (args: CommitsBlankStateProps) => <CommitsBlankState {...args} />,
}
