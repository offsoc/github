import type {Meta, StoryObj} from '@storybook/react'

import {ChatWithCopilotHeader, type ChatWithCopilotHeaderProps} from './ChatWithCopilotHeader'

const meta = {
  title: 'Apps/Copilot/ChatWithCopilotHeader',
  component: ChatWithCopilotHeader,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof ChatWithCopilotHeader>

export default meta

const defaultArgs: ChatWithCopilotHeaderProps = {
  mode: 'immersive',
}

export const Standalone: StoryObj<ChatWithCopilotHeaderProps> = {
  args: {
    ...defaultArgs,
  },
  render: args => <ChatWithCopilotHeader {...args} />,
}
