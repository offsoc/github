import type {Meta, StoryObj} from '@storybook/react'

import {AllShortcutsEnabled} from '../AllShortcutsEnabled'
import {AllShortcutsEnabledProvider} from '../../contexts/AllShortcutsEnabledContext'

const meta = {
  title: 'Apps/Code View Shared/AllShortcutsEnabled',
  component: AllShortcutsEnabled,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof AllShortcutsEnabled>

export default meta

const defaultArgs = {
  allShortcutsEnabled: true,
}

type Story = StoryObj<typeof AllShortcutsEnabled>

export const Default: Story = {
  render: () => (
    <AllShortcutsEnabledProvider allShortcutsEnabled={defaultArgs.allShortcutsEnabled}>
      <AllShortcutsEnabled>Content</AllShortcutsEnabled>
    </AllShortcutsEnabledProvider>
  ),
}
