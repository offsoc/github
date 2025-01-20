import type {Meta} from '@storybook/react'

import type {CopilotBadgeProps} from './CopilotBadge'
import CopilotBadge from './CopilotBadge'

const meta = {
  title: 'Apps/Copilot/CopilotBadge',
  component: CopilotBadge,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof CopilotBadge>

export default meta

const loadingArgs: CopilotBadgeProps = {
  isLoading: true,
  isError: false,
  hasUnreadMessages: false,
  zIndex: 1,
}

const errorArgs: CopilotBadgeProps = {
  isLoading: false,
  isError: true,
  hasUnreadMessages: false,
  zIndex: 1,
}

const unreadArgs: CopilotBadgeProps = {
  isLoading: false,
  isError: false,
  hasUnreadMessages: true,
  zIndex: 1,
}

export const Loading = {
  args: {
    ...loadingArgs,
  },
  render: (args: CopilotBadgeProps) => {
    return (
      <div>
        <CopilotBadge {...args} />
      </div>
    )
  },
}

export const error = {
  args: {
    ...errorArgs,
  },
  render: (args: CopilotBadgeProps) => {
    return (
      <div>
        <CopilotBadge {...args} />
      </div>
    )
  },
}

export const unread = {
  args: {
    ...unreadArgs,
  },
  render: (args: CopilotBadgeProps) => {
    return (
      <div>
        <CopilotBadge {...args} />
      </div>
    )
  },
}
