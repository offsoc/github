import type {Meta, StoryObj} from '@storybook/react'
import {ErrorBanner} from './ErrorBanner'

const meta: Meta<typeof ErrorBanner> = {
  title: 'Apps/Billing/common/ErrorBanner',
  component: ErrorBanner,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof ErrorBanner>

export const Default: Story = {
  render: () => <ErrorBanner message="This is the error message we want to display" />,
}
