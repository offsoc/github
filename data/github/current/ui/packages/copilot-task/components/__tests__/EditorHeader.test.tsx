import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react' // Import the necessary dependencies
import {useRef} from 'react'

import {getCopilotTaskRoutePayload} from '../../test-utils/mock-data'
import {EditorHeader} from '../EditorHeader'

function TestComponent() {
  const terminalHeaderButtonRef = useRef<HTMLButtonElement>(null)
  return (
    <EditorHeader
      path="path/to/file"
      isDeleted={false}
      onSaveFileName={() => {}}
      onTerminalClick={() => {}}
      isTreeExpanded={false}
      terminalHeaderButtonRef={terminalHeaderButtonRef}
      treeToggleElement={<div />}
    />
  )
}

test('renders header', () => {
  render(<TestComponent />, {
    pathname: '/owner/repo/pull/1/edit/path/to/file',
    routePayload: getCopilotTaskRoutePayload(),
  })

  expect(screen.getByText('path/to/file')).toBeVisible()
  expect(screen.getByLabelText('More file options')).toBeVisible()
})

test('edit header focus management', async () => {
  const {user} = render(<TestComponent />, {
    pathname: '/owner/repo/pull/1/edit/path/to/file',
    routePayload: getCopilotTaskRoutePayload(),
  })

  const editHeader = screen.getByLabelText('More file options')
  await user.click(editHeader)
  await user.click(screen.getByText('Rename'))
  expect(screen.getByPlaceholderText('Name your file...')).toHaveFocus()

  await user.click(screen.getByText('Cancel'))
  expect(screen.getByLabelText('More file options')).toHaveFocus()
})
