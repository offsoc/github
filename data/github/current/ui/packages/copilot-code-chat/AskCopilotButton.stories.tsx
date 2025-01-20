import type {Meta, StoryObj} from '@storybook/react'

import type {AskCopilotButtonProps} from './AskCopilotButton'
import {AskCopilotButton} from './AskCopilotButton'

const meta = {
  title: 'Apps/Copilot/BaseCopilotChatButton',
  component: AskCopilotButton,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof AskCopilotButton>

export default meta

const defaultArgs: AskCopilotButtonProps = {
  referenceType: 'file',
} as const

export const Standalone: StoryObj<AskCopilotButtonProps> = {
  args: {
    ...defaultArgs,
  },
  render: args => {
    return (
      <div>
        <AskCopilotButton {...args} />
      </div>
    )
  },
}
