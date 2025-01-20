import type {Meta, StoryObj} from '@storybook/react'

import {BetaLabel, type BetaLabelProps} from './BetaLabel'

export default {
  title: 'Recipes/LifecycleLabels/BetaLabel',
  component: BetaLabel,
} satisfies Meta<typeof BetaLabel>

export const Default: StoryObj<BetaLabelProps> = {
  args: {},
  render: args => <BetaLabel {...args} />,
}

export const WithFeedbackLink: StoryObj<BetaLabelProps> = {
  ...Default,
  args: {
    feedbackUrl: 'https://example.com',
  },
}

export const OverrideLabelText: StoryObj<BetaLabelProps> = {
  ...Default,
  args: {
    children: 'Code view beta',
  },
}
