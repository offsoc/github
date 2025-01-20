import type {Meta, StoryObj} from '@storybook/react'

import {DiffStats} from './DiffStats'

const meta: Meta<typeof DiffStats> = {
  title: 'Diffs/DiffStats',
  component: DiffStats,
}

type Story = StoryObj<typeof DiffStats>

export const Default: Story = {
  render: () => <DiffStats linesAdded={42} linesChanged={99} linesDeleted={55} />,
}

export default meta
