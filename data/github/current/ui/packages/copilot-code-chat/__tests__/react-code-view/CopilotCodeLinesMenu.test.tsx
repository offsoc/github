import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import CopilotCodeLinesMenu from '../../code-view/CopilotCodeLinesMenu'
import {getSnippetReferenceMock} from '@github-ui/copilot-chat/test-utils/mock-data'
import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'

jest.mock('@github-ui/react-core/use-feature-flag')
jest.mock('@github-ui/copilot-chat/utils/copilot-chat-events', () => {
  return {
    ...jest.requireActual('@github-ui/copilot-chat/utils/copilot-chat-events'),
    publishOpenCopilotChat: jest.fn(),
  }
})

beforeEach(() => {
  ;(publishOpenCopilotChat as jest.Mock).mockClear()
})

test('Renders the CopilotChatButton', () => {
  render(<CopilotCodeLinesMenu copilotAccessAllowed={true} messageReference={getSnippetReferenceMock()} />)
  expect(screen.queryAllByLabelText('Copilot menu').length).toEqual(1)
})

test('Renders nothing when access is disabled', () => {
  render(<CopilotCodeLinesMenu copilotAccessAllowed={false} messageReference={getSnippetReferenceMock()} />)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('Opens the CopilotChatButton menu on enter', async () => {
  const {user} = render(
    <CopilotCodeLinesMenu copilotAccessAllowed={true} messageReference={getSnippetReferenceMock()} />,
  )
  fireEvent.click(screen.queryAllByLabelText('Copilot menu')[0]!)
  const item = screen.getByLabelText('Explain')
  fireEvent.focus(item)
  await user.keyboard('{enter}')
  expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1)
})

test('Opens the CopilotChatButton menu on click', async () => {
  const {user} = render(
    <CopilotCodeLinesMenu copilotAccessAllowed={true} messageReference={getSnippetReferenceMock()} />,
  )
  fireEvent.click(screen.queryAllByLabelText('Copilot menu')[0]!)
  const item = screen.getByLabelText('Explain')
  await user.click(item)
  expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1)
})
