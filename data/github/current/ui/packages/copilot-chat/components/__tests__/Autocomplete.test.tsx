import {setupUserEvent, Wrapper} from '@github-ui/react-core/test-utils'
import {Textarea} from '@primer/react'
import {render, screen} from '@testing-library/react'
import {useRef} from 'react'

import {getCopilotChatProviderProps, getMessageMock} from '../../test-utils/mock-data'
import type {CopilotChatMessage} from '../../utils/copilot-chat-types'
import {CopilotChatProvider} from '../../utils/CopilotChatContext'
import {Autocomplete} from '../Autocomplete'
import {MenuPortalContainer} from '../PortalContainerUtils'

const label = 'input for testing'
const agents = [
  {
    name: 'Blackbeard Agent',
    slug: 'blackbeard-agent',
    avatarUrl: 'https://avatars.githubusercontent.com/in/792513?s=60&u=abcc6a7b3b032cfbad72f642d3ffd438749f742f&v=4',
    integrationUrl: '/marketplace/blackbeard-agent',
  },
  {
    name: 'Stede Bonnet Agent',
    slug: 'stede-bonnet-agent',
    avatarUrl: 'https://avatars.githubusercontent.com/in/792513?s=60&u=abcc6a7b3b032cfbad72f642d3ffd438749f742f&v=4',
    integrationUrl: '/marketplace/stede-bonnet-agent',
  },
]
const blackbeardMessage = {
  ...getMessageMock(),
  role: 'assistant',
  references: [
    {
      type: 'github.agent',
      // id: 1,
      login: 'blackbeard-agent',
      avatarURL: 'https://avatars.githubusercontent.com/in/792513?s=60&u=abcc6a7b3b032cfbad72f642d3ffd438749f742f&v=4',
    },
  ],
} satisfies CopilotChatMessage

function AutocompleteTest({messages}: {messages?: CopilotChatMessage[]}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <CopilotChatProvider {...getCopilotChatProviderProps()} agents={agents} messages={messages}>
      <Wrapper>
        <MenuPortalContainer />
        <Autocomplete textAreaRef={textAreaRef}>
          <Textarea aria-label={label} ref={textAreaRef} />
        </Autocomplete>
      </Wrapper>
    </CopilotChatProvider>
  )
}

describe('Autocomplete', () => {
  it('shows suggestions when triggered', async () => {
    const user = setupUserEvent()
    render(<AutocompleteTest />)

    const input = screen.getByLabelText(label)
    await user.type(input, '@')

    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeVisible()
    expect(screen.getByText('Blackbeard Agent')).toBeVisible()
    expect(screen.getByText('Stede Bonnet Agent')).toBeVisible()
  })

  it("doesn't show suggestions when @ is not the first character", async () => {
    const user = setupUserEvent()
    render(<AutocompleteTest />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    expect(input).not.toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.queryByText('Blackbeard Agent')).toBeNull()
    expect(screen.queryByText('Stede Bonnet Agent')).toBeNull()
  })

  it('only suggests the previously-mentioned agent', async () => {
    const user = setupUserEvent()
    render(<AutocompleteTest messages={[blackbeardMessage]} />)

    const input = screen.getByLabelText(label)
    await user.type(input, '@')

    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeVisible()
    expect(screen.getByText('Blackbeard Agent')).toBeVisible()
    expect(screen.queryByText('Stede Bonnet Agent')).toBeNull()
    expect(screen.getByText('You’re limited to one agent per thread.')).toBeVisible()
  })
})
