import '../../test-utils/mocks'

import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {getCopilotTaskRoutePayload} from '../../test-utils/mock-data'
import {TestComponentWrapper} from '../../test-utils/TestComponentWrapper'
import {CommitPanel} from '../CommitPanel'

function TestComponent() {
  return (
    <TestComponentWrapper>
      <CommitPanel
        dialogState="pending"
        fileStatuses={{}}
        setDialogState={() => {}}
        onClose={() => {}}
        commitButtonRef={{current: null}}
      />
    </TestComponentWrapper>
  )
}

describe('CommitPanel', () => {
  test('renders commit panel', () => {
    const routePayload = getCopilotTaskRoutePayload()
    render(<TestComponent />, {routePayload})

    expect(screen.getByRole('button', {name: 'Commit changes'})).toBeVisible()
    expect(screen.getByText('Commit message')).toBeVisible()
    expect(screen.getByText('Extended description')).toBeVisible()
    expect(screen.getByText('Cancel')).toBeVisible()
    expect(screen.getByText('Reset all changes')).toBeVisible()
  })

  test('renders an appropriate commit message', () => {
    const routePayload = getCopilotTaskRoutePayload()
    render(<TestComponent />, {routePayload})

    const commitMessageInput: HTMLInputElement = screen.getByLabelText('Commit message')

    // Renders with default commit message
    expect(commitMessageInput.value).toBe('Updates from editor')

    // Simulate a user deleting the default commit message in order to write their own.
    // This empty string should not be overwritten
    fireEvent.change(commitMessageInput, {target: {value: ''}})
    expect(commitMessageInput.value).toBe('')

    fireEvent.change(commitMessageInput, {target: {value: 'My custom commit message'}})
    expect(commitMessageInput.value).toBe('My custom commit message')
  })
})
