import type {Meta, StoryObj} from '@storybook/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

import {default as UsageFiltersComponent} from './UsageFilters'
import {DEFAULT_FILTERS, PERIOD_SELECTIONS, GROUP_SELECTIONS, GITHUB_INC_CUSTOMER} from '../../test-utils/mock-data'

const meta: Meta<typeof UsageFiltersComponent> = {
  title: 'Apps/Billing',
  component: UsageFiltersComponent,
  argTypes: {},
}

function RelayStoryComponent({children}: {children: React.ReactNode}) {
  const environment = createMockEnvironment()

  return <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>
}
export default meta
type Story = StoryObj<typeof UsageFiltersComponent>

export const UsageFilters: Story = {
  render: args => <UsageFiltersComponent {...args} />,
  args: {
    customer: GITHUB_INC_CUSTOMER,
    setFilters: () => {},
    groupSelections: GROUP_SELECTIONS,
    periodSelections: PERIOD_SELECTIONS,
    filters: DEFAULT_FILTERS,
    showSearch: true,
  },
  decorators: [
    Story => (
      <RelayStoryComponent>
        <Story />
      </RelayStoryComponent>
    ),
  ],
}
