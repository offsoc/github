import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {ActionList, ActionMenu, SelectPanel} from '@primer/react'
import {act, screen, within} from '@testing-library/react'
import {createRef, useState} from 'react'

import {ActionBar} from '../src/ActionBar'

jest.useFakeTimers()

const resizeObservers = new Map<
  ResizeObserver,
  {
    entries: Set<ResizeObserverEntry>
    callback: ResizeObserverCallback
  }
>()

window.ResizeObserver = class ResizeObserverMock {
  constructor(callback: ResizeObserverCallback) {
    resizeObservers.set(this, {
      entries: new Set<ResizeObserverEntry>(),
      callback,
    })
  }
  observe = jest.fn().mockImplementation(entry => {
    resizeObservers.get(this)?.entries.add(entry)
  })
  disconnect = jest.fn().mockImplementation(() => {
    resizeObservers.delete(this)
  })
  unobserve = jest.fn().mockImplementation(entry => {
    resizeObservers.get(this)?.entries.delete(entry)
  })
}

afterEach(() => {
  resizeObservers.clear()
  jest.clearAllMocks()
})

function stubElementWidth(width: number, el: HTMLElement) {
  el.getBoundingClientRect = jest.fn().mockReturnValue({width} as DOMRect)
  jest.spyOn(el, 'offsetWidth', 'get').mockImplementation(() => width)
  act(() => {
    for (const [observer, {entries, callback}] of resizeObservers) {
      callback(Array.from(entries), observer)
    }
  })
}

it('renders with visible action item that moves to overflow menu when screen shrinks', async () => {
  const onSelect = jest.fn()

  const {user} = render(
    <ActionBar
      label="My favorite controls"
      actions={[
        {
          key: 'edit',
          render: isOverflowMenu =>
            isOverflowMenu ? (
              <ActionList.Item onSelect={onSelect}>Edit</ActionList.Item>
            ) : (
              <button onClick={onSelect}>Edit</button>
            ),
        },
      ]}
    />,
  )

  const container = screen.getByTestId('action-bar-container')
  expect(container).toBeInTheDocument()
  expect(container).toHaveAttribute('role', 'toolbar')
  expect(container).toHaveAccessibleName('My favorite controls')
  const actionBar = within(container).getByTestId('action-bar')
  const item = within(actionBar).getByTestId('action-bar-item-edit')
  const button = within(item).getByRole('button')
  expect(button).toHaveTextContent('Edit')

  // Expect overflow menu to not be present
  expect(within(container).queryByLabelText('More My favorite controls')).toBeNull()
  expect(screen.queryByRole('menu')).toBeNull()

  // Verify onSelect fires for action item when it's displayed normally
  await user.click(button)
  expect(onSelect).toHaveBeenCalledTimes(1)

  stubElementWidth(50, actionBar) // Stub an initial width so `previousBarWidth` gets calculated
  stubElementWidth(30, container) // Shrink the container so the item can no longer fit within it

  // Verify item no longer on the page and overflow menu is now available
  expect(within(actionBar).queryByTestId('action-bar-item-edit')).toBeNull()
  const overflowMenuToggleButton = within(container).getByLabelText('More My favorite controls')
  expect(within(overflowMenuToggleButton).getByRole('img', {hidden: true})).toHaveClass('octicon-kebab-horizontal')
  expect(screen.queryByRole('menu')).toBeNull()

  await user.click(overflowMenuToggleButton) // open overflow menu

  const overflowMenu = screen.getByRole('menu')
  const overflowMenuItems = within(overflowMenu).getAllByRole('menuitem')
  expect(overflowMenuItems).toHaveLength(1)
  expect(overflowMenuItems[0]).toHaveTextContent('Edit')

  // Verify onSelect fires for action item when it's shown in the overflow menu
  await user.click(overflowMenuItems[0]!)
  expect(onSelect).toHaveBeenCalledTimes(2)
})

it('overflow menu always shows if staticMenuActions items are defined', async () => {
  const onSelect = jest.fn()

  const {user} = render(
    <ActionBar
      label="My favorite controls"
      actions={[
        {
          key: 'edit',
          render: isOverflowMenu =>
            isOverflowMenu ? (
              <ActionList.Item onSelect={onSelect}>Edit</ActionList.Item>
            ) : (
              <button onClick={onSelect}>Edit</button>
            ),
        },
      ]}
      staticMenuActions={[
        {
          key: 'delete',
          render: () => <ActionList.Item onSelect={onSelect}>Delete</ActionList.Item>,
        },
      ]}
    />,
  )

  const container = screen.getByTestId('action-bar-container')
  expect(container).toBeInTheDocument()

  const overflowMenuToggleButton = within(container).getByLabelText('More My favorite controls')
  await user.click(overflowMenuToggleButton) // open overflow menu

  //Check that the Delete item is always in the overflow menu
  const overflowMenu = screen.getByRole('menu')
  const overflowMenuItems = within(overflowMenu).getAllByRole('menuitem')
  expect(overflowMenuItems).toHaveLength(1)
  expect(overflowMenuItems[0]).toHaveTextContent('Delete')
})

it('allows opening nested menu from overflow menu item', async () => {
  const {user} = render(
    <ActionBar
      label="Issue tools"
      actions={[
        {
          key: 'mark-as',
          render: isOverflowMenu => (
            <ActionMenu>
              {isOverflowMenu ? (
                <ActionMenu.Anchor>
                  <ActionList.Item>Mark as...</ActionList.Item>
                </ActionMenu.Anchor>
              ) : (
                <ActionMenu.Button>Mark as...</ActionMenu.Button>
              )}
              <ActionMenu.Overlay>
                <ActionList>
                  <ActionList.Item>Open</ActionList.Item>
                  <ActionList.Item>Closed</ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          ),
        },
      ]}
    />,
  )

  const container = screen.getByTestId('action-bar-container')
  expect(container).toBeInTheDocument()
  expect(container).toHaveAttribute('role', 'toolbar')
  expect(container).toHaveAccessibleName('Issue tools')
  const actionBar = within(container).getByTestId('action-bar')
  expect(screen.queryByRole('menu')).toBeNull() // Verify no menus are shown

  stubElementWidth(50, actionBar) // Stub an initial width so `previousBarWidth` gets calculated

  const markAsButton = within(within(actionBar).getByTestId('action-bar-item-mark-as')).getByRole('button')
  expect(markAsButton).toHaveTextContent('Mark as...')

  await user.click(markAsButton) // open the standalone 'Mark as...' menu

  const markAsMenu = screen.getByRole('menu')
  const markAsMenuItems = within(markAsMenu).getAllByRole('menuitem')
  expect(markAsMenuItems).toHaveLength(2)
  expect(markAsMenuItems[0]).toHaveTextContent('Open')
  expect(markAsMenuItems[1]).toHaveTextContent('Closed')

  stubElementWidth(30, container) // Shrink the container so the item can no longer fit within it

  const overflowMenuToggleButton = within(container).getByLabelText('More Issue tools')

  await user.click(overflowMenuToggleButton) // open action bar overflow menu

  const overflowMenu = screen.getByRole('menu', {name: 'More Issue tools'})
  const overflowMenuItem = within(overflowMenu).getByRole('menuitem')
  expect(overflowMenuItem).toHaveTextContent('Mark as...')

  await user.click(overflowMenuItem) // open the nested 'Mark as...' menu

  const nestedMarkAsMenu = screen.getByRole('menu', {name: 'Mark as...'})

  const nestedMarkAsMenuItems = within(nestedMarkAsMenu).getAllByRole('menuitem')
  expect(nestedMarkAsMenuItems).toHaveLength(2)
  expect(nestedMarkAsMenuItems[0]).toHaveTextContent('Open')
  expect(nestedMarkAsMenuItems[1]).toHaveTextContent('Closed')
})

const testSelectPanelItems = [{text: 'bug'}, {text: 'duplicate'}]
const TestSelectPanel = ({isOverflowMenu}: {isOverflowMenu: boolean}) => {
  const [open, setOpen] = useState(false)
  return (
    <SelectPanel
      open={open}
      onOpenChange={setOpen}
      title="Select labels"
      items={testSelectPanelItems}
      selected={[]}
      onSelectedChange={noop}
      onFilterChange={noop}
      renderAnchor={
        isOverflowMenu
          ? props => (
              <ActionList.Item {...props} role="menuitem">
                Set label
              </ActionList.Item>
            )
          : undefined
      }
    />
  )
}

it('allows opening nested select panel from overflow menu item', async () => {
  const {user} = render(
    <ActionBar
      label="Issue and pull request controls"
      actions={[
        {
          key: 'apply-labels',
          render: isOverflowMenu => <TestSelectPanel isOverflowMenu={isOverflowMenu} />,
        },
      ]}
    />,
  )

  const container = screen.getByTestId('action-bar-container')
  expect(container).toBeInTheDocument()
  expect(container).toHaveAttribute('role', 'toolbar')
  expect(container).toHaveAccessibleName('Issue and pull request controls')
  const actionBar = within(container).getByTestId('action-bar')
  expect(screen.queryByRole('menu')).toBeNull() // Verify no menus are shown

  stubElementWidth(50, actionBar) // Stub an initial width so `previousBarWidth` gets calculated

  const setLabelButton = within(within(actionBar).getByTestId('action-bar-item-apply-labels')).getByRole('button')
  await user.click(setLabelButton) // open the standalone 'Set label' menu

  const applyLabelSelectPanel = screen.getByRole('dialog')
  const applyLabelSelectPanelOptions = within(applyLabelSelectPanel).getAllByRole('option')
  expect(applyLabelSelectPanelOptions).toHaveLength(2)
  expect(applyLabelSelectPanelOptions[0]).toHaveTextContent('bug')
  expect(applyLabelSelectPanelOptions[1]).toHaveTextContent('duplicate')

  stubElementWidth(30, container) // Shrink the container so the item can no longer fit within it

  const overflowMenuToggleButton = within(container).getByLabelText('More Issue and pull request controls')

  await user.click(overflowMenuToggleButton) // open action bar overflow menu

  const overflowMenu = screen.getByRole('menu', {name: 'More Issue and pull request controls'})
  const overflowMenuItem = within(overflowMenu).getByRole('menuitem')
  expect(overflowMenuItem).toHaveTextContent('Set label')

  await user.click(overflowMenuItem) // open the nested 'Set label' select panel

  const nestedApplyLabelSelectPanelDialog = screen.getByRole('dialog', {name: 'Select labels'})
  const nestedApplyLabelSelectPanel = within(nestedApplyLabelSelectPanelDialog).getByRole('listbox')

  const nestedApplyLabelSelectPanelOptions = within(nestedApplyLabelSelectPanel).getAllByRole('option')
  expect(nestedApplyLabelSelectPanelOptions).toHaveLength(2)
  expect(nestedApplyLabelSelectPanelOptions[0]).toHaveTextContent('bug')
  expect(nestedApplyLabelSelectPanelOptions[1]).toHaveTextContent('duplicate')
})

/**
 * It's important for accessibility purposes that the actionbar have specific keyboard behavior when it's used as a
 * toolbar and to behave like a standard list when it's in the menu. (should only support tab based navigation)
 */
it('should disable custom toolbar keyboard behavior when variant is set to menu', async () => {
  const onSelect = jest.fn()

  const {user} = render(
    <ActionBar
      label="My favorite controls"
      variant="menu"
      actions={[
        {
          key: 'edit',
          render: isOverflowMenu =>
            isOverflowMenu ? (
              <ActionList.Item onSelect={onSelect}>Edit</ActionList.Item>
            ) : (
              <button onClick={onSelect}>Edit</button>
            ),
        },
        {
          key: 'delete',
          render: isOverflowMenu =>
            isOverflowMenu ? (
              <ActionList.Item onSelect={onSelect}>Delete</ActionList.Item>
            ) : (
              <button onClick={onSelect}>Delete</button>
            ),
        },
      ]}
    />,
  )

  const container = screen.getByTestId('action-bar-container')
  expect(container).not.toHaveAttribute('aria-label')
  expect(container).toBeInTheDocument()
  expect(container).not.toHaveAttribute('role', 'toolbar')

  const editButton = within(container).getByRole('button', {name: 'Edit'})
  const deleteButton = within(container).getByRole('button', {name: 'Delete'})
  editButton.focus()
  // Fire a right arrow event on the edit button
  await user.keyboard('{ArrowRight}')
  // edit button should still have focus, since it's not a toolbar variant
  expect(editButton).toHaveFocus()
  expect(deleteButton).not.toHaveFocus()
})

/**
 * It's important for accessibility purposes that the actionbar have specific keyboard behavior when it's used as a
 * toolbar and to behave like a standard list when it's in the menu. (should only support tab based navigation)
 */
it('should enable custom toolbar keyboard behavior when variant is set to toolbar', async () => {
  const onSelect = jest.fn()

  const {user} = render(
    <ActionBar
      label="My favorite controls"
      variant="toolbar"
      actions={[
        {
          key: 'edit',
          render: isOverflowMenu =>
            isOverflowMenu ? (
              <ActionList.Item onSelect={onSelect}>Edit</ActionList.Item>
            ) : (
              <button onClick={onSelect}>Edit</button>
            ),
        },
        {
          key: 'delete',
          render: isOverflowMenu =>
            isOverflowMenu ? (
              <ActionList.Item onSelect={onSelect}>Delete</ActionList.Item>
            ) : (
              <button onClick={onSelect}>Delete</button>
            ),
        },
      ]}
    />,
  )

  const container = screen.getByTestId('action-bar-container')
  expect(container).toBeInTheDocument()
  expect(container).toHaveAttribute('role', 'toolbar')
  expect(container).toHaveAttribute('aria-label')

  const editButton = within(container).getByRole('button', {name: 'Edit'})
  const deleteButton = within(container).getByRole('button', {name: 'Delete'})
  editButton.focus()
  // Fire a right arrow event on the edit button
  await user.keyboard('{ArrowRight}')
  // edit button should not have focus, focus should have been moved to the delete button
  expect(editButton).not.toHaveFocus()
  expect(deleteButton).toHaveFocus()
})

it('attaches a ref to the anchor Icon of the Actionbars action menu', () => {
  const myRef = createRef<HTMLDivElement>()

  render(
    <ActionBar
      label="My favorite controls"
      variant="menu"
      anchorRef={myRef}
      staticMenuActions={[
        {
          key: 'foo',
          render: () => <ActionList.Item>Foo</ActionList.Item>,
        },
      ]}
    />,
  )

  expect(myRef.current).not.toBeNull()
  expect(myRef.current?.tagName).toEqual('BUTTON')
})
