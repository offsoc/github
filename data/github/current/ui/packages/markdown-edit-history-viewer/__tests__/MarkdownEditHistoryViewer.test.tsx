import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {act, render, screen} from '@testing-library/react'

import {LABELS} from '../constants/labels'
import {
  createEdit,
  createEdits,
  queueHistoryQueryMock,
  setupEnvironment,
  TestComponent,
} from '../test-utils/MarkdownEditHistoryViewerTestComponent'

test('renders basic edit history viewer', async () => {
  const {environment} = createRelayMockEnvironment()
  render(<TestComponent environment={environment} />)

  await act(async () => setupEnvironment(environment))

  // Click on the edited button
  const editedButton = screen.getByRole('button', {name: LABELS.editHistory.ariaLabel})
  expect(editedButton).toBeInTheDocument()

  queueHistoryQueryMock(environment, createEdits(3))

  act(() => {
    editedButton.click()
  })

  expect(await screen.findByText('Edited 2 times')).toBeInTheDocument()
})

test('renders correct trailing labels', async () => {
  const {environment} = createRelayMockEnvironment()
  render(<TestComponent environment={environment} />)

  await act(async () => setupEnvironment(environment))

  // Click on the edited button
  const editedButton = screen.getByRole('button', {name: LABELS.editHistory.ariaLabel})
  expect(editedButton).toBeInTheDocument()

  const edits = [
    createEdit({editNumber: 0}),
    createEdit({editNumber: 1, deletedAt: new Date(2022)}),
    createEdit({editNumber: 2}),
  ]

  queueHistoryQueryMock(environment, edits)

  act(() => {
    editedButton.click()
  })

  expect(screen.getByText('Edited 2 times')).toBeInTheDocument()
  expect(screen.getByText('Most recent')).toBeInTheDocument()
  expect(screen.getByText('Deleted')).toBeInTheDocument()
})
