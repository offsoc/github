import {render} from '@github-ui/react-core/test-utils'
import {CopyIcon, GitPullRequestIcon, IssueOpenedIcon, PencilIcon} from '@primer/octicons-react'
import {ActionList as PrimerActionList, IconButton, Link} from '@primer/react'
import {screen, within} from '@testing-library/react'

import {SelectionProvider} from '../../ListView/SelectionContext'
import {ListItemActionBar, type ListItemActionBarProps} from '../ActionBar'

// Flakey test! See https://github.com/github/web-systems/issues/2277 for more information
// https://github.com/github/github/actions/runs/10155262786/job/28081774880
// https://github.com/github/github/actions/runs/10120206211/job/27989682031
// eslint-disable-next-line jest/no-disabled-tests
it.skip('renders', async () => {
  const {user} = renderListItemSecondaryActions()

  const container = await screen.findByTestId('list-view-item-action-bar-container')
  const toggleButton = within(container).getByRole('button', {name: 'More list item action bar'})
  expect(toggleButton).toHaveAttribute('aria-haspopup', 'true')
  expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
  const icon = within(toggleButton).getByRole('img', {hidden: true})
  expect(icon).toHaveClass('octicon-kebab-horizontal')
  expect(screen.queryByRole('menu')).toBeNull()

  await user.click(toggleButton)

  expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
  const menu = screen.getByRole('menu')
  expect(within(menu).queryByRole('group')).toBeNull()
  const menuItems = within(menu).getAllByRole('menuitem')
  expect(menuItems).toHaveLength(3)
  expect(menuItems[0]).toHaveTextContent('Foo')
  expect(menuItems[1]).toHaveTextContent('Bar')
  expect(menuItems[2]).toHaveTextContent('Baz')
})

it('renders with custom label', async () => {
  renderListItemSecondaryActions({label: 'sample action bar'})

  const container = await screen.findByTestId('list-view-item-action-bar-container')
  const toggleButton = within(container).getByRole('button', {name: 'More sample action bar'})
  expect(toggleButton).toHaveAttribute('aria-haspopup', 'true')
  expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
})

it('supports a different icon for the button', async () => {
  renderListItemSecondaryActions({anchorIcon: PencilIcon})

  const container = await screen.findByTestId('list-view-item-action-bar-container')
  const toggleButton = within(container).getByRole('button', {name: 'More list item action bar'})
  const icon = within(toggleButton).getByRole('img', {hidden: true})
  expect(icon).toHaveClass('octicon-pencil')
})

it('supports custom styles for the ActionBar', async () => {
  renderListItemSecondaryActions({style: {color: 'blue'}})

  const container = await screen.findByTestId('list-view-item-action-bar-container')
  expect(container).toHaveStyle('color: blue')
})

type RenderListItemSecondaryActionsProps = {selectedCount?: number; isSelectable?: boolean} & ListItemActionBarProps

function renderListItemSecondaryActions({
  selectedCount = 0,
  isSelectable = false,
  ...args
}: RenderListItemSecondaryActionsProps = {}) {
  return render(
    <SelectionProvider isSelectable={isSelectable} selectedCount={selectedCount} countOnPage={1}>
      <ListItemActionBar
        {...args}
        staticMenuActions={[
          {
            key: 'foo',
            render: () => <PrimerActionList.Item>Foo</PrimerActionList.Item>,
          },
          {
            key: 'bar',
            render: () => <PrimerActionList.Item>Bar</PrimerActionList.Item>,
          },
          {
            key: 'baz',
            render: () => <PrimerActionList.Item>Baz</PrimerActionList.Item>,
          },
        ]}
        actions={[
          {
            key: 'navigate-to-code',
            render: isOverflowMenu => {
              return isOverflowMenu ? (
                <PrimerActionList.Item>
                  <PrimerActionList.LeadingVisual>
                    <PencilIcon />
                  </PrimerActionList.LeadingVisual>
                  Navigate to Issue #72
                </PrimerActionList.Item>
              ) : (
                <Link muted aria-label="Navigate to Issue #72" href="#">
                  <IssueOpenedIcon /> {1}
                </Link>
              )
            },
          },
          {
            key: 'navigate-to-pr',
            render: isOverflowMenu => {
              return isOverflowMenu ? (
                <PrimerActionList.Item>
                  <PrimerActionList.LeadingVisual>
                    <PencilIcon />
                  </PrimerActionList.LeadingVisual>
                  Navigate to PR #12345
                </PrimerActionList.Item>
              ) : (
                <Link muted aria-label="Navigate to PR #12345" href="foo/bar">
                  <GitPullRequestIcon /> {1}
                </Link>
              )
            },
          },
          {
            key: 'copy-sha',
            render: isOverflowMenu => {
              return isOverflowMenu ? (
                <PrimerActionList.Item>Copy full SHA</PrimerActionList.Item>
              ) : (
                <IconButton size="small" icon={CopyIcon} variant="invisible" aria-label={`Copy full SHA for 3dd0ffe`} />
              )
            },
          },
        ]}
      />
    </SelectionProvider>,
  )
}
