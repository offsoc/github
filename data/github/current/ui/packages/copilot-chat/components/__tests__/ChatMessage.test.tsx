import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {getCopilotChatProviderProps, getDefaultReducerState, getReferencesMock} from '../../test-utils/mock-data'
import type {GitHubAgentReference} from '../../utils/copilot-chat-types'
import {CopilotChatContext, CopilotChatProvider} from '../../utils/CopilotChatContext'
import {ChatMessage} from '../ChatMessage'

test('Uses the user as the author for any non-assistant message', () => {
  const props = getCopilotChatProviderProps()
  render(
    <CopilotChatProvider {...props} topic={undefined} threadId="2" mode="immersive">
      <ChatMessage
        message={{
          id: '12',
          role: 'user',
          intent: 'ask-docs',
          createdAt: '2020-01-01T00:00:00Z',
          threadID: '12',
          references: getReferencesMock(),
          content: 'foo[2], bar[4]',
        }}
      />
    </CopilotChatProvider>,
  )

  const authorNameEl = screen.getByTestId('chat-message-author-name', {exact: false})
  expect(authorNameEl).toBeInTheDocument()
  expect(authorNameEl.textContent).toBe(props.login)
})

test('Uses the github.agent reference as the author', () => {
  const agentRef = {
    type: 'github.agent',
    login: 'octocat-agent',
    avatarURL: 'https://github.com/octocat-agent.png',
  } as GitHubAgentReference

  render(
    <CopilotChatProvider {...getCopilotChatProviderProps()} topic={undefined} threadId="2" mode="immersive">
      <ChatMessage
        message={{
          id: '12',
          role: 'assistant',
          intent: 'ask-docs',
          createdAt: '2020-01-01T00:00:00Z',
          threadID: '12',
          references: [agentRef],
          content: 'foo[2], bar[4]',
        }}
      />
    </CopilotChatProvider>,
  )

  const authorNameEl = screen.getByTestId('chat-message-author-name', {exact: false})
  expect(authorNameEl).toBeInTheDocument()
  expect(authorNameEl.textContent).toBe(agentRef.login)
})

test('Uses Copilot as the author for assistant messages without an agent', () => {
  render(
    <CopilotChatProvider {...getCopilotChatProviderProps()} topic={undefined} threadId="2" mode="immersive">
      <ChatMessage
        message={{
          id: '12',
          role: 'assistant',
          intent: 'ask-docs',
          createdAt: '2020-01-01T00:00:00Z',
          threadID: '12',
          references: [],
          content: 'foo[2], bar[4]',
        }}
      />
    </CopilotChatProvider>,
  )

  const authorNameEl = screen.getByTestId('chat-message-author-name', {exact: false})
  expect(authorNameEl).toBeInTheDocument()
  expect(authorNameEl.textContent).toBe('Copilot')
})

test('Renders a flash when a message is interrupted', () => {
  render(
    <CopilotChatProvider {...getCopilotChatProviderProps()} topic={undefined} threadId="2" mode="immersive">
      <ChatMessage
        message={{
          id: '12',
          role: 'assistant',
          intent: 'ask-docs',
          createdAt: '2020-01-01T00:00:00Z',
          threadID: '12',
          references: [],
          content: 'symbols are',
          interrupted: true,
        }}
      />
    </CopilotChatProvider>,
  )

  const flash = screen.getByTestId('chat-message-interrupted')

  expect(flash).toBeInTheDocument()
  expect(flash.textContent).toBe('Copilot was interrupted before it could finish this message.')
})

test('Renders a confirmation dialog when a function call requires confirmation', () => {
  render(
    <CopilotChatProvider {...getCopilotChatProviderProps()} topic={undefined} threadId="2" mode="immersive">
      <CopilotChatContext.Provider
        value={{
          ...getDefaultReducerState('2', undefined, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          allClientConfirmations: [
            '["indexrepo",true,"{\\"repo\\":\\"repo:monalisa/smile\\",\\"indexCode\\":true,\\"indexDocs\\":false}"]',
          ],
        }}
      >
        <ChatMessage
          message={{
            id: '12',
            role: 'assistant',
            intent: 'ask-docs',
            createdAt: '2020-01-01T00:00:00Z',
            threadID: '12',
            references: [],
            content: 'symbols are',
            interrupted: true,
            confirmations: [
              {
                title: 'Repo index required',
                message: 'Do you want to index this repo?',
                confirmation: {
                  arguments: '{"repo":"repo:monalisa/illuminati","indexCode":true,"indexDocs":false}',
                  emitFnCall: true,
                  name: 'indexrepo',
                },
              },
              {
                title: 'Authorize me',
                message: 'Do you want grant me full permission?',
                confirmation: {
                  arguments: '{"repo":"repo:monalisa/smile","indexCode":true,"indexDocs":false}',
                  emitFnCall: true,
                  name: 'indexrepo',
                },
              },
            ],
          }}
        />
      </CopilotChatContext.Provider>
    </CopilotChatProvider>,
  )

  const confirmationDialog = screen.getByRole('heading', {name: 'Repo index required', level: 3})
  expect(confirmationDialog).toBeInTheDocument()
  const confirmationMessage = screen.getByText('Do you want to index this repo?')
  expect(confirmationMessage).toBeInTheDocument()

  const acceptedConfirmationDialog = screen.getByRole('heading', {name: 'Authorize me', level: 3})
  expect(acceptedConfirmationDialog).toBeInTheDocument()
  const acceptedConfirmationMessage = screen.getByText('Do you want grant me full permission?')
  expect(acceptedConfirmationMessage).toBeInTheDocument()

  expect(screen.getAllByRole('button', {name: 'Allow'})).toHaveLength(1)
  expect(screen.getAllByRole('button', {name: 'Dismiss'})).toHaveLength(1)
})

test('Renders a user status when client confirmations exist', () => {
  const props = getCopilotChatProviderProps()

  render(
    <CopilotChatProvider {...props} topic={undefined} threadId="2" mode="immersive">
      <ChatMessage
        message={{
          id: '12',
          role: 'user',
          intent: 'ask-docs',
          createdAt: '2020-01-01T00:00:00Z',
          threadID: '12',
          references: [],
          content: 'symbols are',
          interrupted: true,
          clientConfirmations: [
            {
              state: 'accepted',
              confirmation: {
                arguments: '{"repo":"repo:monalisa/smile","indexCode":true,"indexDocs":false}',
                emitFnCall: true,
                name: 'indexrepo',
              },
            },
          ],
        }}
      />
    </CopilotChatProvider>,
  )

  const clientConfirmationStatus = screen.getByRole('heading', {
    name: /currentUserLogin accepted the action/i,
    level: 2,
  })
  expect(clientConfirmationStatus).toBeInTheDocument()
})
