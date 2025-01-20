import type {Meta, StoryObj} from '@storybook/react'

import {CompactCommentButton} from './CompactCommentButton'

const meta: Meta<typeof CompactCommentButton> = {
  title: 'Recipes/CommentBox/CompactCommentButton',
  component: CompactCommentButton,
}

type Story = StoryObj<typeof CompactCommentButton>

export const Count: Story = {
  render: () => <CompactCommentButton onClick={() => alert('clicked')}>Write a comment…</CompactCommentButton>,
}

export default meta
