import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

import {MarkAs} from '../MarkAs'

test('renders a menu with options for marking selected issues', async () => {
  const {user} = renderMarkAs()

  const button = screen.getByTestId('mark-as-action-menu-button')
  expect(button).toBeInTheDocument()
  expect(button.textContent).toBe('Mark as')

  expect(screen.queryByTestId('mark-as-action-menu-list')).not.toBeInTheDocument()

  await user.click(button)

  const list = screen.getByTestId('mark-as-action-menu-list')
  expect(list).toBeInTheDocument()

  const listItems = within(list).getAllByRole('menuitem')
  expect(listItems.length).toBe(3)
  expect(listItems[0]).toHaveTextContent('Open')
  expect(listItems[0]).toHaveAttribute('aria-keyshortcuts', 'o')
  expect(listItems[1]).toHaveTextContent('Completed')
  expect(listItems[1]).toHaveAttribute('aria-keyshortcuts', 'c')
  expect(listItems[2]).toHaveTextContent('Not planned')
  expect(listItems[2]).toHaveAttribute('aria-keyshortcuts', 'n')
})

const renderMarkAs = () => {
  const environment = createMockEnvironment()
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <MarkAs
        useQueryForAction={false}
        disabled={false}
        singleKeyShortcutsEnabled={false}
        issuesToActOn={['issue1', 'issue2']}
      />
    </RelayEnvironmentProvider>,
  )
}
