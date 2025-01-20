import type {Meta, StoryObj} from '@storybook/react'
import {MemoryRouter, Routes, Route} from 'react-router-dom'

import {default as UsageCardComponent} from './UsageCard'
import {RequestState, UsageCardVariant, UsagePeriod} from '../../../enums'
import {MOCK_REPO_LINE_ITEMS} from '../../../test-utils/mock-data'

const meta: Meta<typeof UsageCardComponent> = {
  title: 'Apps/Billing',
  component: UsageCardComponent,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof UsageCardComponent>

export const UsageCard: Story = {
  render: args => <UsageCardComponent {...args} />,
  args: {
    usage: MOCK_REPO_LINE_ITEMS,
    variant: UsageCardVariant.ORG,
    requestState: RequestState.IDLE,
    usagePeriod: UsagePeriod.THIS_MONTH,
    otherUsage: [],
  },
  decorators: [
    Story => (
      <MemoryRouter initialEntries={['/enterprises/foo']}>
        <Routes>
          <Route path="/enterprises/:business" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
}
