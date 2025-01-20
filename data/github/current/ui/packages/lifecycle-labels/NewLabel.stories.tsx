import type {Meta, StoryObj} from '@storybook/react'

import {NewLabel, type NewLabelProps} from './NewLabel'

export default {
  title: 'Recipes/LifecycleLabels/NewLabel',
  component: NewLabel,
} satisfies Meta<typeof NewLabel>

export const Default: StoryObj<NewLabelProps> = {
  args: {},
  render: args => <NewLabel {...args} />,
}

export const WithFeedbackLink: StoryObj<NewLabelProps> = {
  ...Default,
  args: {
    feedbackUrl: 'https://example.com',
  },
}

export const OverrideLabelText: StoryObj<NewLabelProps> = {
  ...Default,
  args: {
    children: 'New issues viewer',
  },
}
