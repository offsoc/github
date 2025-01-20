import {Wrapper} from '@github-ui/react-core/test-utils'
import {Box} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {getCopilotChatProviderProps, getMessageMock} from '../test-utils/mock-data'
import {CopilotChatProvider} from '../utils/CopilotChatContext'
import {ChatMessage, type ChatMessageProps} from './ChatMessage'

const meta = {
  title: 'Apps/Copilot/ChatMessage',
  component: ChatMessage,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof ChatMessage>

export default meta

const defaultArgs: Partial<ChatMessageProps> = {}

const Container = (props: {children: React.ReactNode}) => (
  <CopilotChatProvider {...getCopilotChatProviderProps()}>
    <Wrapper>
      <Box sx={{maxWidth: '500px'}}>{props.children}</Box>
    </Wrapper>
  </CopilotChatProvider>
)

export const Default: StoryObj<ChatMessageProps> = {
  args: {
    ...defaultArgs,
    message: getMessageMock(),
  },
  render: (args: ChatMessageProps) => {
    return (
      <Container>
        <ChatMessage {...args} />
      </Container>
    )
  },
}

export const AgentUnauthorizedError: StoryObj<ChatMessageProps> = {
  args: {
    ...defaultArgs,
    message: {
      ...getMessageMock(),
      role: 'assistant',
      content: undefined,
      error: {
        type: 'agentUnauthorized',
        isError: true,
        message: 'Agent is unauthorized',
        details: {
          // eslint-disable-next-line camelcase
          authorize_url: 'https://bing.com',
          // eslint-disable-next-line camelcase
          client_id: 'foo',
          name: 'PagerDuty',
          // eslint-disable-next-line camelcase
          avatar_url:
            'http://github.localhost:80/github/blackbird-parser/assets/2/0e87bdb7-842b-4903-89a7-bfc288b82411',
          slug: 'PagerDuty',
          description: 'This is the PagerDuty thing',
        },
      },
    },
  },
  render: (args: ChatMessageProps) => {
    return (
      <Container>
        <ChatMessage {...args} />
      </Container>
    )
  },
}
