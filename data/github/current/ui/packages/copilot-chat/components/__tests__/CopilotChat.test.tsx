import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, within} from '@testing-library/react'

import {CopilotChat} from '../../CopilotChat'
import {getCopilotChatProps} from '../../test-utils/mock-data'

beforeEach(() => {
  // We utilize service workers to fuzy search references in Copilot Chat
  // when they are not available we show a warning to the user.
  // Workers are not available in JSDOM so we need to mock the console.warn.
  jest.spyOn(console, 'warn').mockImplementation()
})

test('Renders the CopilotChat', () => {
  const props = getCopilotChatProps()

  render(<CopilotChat {...props} />)

  const button = screen.getByTestId('copilot-chat-button')
  expect(button).toBeInTheDocument()
  fireEvent.click(button)

  expect(screen.getByTestId('copilot-chat-panel-inner')).toBeInTheDocument()
})

test('Renders the popover CTA when renderPopover is true', () => {
  const props = getCopilotChatProps()

  render(<CopilotChat {...props} renderPopover={true} />)

  // look for the popover CTA
  const popover = screen.getByTestId('copilot-chat-cta-popover')
  expect(popover).toBeVisible()

  expect(within(popover).getByRole('button', {name: 'Got it!'})).toBeVisible()
})

test('Does not render the popover CTA when renderPopover is false', () => {
  const props = getCopilotChatProps()

  render(<CopilotChat {...props} renderPopover={false} />)

  // look for the popover CTA
  const popover = screen.queryByTestId('copilot-chat-cta-popover')
  expect(popover).not.toBeVisible()
})
