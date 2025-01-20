import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CopilotActionsChatButton} from '../CopilotActionsChatButton'
import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'

jest.mock('@github-ui/copilot-chat/utils/copilot-chat-events', () => ({
  publishOpenCopilotChat: jest.fn(),
}))

afterEach(() => {
  jest.clearAllMocks()
})

test('renders the CopilotActionsChatButton', () => {
  render(<CopilotActionsChatButton />)
  expect(screen.getByText('Suggest a fix')).toBeInTheDocument()
})

test('publishes an event when clicked', () => {
  render(<CopilotActionsChatButton />)
  fireEvent.click(screen.getByText('Suggest a fix'))
  expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1)
})

test('publishes an event when an action menu item is chosen', () => {
  render(<CopilotActionsChatButton />)
  fireEvent.click(screen.getAllByLabelText('Ask Copilot about these logs')[0]!)
  fireEvent.click(screen.getByText('Explain error'))
  expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1)
})
