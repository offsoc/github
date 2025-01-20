import type {Meta, StoryObj} from '@storybook/react'

import CopilotIconAnimation from './CopilotIconAnimation'

const meta = {
  title: 'Apps/Copilot/CopilotIconAnimation',
  component: CopilotIconAnimation,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof CopilotIconAnimation>

export default meta

export const Default: StoryObj<typeof CopilotIconAnimation> = {
  render: () => <CopilotIconAnimation />,
}
