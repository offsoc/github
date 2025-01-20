import type {User} from '@github-ui/react-core/test-utils'
import {iterateFocusableElements} from '@primer/behaviors/utils'
import {act, screen, within} from '@testing-library/react'
import type {PropsWithChildren} from 'react'

import {renderListView} from './helpers'

const tabThroughSubElements = async (user: User, element: HTMLElement) => {
  // find all the children that are focusable
  let focusableElementCount = [...iterateFocusableElements(element, {strict: true})].length
  // tab through all the focusable elements
  while (focusableElementCount > 0) {
    await user.tab()
    focusableElementCount--
  }
}

it('allows arrow navigation for list items', async () => {
  const {user} = renderListView({totalCount: 2})

  const items = screen.queryAllByRole('listitem')
  expect(items).toHaveLength(2)

  expect(items[0]).not.toHaveAttribute('data-focus-visible-added')
  items[0]!.focus()

  expect(items[0]).toHaveAttribute('data-focus-visible-added')

  await user.keyboard('[ArrowDown]')

  expect(items[0]).not.toHaveAttribute('data-focus-visible-added')
  expect(items[1]).toHaveAttribute('data-focus-visible-added')
})

it('stays on first item when navigating up from first item', async () => {
  const {user} = renderListView({totalCount: 2})

  const items = screen.queryAllByRole('listitem')
  expect(items).toHaveLength(2)

  items[0]!.focus()

  await user.keyboard('[ArrowUp]')

  expect(items[0]).toHaveFocus()
})

it('stays on last item when navigating down from last item', async () => {
  const {user} = renderListView({totalCount: 2})

  const items = screen.queryAllByRole('listitem')
  expect(items).toHaveLength(2)

  items[1]!.focus()

  await user.keyboard('[ArrowDown]')

  expect(items[1]).toHaveFocus()
})

it('allows navigation to first item with Home key', async () => {
  const {user} = renderListView({totalCount: 3})

  const items = screen.queryAllByRole('listitem')
  expect(items).toHaveLength(3)

  items[2]!.focus()

  await user.keyboard('{Home}')

  expect(items[0]).toHaveFocus()
})

it('allows navigation to last item with End key', async () => {
  const {user} = renderListView({totalCount: 3})

  const items = screen.queryAllByRole('listitem')
  expect(items).toHaveLength(3)

  items[0]!.focus()

  await user.keyboard('{End}')

  expect(items[2]).toHaveFocus()
})

it('sets tabindex on each list item', () => {
  renderListView({totalCount: 3})

  const items = screen.queryAllByRole('listitem')
  expect(items).toHaveLength(3)

  expect(items[0]).toHaveAttribute('tabIndex', '0')
  expect(items[1]).toHaveAttribute('tabIndex', '-1')
  expect(items[2]).toHaveAttribute('tabIndex', '-1')
})

it('should tab to next focusable element', async () => {
  const {user} = renderListView({totalCount: 2, includeItemActionBars: [true, true]})
  const items = screen.getAllByRole('listitem')
  const firstItem = items[0]!
  firstItem.focus()
  await user.tab()

  const label = within(firstItem).getByTestId('test-label-1')
  expect(label).toHaveFocus()
})

it('tab should skip "visibility: hidden" and go to the next focusable element', async () => {
  const {user} = renderListView({totalCount: 2, includeItemActionBars: [true, true]})
  const items = screen.getAllByRole('listitem')
  const firstItem = items[0]!
  const label1 = within(firstItem).getByTestId('test-label-1')
  const label2 = within(firstItem).getByTestId('test-label-2')
  const label3 = within(firstItem).getByTestId('test-label-3')

  firstItem.focus()
  await user.tab()
  expect(label1).toHaveFocus()

  // Simulate label hidden when resized on viewport
  label2.style.visibility = 'hidden'

  await user.tab()
  expect(label3).toHaveFocus()
})

it('shift+tab on first element inside listitem returns focus to listitem', async () => {
  const {user} = renderListView({totalCount: 2, includeItemActionBars: [true, true]})
  const items = screen.getAllByRole('listitem')
  const firstItem = items[0]!
  firstItem.focus()
  await user.tab()

  const label = within(firstItem).getByTestId('test-label-1')
  expect(label).toHaveFocus()

  await user.tab({shift: true})
  expect(firstItem).toHaveFocus()
})

describe('custom tab behavior when focus is on the list item', () => {
  it('should shift+tab to the last focusable element outside of the list-view', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button data-testid="test-button">Bar</button>
        {children}
      </>
    )

    const {user} = renderListView({
      totalCount: 2,
      includeItemActionBars: [true, true],
      Wrapper,
    })

    const items = screen.getAllByRole('listitem')
    const secondItem = items[1]!
    secondItem.focus()

    await user.tab({shift: true})

    const btn = screen.getByTestId('test-button')
    expect(btn).toHaveFocus()
  })

  it('after shift+tab out of list-view, tab return focus to previous listitem', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button data-testid="test-button">Bar</button>
        {children}
      </>
    )

    const {user} = renderListView({
      totalCount: 2,
      includeItemActionBars: [true, true],
      Wrapper,
    })

    const items = screen.getAllByRole('listitem')
    const secondItem = items[1]!

    secondItem.focus()
    await tabThroughSubElements(user, secondItem)

    await user.tab({shift: true})

    const btn = screen.getByTestId('test-button')
    expect(btn).toHaveFocus()

    await user.tab()

    expect(secondItem).toHaveFocus()
  })
})

describe('custom tab behavior when focus is on the last child element in the list', () => {
  it('should tab to the first focusable element outside of the list-view', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button>Bar</button>
        {children}
        <a href="bar" data-testid="anchor-link">
          Foo
        </a>
      </>
    )

    const {user} = renderListView({
      totalCount: 2,
      includeItemActionBars: [true, true],
      Wrapper,
    })

    const items = screen.getAllByRole('listitem')
    const firstItem = items[0]!

    const menuItem = within(firstItem).getByTestId('list-view-item-action-bar-container')
    const menuBtn = within(menuItem).getByRole('button')
    act(() => {
      menuBtn.focus()
    })

    await user.tab()

    const anchor = screen.getByTestId('anchor-link')

    expect(anchor).toHaveFocus()
  })

  it('should account for tabindex of -1', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button>Baz</button>
        {children}
        <a href="bar" tabIndex={-1} data-testid="anchor-link">
          Bar
        </a>
        <button data-testid="button-tabindex">Foo</button>
      </>
    )

    const {user} = renderListView({
      totalCount: 2,
      includeItemActionBars: [true, true],
      Wrapper,
    })

    const items = screen.getAllByRole('listitem')
    const firstItem = items[0]!
    firstItem.focus()

    expect(firstItem).toHaveFocus()
    await tabThroughSubElements(user, firstItem)

    const btn = screen.getByTestId('button-tabindex')

    expect(btn).toHaveFocus()
  })

  it('should account for disabled components such as buttons', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button>Baz</button>
        {children}
        <button data-testid="button-tabindex" disabled>
          Foo
        </button>
        <a href="foo" data-testid="anchor-link">
          Bar
        </a>
      </>
    )

    const {user} = renderListView({
      totalCount: 2,
      includeItemActionBars: [true, true],
      Wrapper,
    })

    const items = screen.getAllByRole('listitem')
    const firstItem = items[0]!
    firstItem.focus()
    await tabThroughSubElements(user, firstItem)

    const anchor = screen.getByTestId('anchor-link')

    expect(anchor).toHaveFocus()
  })

  it('should account for combinations of the tab-index -1 and disabled elements', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button>Baz</button>
        {children}
        <a href="foo" tabIndex={-1} data-testid="anchor-link-foo">
          Foo
        </a>
        <button data-testid="button-tabindex" disabled>
          Bar
        </button>
        <a href="foo" data-testid="anchor-link-baz">
          Baz
        </a>
      </>
    )

    const {user} = renderListView({
      totalCount: 2,
      includeItemActionBars: [true, true],
      Wrapper,
    })

    const items = screen.getAllByRole('listitem')
    const firstItem = items[0]!
    firstItem.focus()

    expect(firstItem).toHaveFocus()
    await tabThroughSubElements(user, firstItem)

    const anchor = screen.getByTestId('anchor-link-baz')
    expect(anchor).toHaveFocus()
  })
})

it('should tab normally as the tab order indicates when there are no valid focus elements beneath the list-view', async () => {
  const Wrapper = ({children}: PropsWithChildren) => (
    <>
      {children}
      {/* Can re-add once https://github.com/primer/behaviors/pull/235 is merged */}
      {/* <div style={{display: 'none'}}>
        <a href="baz" data-testid="anchor-link-baz">
          Baz
        </a>
      </div> */}
      <input type="hidden" />
      <button style={{visibility: 'hidden'}}>Foo</button>
    </>
  )

  const {user} = renderListView({
    totalCount: 2,
    includeItemActionBars: [true, true],
    Wrapper,
  })

  const items = screen.getAllByRole('listitem')
  const firstItem = items[0]!
  const secondItem = items[1]!

  firstItem.focus()
  await tabThroughSubElements(user, firstItem)

  expect(secondItem).toHaveFocus()
})

it('should return focus to previous list-view listitem when list-view is re-entered via shift+tab', async () => {
  const Wrapper = ({children}: PropsWithChildren) => (
    <>
      {children}
      <a href="foo" data-testid="anchor-link">
        Foo
      </a>
    </>
  )

  const {user} = renderListView({
    totalCount: 2,
    includeItemActionBars: [true, true],
    Wrapper,
  })

  const items = screen.getAllByRole('listitem')
  const firstItem = items[0]!

  const menuItem = within(firstItem).getByTestId('list-view-item-action-bar-container')
  const menuBtn = within(menuItem).getByRole('button')
  act(() => {
    menuBtn.focus()
  })

  await user.tab()
  const anchor = screen.getByTestId('anchor-link')

  expect(anchor).toHaveFocus()

  await user.tab({shift: true})

  expect(firstItem).toHaveFocus()
})

describe('shift tab behavior when focus is on the first focusable item within a list item', () => {
  it('shift + tab should move focus to the first previous focusable element outside of the list-view', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <a href="foo" data-testid="anchor-link">
          Foo
        </a>
        {children}
      </>
    )

    const {user} = renderListView({
      totalCount: 2,
      includeItemActionBars: [true, true],
      includeItemTitleLinks: [true, true],
      Wrapper,
    })

    const items = screen.getAllByRole('listitem')
    const firstItem = items[0]!

    const titleLink = within(firstItem).getByTestId('listitem-title-link')

    titleLink.focus()
    await user.tab({shift: true})

    expect(firstItem).toHaveFocus()
  })
})

describe('tab behavior when focus is on the last focusable item within a list item', () => {
  it('should tab to the next focusable element outside of the list-view', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        {children}
        <a href="foo" data-testid="anchor-link">
          Foo
        </a>
      </>
    )

    const {user} = renderListView({
      totalCount: 2,
      includeItemActionBars: [true, true],
      Wrapper,
    })

    const items = screen.getAllByRole('listitem')
    const firstItem = items[0]!

    const menuAnchor = within(firstItem).getByTestId('overflow-menu-anchor')

    act(() => {
      menuAnchor.focus()
    })
    await user.tab()
    const anchor = screen.getByTestId('anchor-link')

    expect(anchor).toHaveFocus()
  })
})
