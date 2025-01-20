import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {ExpandFileTreeButton} from '../components/ExpandFileTreeButton'

const onToggleExpanded = jest.fn()

test('Renders ExpandFileTreeButton expanded', async () => {
  render(
    <ExpandFileTreeButton
      onToggleExpanded={onToggleExpanded}
      expanded={true}
      ariaControls="tree-id"
      textAreaId="text-area-id"
    />,
  )
  expect(screen.getByRole('button', {name: 'Collapse file tree'}).getAttribute('aria-expanded')).toBe('true')
})

test('Renders ExpandFileTreeButton collapsed', async () => {
  render(
    <ExpandFileTreeButton
      onToggleExpanded={onToggleExpanded}
      expanded={false}
      ariaControls="tree-id"
      textAreaId="text-area-id"
    />,
  )
  expect(screen.getByRole('button', {name: 'Expand file tree'}).getAttribute('aria-expanded')).toBe('false')
})

test('toggles when clicked', async () => {
  render(
    <ExpandFileTreeButton
      onToggleExpanded={onToggleExpanded}
      expanded={true}
      ariaControls="tree-id"
      textAreaId="text-area-id"
    />,
  )
  fireEvent.click(screen.getByRole('button', {name: 'Collapse file tree'}))
  expect(onToggleExpanded).toHaveBeenCalled()
})

test('shows the Files button', async () => {
  render(
    <ExpandFileTreeButton
      onToggleExpanded={onToggleExpanded}
      expanded={false}
      ariaControls="tree-id"
      textAreaId="text-area-id"
    />,
  )
  expect(screen.getByText('Files')).toBeInTheDocument()
})
