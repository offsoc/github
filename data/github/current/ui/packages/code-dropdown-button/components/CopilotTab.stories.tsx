import type {Meta} from '@storybook/react'
import {CopilotTab, type CopilotTabProps} from './CopilotTab'
import {testCodeButtonPayload} from '../__tests__/test-helpers'

const meta = {
  title: 'Recipes/CopilotTab',
  component: CopilotTab,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof CopilotTab>

export default meta

const defaultArgs: CopilotTabProps = {
  ...testCodeButtonPayload.copilot,
}

export const CopilotTabExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: CopilotTabProps) => <CopilotTab {...args} />,
}
