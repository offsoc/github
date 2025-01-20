import {act, screen, within} from '@testing-library/react'
import type {PropsWithChildren} from 'react'

import {renderNestedListView} from './helpers'

describe('Nested ListView focus management', () => {
  it('allows arrow navigation for list items', async () => {
    const {user} = renderNestedListView({totalCount: 2})

    const items = screen.queryAllByRole('treeitem')
    expect(items).toHaveLength(2)

    expect(items[0]).not.toHaveAttribute('data-focus-visible-added')
    act(() => {
      items[0]!.focus()
    })

    expect(items[0]).toHaveAttribute('data-focus-visible-added')

    await user.keyboard('[ArrowDown]')

    expect(items[0]).not.toHaveAttribute('data-focus-visible-added')
    expect(items[1]).toHaveAttribute('data-focus-visible-added')

    await user.keyboard('[ArrowUp]')

    expect(items[0]).toHaveAttribute('data-focus-visible-added')
    expect(items[1]).not.toHaveAttribute('data-focus-visible-added')
  })

  it('after shift+tab focus out of the nested list-view, tab return focus to previous listitem', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button data-testid="test-button">Bar</button>
        {children}
      </>
    )

    const {user} = renderNestedListView({
      totalCount: 2,
      Wrapper,
    })

    const items = screen.getAllByRole('treeitem')
    const secondItem = items[1]!

    await user.click(secondItem)
    expect(secondItem).toHaveFocus()

    await user.tab({shift: true})

    const btn = screen.getByTestId('test-button')
    expect(btn).toHaveFocus()

    await user.tab()

    expect(secondItem).toHaveFocus()
  })

  it('should shift+tab focus to the last focusable element outside of the nested list-view', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button data-testid="test-button">Bar</button>
        {children}
      </>
    )

    const {user} = renderNestedListView({
      totalCount: 2,
      Wrapper,
    })

    const items = screen.getAllByRole('treeitem')
    const secondItem = items[1]!
    act(() => {
      secondItem.focus()
    })

    await user.tab({shift: true})

    const btn = screen.getByTestId('test-button')
    expect(btn).toHaveFocus()
  })

  it('should tab focus to the first focusable element outside of the nested list-view even after up/down arrow navigation', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        <button data-testid="test-button">Bar</button>
        {children}
      </>
    )

    const {user} = renderNestedListView({
      totalCount: 3,
      Wrapper,
    })

    const items = screen.queryAllByRole('treeitem')
    expect(items).toHaveLength(3)

    act(() => {
      items[0]!.focus()
    })

    await user.keyboard('[ArrowDown]')

    await user.tab({shift: true})

    const btn = screen.getByTestId('test-button')
    expect(btn).toHaveFocus()
  })

  it('should return focus to the previous nested list-view listitem when list-view is re-entered via shift+tab', async () => {
    const Wrapper = ({children}: PropsWithChildren) => (
      <>
        {children}
        <a href="foo" data-testid="anchor-link">
          Foo
        </a>
      </>
    )

    const {user} = renderNestedListView({
      totalCount: 2,
      Wrapper,
    })

    const items = screen.getAllByRole('treeitem')
    const firstItem = items[0]!
    act(() => {
      firstItem.focus()
    })
    await user.tab()
    const anchor = screen.getByTestId('anchor-link')

    expect(anchor).toHaveFocus()

    await user.tab({shift: true})

    expect(firstItem).toHaveFocus()
  })

  describe('Nested ListView secondary info and actions suppression', () => {
    it('list item should have aria-hidden=true around metadata and action bar', () => {
      renderNestedListView({totalCount: 2})

      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!
      const metadataContainer = within(firstItem).getByTestId('nested-list-view-item-metadata')
      const actionBarContainer = within(firstItem).getByTestId('nested-list-view-item-action-bar-container')

      expect(metadataContainer).toHaveAttribute('aria-hidden', 'true')
      expect(actionBarContainer).toHaveAttribute('aria-hidden', 'true')
    })

    it('list item should have tabindex=-1 on interactive child elements in metadata and action bar', () => {
      renderNestedListView({totalCount: 2})

      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!
      const metadataContainer = within(firstItem).getByTestId('nested-list-view-item-metadata')
      const actionBarContainer = within(firstItem).getByTestId('nested-list-view-item-action-bar-container')

      const interactiveMetadataElements = within(metadataContainer).getAllByRole('link', {hidden: true})
      const interactiveActionBarElements = within(actionBarContainer).getAllByRole('button', {hidden: true})

      for (const el of interactiveMetadataElements) {
        expect(el).toHaveAttribute('tabindex', '-1')
      }
      for (const el of interactiveActionBarElements) {
        expect(el).toHaveAttribute('tabindex', '-1')
      }
    })

    it('clicking on a secondary action and then focusing on the Nested ListView, should have focus on the list item', async () => {
      const Wrapper = ({children}: PropsWithChildren) => (
        <>
          {children}
          <a href="foo" data-testid="anchor-link">
            Foo
          </a>
        </>
      )

      const {user} = renderNestedListView({
        totalCount: 2,
        Wrapper,
      })

      const items = screen.getAllByRole('treeitem')
      const firstItem = items[0]!
      const actionBarContainer = within(firstItem).getByTestId('nested-list-view-item-action-bar-container')

      const actionBarButton = within(actionBarContainer).getByRole('button', {hidden: true})
      await user.click(actionBarButton)
      await user.keyboard('[Escape]') // close secondary action bar

      const outsideLink = screen.getByTestId('anchor-link')
      act(() => {
        outsideLink.focus()
      })
      expect(outsideLink).toHaveFocus()

      await user.tab({shift: true})

      expect(firstItem).toHaveFocus()
    })
  })
})
