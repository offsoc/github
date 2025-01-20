import type {Meta, StoryObj} from '@storybook/react'
import {AppContext} from '@github-ui/react-core/app-context'
import {MemoryRouter, Routes, Route} from 'react-router-dom'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'

import {default as WelcomeBannerComponent} from './WelcomeBanner'

const meta: Meta<typeof WelcomeBannerComponent> = {
  title: 'Apps/Billing/WelcomeBanner',
  component: WelcomeBannerComponent,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof WelcomeBannerComponent>

export const NotMultiTenant: Story = {
  render: args => <WelcomeBannerComponent {...args} />,
  args: {
    multiTenant: false,
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

export const MultiTenant: Story = {
  render: args => <WelcomeBannerComponent {...args} />,
  args: {
    multiTenant: true,
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
