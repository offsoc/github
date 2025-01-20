import {Box, Button, theme, ThemeProvider} from '@primer/react'
import {screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {useRef, useState} from 'react'

import {SidePanel} from '../SidePanel'

type TestComponentSettings = {
  initialFocus?: 'button'
  callback?: () => void
}

const TestComponent = ({initialFocus, callback}: TestComponentSettings) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeIssueButtonRef = useRef<HTMLButtonElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const closeOverlay = () => {
    setIsOpen(false)
    if (callback) {
      callback()
    }
  }
  return (
    <ThemeProvider theme={theme}>
      <Box ref={anchorRef} sx={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}>
        <Button data-testid="open-side-panel-button" ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
          open side panel
        </Button>
        <Button>outside</Button>
        <SidePanel
          open={isOpen}
          onClose={closeOverlay}
          initialFocusRef={initialFocus === 'button' ? closeIssueButtonRef : undefined}
          returnFocusRef={buttonRef}
          width="400"
          aria-label="Test side panel"
        >
          <Box sx={{display: 'flex', flexDirection: 'column', p: 2}}>
            <span>test issue</span>
            <Button onClick={closeOverlay}>cancel</Button>
            <Button data-testid="close-issue-button" onClick={closeOverlay} ref={closeIssueButtonRef}>
              close issue
            </Button>
            <input data-testid="test-input" />
          </Box>
        </SidePanel>
      </Box>
    </ThemeProvider>
  )
}

describe('SidePanel', () => {
  it('does not render SidePanel when closed by default', async () => {
    render(<TestComponent initialFocus="button" />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('renders SidePanel when set to open', async () => {
    const {user} = render(<TestComponent initialFocus="button" />)
    await user.click(screen.getByTestId('open-side-panel-button'))
    await screen.findByText('close issue')
    const closeIssueButton = screen.getByTestId('close-issue-button')
    expect(closeIssueButton).toHaveFocus()
  })
  it('returns focus to returnFocusRef on close', async () => {
    const {user} = render(<TestComponent initialFocus="button" />)
    const openSidePanelButton = screen.getByTestId('open-side-panel-button')
    await user.click(openSidePanelButton)
    const closeIssueButton = screen.getByTestId('close-issue-button')
    expect(closeIssueButton).toHaveFocus()
    await user.click(closeIssueButton)
    // wait for transition animation to complete
    await waitFor(() => expect(openSidePanelButton).toHaveFocus())
  })
  it('focuses copilot textare when clicked', async () => {
    const {user} = render(
      <>
        <TestComponent initialFocus="button" />
        <textarea id="copilot-chat-textarea" data-testid="copilot-chat-textarea" />
      </>,
    )
    await user.click(screen.getByTestId('open-side-panel-button'))
    const textArea = screen.getByTestId('copilot-chat-textarea')
    await user.click(textArea)
    await waitFor(() => expect(textArea).toHaveFocus())
  })
  it('focuses copilot textare when keyboard shortcut pressed', async () => {
    const {user} = render(
      <>
        <TestComponent initialFocus="button" />
        <textarea id="copilot-chat-textarea" data-testid="copilot-chat-textarea" />
      </>,
    )
    await user.click(screen.getByTestId('open-side-panel-button'))
    const textArea = screen.getByTestId('copilot-chat-textarea')
    await user.keyboard('{Shift>}C{/Shift}')
    await waitFor(() => expect(textArea).toHaveFocus())
  })
  it('focuses copilot input when clicked', async () => {
    const {user} = render(
      <>
        <TestComponent initialFocus="button" />
        <input id="copilot-chat-topic-search" data-testid="copilot-chat-topic-search" />
      </>,
    )
    await user.click(screen.getByTestId('open-side-panel-button'))
    const input = screen.getByTestId('copilot-chat-topic-search')
    await user.click(input)
    await waitFor(() => expect(input).toHaveFocus())
  })
  it('focuses copilot input when keyboard shortcut pressed', async () => {
    const {user} = render(
      <>
        <TestComponent initialFocus="button" />
        <input id="copilot-chat-topic-search" data-testid="copilot-chat-topic-search" />
      </>,
    )
    await user.click(screen.getByTestId('open-side-panel-button'))
    const input = screen.getByTestId('copilot-chat-topic-search')
    await user.keyboard('{Shift>}C{/Shift}')
    await waitFor(() => expect(input).toHaveFocus())
  })
  it('does not focus the copilot input when keyboard shortcut pressed on input', async () => {
    const {user} = render(
      <>
        <TestComponent initialFocus="button" />
        <input id="copilot-chat-topic-search" data-testid="copilot-chat-topic-search" />
      </>,
    )
    await user.click(screen.getByTestId('open-side-panel-button'))
    const testInput = screen.getByTestId('copilot-chat-topic-search')
    testInput.focus()
    const input = screen.getByTestId('copilot-chat-topic-search')
    await user.keyboard('{Shift>}c{/Shift}')

    expect(input).not.toHaveFocus()
  })
})
