import {MenuPortalContainer} from '@github-ui/copilot-chat/components/PortalContainerUtils'
import {CopilotChatProvider} from '@github-ui/copilot-chat/CopilotChatContext'
import {getCopilotChatProviderProps} from '@github-ui/copilot-chat/test-utils/mock-data'
import {AppContext} from '@github-ui/react-core/app-context'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {Box} from '@primer/react'
import type {Meta} from '@storybook/react'
import {MemoryRouter} from 'react-router-dom'

import type {ThreadHeaderMenuProps} from './ThreadHeaderMenu'
import {ThreadHeaderMenu} from './ThreadHeaderMenu'

const meta = {
  title: 'Copilot/ThreadHeaderMenu',
  component: ThreadHeaderMenu,
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
} satisfies Meta<typeof ThreadHeaderMenu>

export default meta

const defaultArgs: ThreadHeaderMenuProps = {
  setShowExperimentsDialog: () => {},
}

export const ThreadHeaderMenuExample = {
  args: {
    ...defaultArgs,
  },
  render: (props: ThreadHeaderMenuProps) => {
    return (
      <AppContext.Provider value={{routes: [], history: createBrowserHistory()}}>
        <CopilotChatProvider {...getCopilotChatProviderProps()}>
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 4}}>
            <ThreadHeaderMenu setShowExperimentsDialog={props.setShowExperimentsDialog} />
          </Box>
          <MenuPortalContainer />
        </CopilotChatProvider>
      </AppContext.Provider>
    )
  },
}
