import type {Meta, StoryObj} from '@storybook/react'

import {DeprecatedLabel, type DeprecatedLabelProps} from './DeprecatedLabel'

export default {
  title: 'Recipes/LifecycleLabels/DeprecatedLabel',
  component: DeprecatedLabel,
} satisfies Meta<typeof DeprecatedLabel>

export const Default: StoryObj<DeprecatedLabelProps> = {
  args: {},
  render: args => <DeprecatedLabel {...args} />,
}

export const WithDocsLink: StoryObj<DeprecatedLabelProps> = {
  ...Default,
  args: {
    docsUrl: 'https://example.com',
  },
}

export const OverrideLabelText: StoryObj<DeprecatedLabelProps> = {
  ...Default,
  args: {
    children: 'Projects (classic) is deprecated',
  },
}
