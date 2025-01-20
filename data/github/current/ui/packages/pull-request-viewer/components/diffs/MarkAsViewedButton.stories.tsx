import type {Meta, StoryObj} from '@storybook/react'

import {MarkAsViewedButton as MarkAsViewedButtonComponent} from './MarkAsViewedButton'

const meta: Meta<typeof MarkAsViewedButtonComponent> = {
  title: 'Apps/React Shared/Pull Requests/MarkAsViewedButton',
  component: MarkAsViewedButtonComponent,
  argTypes: {
    isViewed: {
      control: 'boolean',
    },
  },
}

type Story = StoryObj<typeof MarkAsViewedButtonComponent>

export const MarkAsViewedButton: Story = {
  args: {
    isViewed: false,
    toggleViewed: () => {},
  },
}

export default meta
