import type {Meta, StoryObj} from '@storybook/react'
import {default as CostCenterBanner} from './CostCenterBanner'

const meta: Meta<typeof CostCenterBanner> = {
  title: 'Apps/Billing/cost_centers/CostCenterBanner',
  component: CostCenterBanner,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof CostCenterBanner>

export const Default: Story = {
  render: () => <CostCenterBanner />,
}
