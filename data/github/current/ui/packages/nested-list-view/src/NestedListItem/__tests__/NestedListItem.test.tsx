import {act, screen, within} from '@testing-library/react'
import type {UserEvent} from 'user-event-14'

import {NestedListViewCompletionPill} from '../../CompletionPill'
import {NestedListItemLeadingBadge} from '../LeadingBadge'
import {NestedListItemLeadingContent} from '../LeadingContent'
import {NestedListItemLeadingVisual} from '../LeadingVisual'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'
import {NestedListItemTrailingBadge} from '../TrailingBadge'
import {renderNestedListItem} from './helpers'

describe('NestedListItem', () => {
  describe('keyboard navigation', () => {
    it('should trigger primary action on Enter keypress', async () => {
      const primaryAction = jest.fn()
      const title = <NestedListItemTitle value="with action" onClick={primaryAction} />
      const {user} = renderNestedListItem({title, listArgs: {isSelectable: false}})

      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!
      act(() => firstItem.focus())

      await user.keyboard('{Enter}')

      expect(primaryAction).toHaveBeenCalled()
    })
    it('should open primary action in a new tab on Enter keypress with modifier keys', async () => {
      const {user} = renderNestedListItem({
        title: <NestedListItemTitle value="My item title" href="http://example.com" />,
      })

      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!

      const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => null)

      act(() => firstItem.focus())
      await user.keyboard('{Control>}{Enter}{/Control}')

      expect(mockWindowOpen).toHaveBeenCalledWith('http://example.com', '_blank')
    })
    it('should toggle selection when selection is enabled and a {Space} key is pressed', async () => {
      const onItemSelect = jest.fn()
      const {user} = renderNestedListItem({onSelect: onItemSelect, listArgs: {isSelectable: true}})

      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!
      act(() => firstItem.focus())

      await user.keyboard(' ')

      expect(onItemSelect).toHaveBeenCalled()
    })
    it('should trigger the primary action when selection is disabled and a {Space} key is pressed', async () => {
      const primaryAction = jest.fn()
      const title = <NestedListItemTitle value="with action" onClick={primaryAction} />
      const {user} = renderNestedListItem({title, listArgs: {isSelectable: false}})

      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!
      act(() => firstItem.focus())

      await user.keyboard(' ')

      expect(primaryAction).toHaveBeenCalled()
    })
  })

  describe('controls dialog', () => {
    const renderWithMetadata = () => renderNestedListItem({subItemsCount: 1, metadata: <button>Metadata</button>})

    const openFirstItemDialog = async (user: UserEvent) => {
      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!
      act(() => firstItem.focus())

      await user.keyboard('{Control>}{Shift>}U{/Shift}{/Control}')

      return screen.getByRole('dialog', {name: 'Manage item'})
    }

    it('displays a Control hint to the user when the list item has keyboard focus', () => {
      renderWithMetadata()

      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!
      act(() => firstItem.focus())
      expect(within(firstItem).getByText('Manage this item')).toBeInTheDocument()
    })

    it('opens a dialog when the keyboard shortcut of "Ctrl + Shift + U" is entered', async () => {
      const {user} = renderWithMetadata()

      const dialog = await openFirstItemDialog(user)
      expect(dialog).toBeVisible()
    })

    it('does not render treeitem role in the dialog', async () => {
      const {user} = renderWithMetadata()

      const dialog = await openFirstItemDialog(user)

      expect(within(dialog).queryByRole('treeitem')).not.toBeInTheDocument()
    })

    it('returns focus to the item upon closing the dialog', async () => {
      const {user} = renderWithMetadata()

      await openFirstItemDialog(user)
      await user.keyboard('{Escape}')

      expect(screen.getAllByRole('treeitem')[0]).toHaveFocus()
    })
  })

  it('should correctly set the aria-label when various combinations of type/title/selectable/status are set', () => {
    const leadingBadge = 'we are'
    const title = 'all in this together'
    const status = 'and it shows'
    renderNestedListItem({
      title: (
        <NestedListItemTitle
          value={title}
          leadingBadge={<NestedListItemLeadingBadge title={leadingBadge} />}
          trailingBadges={[
            <NestedListViewCompletionPill key={0} progress={{total: 5, completed: 2, percentCompleted: 40}} />,
            <NestedListItemTrailingBadge key={1} title="enhancement" />,
          ]}
        />
      ),
      secondaryActions: <p>hello</p>,
      metadata: <p>hello</p>,
      children: (
        <NestedListItemLeadingContent>
          <NestedListItemLeadingVisual description={status} />
        </NestedListItemLeadingContent>
      ),
    })

    const item = screen.getByRole('treeitem')
    expect(item).toHaveAccessibleName(
      `${leadingBadge}: ${title}: ${status}. 2 of 5 list items completed. Press Control, Shift, U for more actions.`,
    )
  })

  it('disable drag and drop when isReadOnly=true', () => {
    renderNestedListItem({
      listArgs: {
        isReadOnly: true,
      },
      title: <NestedListItemTitle value={'this is a read only item'} />,
    })

    const triggers = screen.queryAllByTestId('sortable-trigger')
    expect(triggers).toHaveLength(0)
  })
})

describe('NestedListItem sub items', () => {
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    // eslint-disable-next-line no-console
    originalConsoleError = console.error
    // eslint-disable-next-line no-console
    console.error = jest.fn()
  })

  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = originalConsoleError
    jest.restoreAllMocks()
  })

  it('should not show the expand icon when neither subItemsCount or subItems prop is set', () => {
    const {container} = renderNestedListItem({})

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    expect(container.querySelector('.PRIVATE_TreeView-item-toggle')).not.toBeInTheDocument()
  })

  it('should show expand icon when the subItemsCount is more than zero', () => {
    const {container} = renderNestedListItem({subItemsCount: 1})

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    expect(container.querySelector('.PRIVATE_TreeView-item-toggle')).toBeInTheDocument()
  })

  it('should show expand icon when subItemsCount is zero and subItems is an empty array', () => {
    const {container} = renderNestedListItem({subItemsCount: 0, subItems: []})

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    expect(container.querySelector('.PRIVATE_TreeView-item-toggle')).toBeInTheDocument()
  })

  it('should show expand icon when subItems are present', () => {
    const {container} = renderNestedListItem({
      subItems: [<NestedListItem key="0" title={<NestedListItemTitle value={'my list item title'} />} />],
    })

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    expect(container.querySelector('.PRIVATE_TreeView-item-toggle')).toBeInTheDocument()
  })

  it('should load sub items properly when the user clicks on the expand icon', async () => {
    const loadSubItemsMock = jest.fn()
    const {user, container} = renderNestedListItem({
      subItemsCount: 1,
      loadSubItems: loadSubItemsMock,
    })

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const expandIcon = container.querySelector('.PRIVATE_TreeView-item-toggle svg')
    await user.click(expandIcon!)

    // should show the item when its done loading the data
    expect(loadSubItemsMock).toHaveBeenCalled()
  })

  it('should show inline error when sub items fail to load', () => {
    const mockError = 'An intentional error occurred in the test'
    renderNestedListItem({
      subItemsCount: 1,
      throwError: mockError,
    })

    expect(screen.getByText(mockError)).toBeInTheDocument()
    expect(screen.getByText('There was an issue loading Sub issues')).toBeInTheDocument()
  })
})
