import type {Meta, StoryObj} from '@storybook/react'

import {DiffPlaceholder as DiffPlaceholderComponent} from './DiffPlaceholder'

const meta: Meta<typeof DiffPlaceholderComponent> = {
  title: 'Diffs/DiffPlaceholder',
  component: DiffPlaceholderComponent,
}

type Story = StoryObj<typeof DiffPlaceholderComponent>

export const DiffPlaceholder: Story = {
  render: () => <DiffPlaceholderComponent />,
}

export default meta
