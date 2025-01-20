import type {Meta, StoryObj} from '@storybook/react'

import {AlphaLabel, type AlphaLabelProps} from './AlphaLabel'

export default {
  title: 'Recipes/LifecycleLabels/AlphaLabel',
  component: AlphaLabel,
} satisfies Meta<typeof AlphaLabel>

export const Default: StoryObj<AlphaLabelProps> = {
  args: {},
  render: args => <AlphaLabel {...args} />,
}

export const WithFeedbackLink: StoryObj<AlphaLabelProps> = {
  ...Default,
  args: {
    feedbackUrl: 'https://example.com',
  },
}

export const OverrideLabelText: StoryObj<AlphaLabelProps> = {
  ...Default,
  args: {
    children: 'Code view alpha',
  },
}
