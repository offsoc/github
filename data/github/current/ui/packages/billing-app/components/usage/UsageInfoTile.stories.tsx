import type {Meta, StoryObj} from '@storybook/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

import {default as UsageInfoTileComponent, UsageInfoTileVariant} from './UsageInfoTile'

const meta: Meta<typeof UsageInfoTileComponent> = {
  title: 'Apps/Billing',
  component: UsageInfoTileComponent,
  argTypes: {},
}

function RelayStoryComponent({children}: {children: React.ReactNode}) {
  const environment = createMockEnvironment()

  return <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>
}
export default meta
type Story = StoryObj<typeof UsageInfoTileComponent>

export const UsageInfoTile: Story = {
  render: args => <UsageInfoTileComponent {...args} />,
  args: {
    productName: 'product',
    variant: UsageInfoTileVariant.quantityUsed,
    totalSpendOrSeats: 20,
  },
  decorators: [
    Story => (
      <RelayStoryComponent>
        <Story />
      </RelayStoryComponent>
    ),
  ],
}
