import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'
import {createRef} from 'react'

import {getCopilotChatProviderProps} from '../../test-utils/mock-data'
import type {CopilotChatMessage} from '../../utils/copilot-chat-types'
import {CopilotChatProvider} from '../../utils/CopilotChatContext'
import {ChatMessageProvider} from '../ChatMessageContext'
import {Feedback} from '../Feedback'

const mockMessage: CopilotChatMessage = {
  role: 'assistant',
  id: '12',
  content: 'test completion',
  createdAt: '2020-01-01T00:00:00Z',
  references: [],
  threadID: '2',
}

test('Renders feedback dialog when optedIntoUserFeedback is true', () => {
  render(
    <CopilotChatProvider
      {...getCopilotChatProviderProps()}
      optedInToUserFeedback={true}
      topic={undefined}
      threadId="2"
      mode="immersive"
    >
      <ChatMessageProvider message={mockMessage}>
        <Feedback returnFocusRef={createRef<HTMLDivElement>()} />
      </ChatMessageProvider>
    </CopilotChatProvider>,
  )

  const button = screen.queryByTestId('feedback-negative-button')
  expect(button).toBeInTheDocument()

  fireEvent.click(button!)

  const feedbackDialog = screen.queryByTestId('feedback-dialog')
  expect(feedbackDialog).toBeInTheDocument()
})

test('Does not render feedback dialog when optedIntoUserFeedback is false', () => {
  render(
    <CopilotChatProvider
      {...getCopilotChatProviderProps()}
      optedInToUserFeedback={false}
      topic={undefined}
      threadId="2"
      mode="immersive"
    >
      <ChatMessageProvider message={mockMessage}>
        <Feedback returnFocusRef={createRef<HTMLDivElement>()} />
      </ChatMessageProvider>
    </CopilotChatProvider>,
  )

  const button = screen.queryByTestId('feedback-negative-button')
  expect(button).toBeInTheDocument()

  fireEvent.click(button!)

  const feedbackDialog = screen.queryByTestId('feedback-dialog')
  expect(feedbackDialog).not.toBeInTheDocument()
})
