import type {Meta} from '@storybook/react'
import {Link} from './Link'
import {AppContext} from './app-context'
import {createBrowserHistory} from './create-browser-history'
import {jsonRoute} from './JsonRoute'
import {MemoryRouter} from 'react-router-dom'

const args = {
  to: '/home',
  children: 'Example Link',
}

const meta = {
  title: 'Utilities/Link',
  component: Link,
  tags: ['autodocs'],
  argTypes: {
    to: {
      description:
        'The path to link to. If the path is matched by React Router, a soft navigation will be executed. If the path is a Rails route, a Turbo navigation will be performed. If the path is external, the page will reload performing a hard navigation',
    },
    children: {
      description: 'The link text',
    },
  },
  decorators: [
    Story => (
      <AppContext.Provider
        value={{
          history: createBrowserHistory(),
          routes: [jsonRoute({path: '/home', Component: ({children}: React.PropsWithChildren) => <>{children}</>})],
        }}
      >
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </AppContext.Provider>
    ),
  ],
} satisfies Meta<typeof Link>

export default meta

export const Example = {args}
