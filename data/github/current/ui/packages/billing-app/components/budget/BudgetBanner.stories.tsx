import type {Meta, StoryObj} from '@storybook/react'
import {AppContext} from '@github-ui/react-core/app-context'
import {MemoryRouter, Routes, Route} from 'react-router-dom'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'

import {default as BudgetBannerComponent} from './BudgetBanner'

const meta: Meta<typeof BudgetBannerComponent> = {
  title: 'Apps/Billing',
  component: BudgetBannerComponent,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof BudgetBannerComponent>

export const BudgetBanner: Story = {
  render: args => <BudgetBannerComponent {...args} />,
  args: {
    budgetAlertDetail: {
      text: "You've used 75% of your enterprise budget.",
      variant: 'warning',
      dismissible: false,
      dismiss_link: '',
      budget_id: 'test-budget-id',
    },
  },
  decorators: [
    Story => (
      <AppContext.Provider
        value={{
          routes: [],
          history: createBrowserHistory(),
        }}
      >
        <MemoryRouter initialEntries={['/enterprises/foo']}>
          <Routes>
            <Route path="/enterprises/:business" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>
    ),
  ],
}
