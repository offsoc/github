import {act, render, screen} from '@testing-library/react'
import {noop} from '@github-ui/noop'
import {type ReactNode, Suspense} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {ThemeProvider} from '@primer/react'
import {IssueConversationLock} from '../IssueConversationLock'
import {commitLockLockableMutation} from '../../../mutations/lock-lockable-mutation'

const TestWrapper = ({environment, children}: {environment: RelayMockEnvironment; children: ReactNode}) => (
  <ThemeProvider>
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading">{children}</Suspense>
    </RelayEnvironmentProvider>
  </ThemeProvider>
)

jest.mock('../../../mutations/lock-lockable-mutation', () => ({
  commitLockLockableMutation: jest.fn(),
}))

test('issue lock conversation dialog is rendered for an unlocked issue', () => {
  const environment = createMockEnvironment()

  render(
    <TestWrapper environment={environment}>
      <IssueConversationLock issueId="" isUnlocked={true} onClose={noop} />
    </TestWrapper>,
  )

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getAllByText('Lock conversation')).toHaveLength(1)
  expect(screen.getAllByText('Reason')).toHaveLength(1)
  expect(
    screen
      .getByRole('dialog')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('a[href="https://docs.github.com/articles/what-are-the-different-access-permissions"]'),
  ).toBeTruthy()
  expect(screen.getByText('Cancel')).toBeInTheDocument()

  // Expect all reason to be present
  expect(screen.getByLabelText('No reason')).toBeInTheDocument()
  expect(screen.getByLabelText('Spam')).toBeInTheDocument()
  expect(screen.getByLabelText('Off-topic')).toBeInTheDocument()
  expect(screen.getByLabelText('Too heated')).toBeInTheDocument()
  expect(screen.getByLabelText('Resolved')).toBeInTheDocument()

  // Expect correct values to be present
  const radioButtons = screen.queryAllByRole('radio').map(radio => radio.getAttribute('value'))
  expect(radioButtons.sort()).toEqual(['', 'OFF_TOPIC', 'RESOLVED', 'SPAM', 'TOO_HEATED'])
})

test('issue lock conversation dialog is rendered for a locked issue', () => {
  const environment = createMockEnvironment()

  render(
    <TestWrapper environment={environment}>
      <IssueConversationLock issueId="" isUnlocked={false} onClose={noop} />
    </TestWrapper>,
  )

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getAllByText('Unlock conversation')).toHaveLength(1)
  expect(
    screen.getByText(
      'Everyone will be able to comment on this issue once more. You can always lock this issue again in the future.',
    ),
  ).toBeInTheDocument()
})

test('call mutation when clicking Lock conversation button', () => {
  const environment = createMockEnvironment()

  render(
    <TestWrapper environment={environment}>
      <IssueConversationLock issueId="" onClose={noop} />
    </TestWrapper>,
  )

  const lockButton = screen.getByRole('button', {name: 'Lock conversation'})

  act(() => {
    lockButton.click()
  })

  expect(commitLockLockableMutation).toHaveBeenCalledTimes(1)
})
