import {FocusKeys} from '@primer/behaviors'
// eslint-disable-next-line no-restricted-imports
import {iterateFocusableElements} from '@primer/behaviors/utils'
import {useFocusZone} from '@primer/react'

export function useRovingTabIndex(): {containerRef: React.RefObject<HTMLElement>} {
  const {containerRef} = useFocusZone({
    strict: true,
    bindKeys: FocusKeys.ArrowVertical | FocusKeys.HomeAndEnd | FocusKeys.PageUpDown | FocusKeys.Tab,
    focusInStrategy: () => {
      if (!containerRef.current) return
      const lastFocused = containerRef.current.querySelector('[tabindex="0"]') as HTMLElement
      const listItemToFocus = lastFocused?.closest('[role=listitem]') as HTMLElement

      return listItemToFocus ? listItemToFocus : lastFocused
    },
    focusableElementFilter: element => element.getAttribute('role') !== 'list',
    getNextFocusable: (direction, from, event) => {
      if (!(from instanceof HTMLElement)) return

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.key === 'Tab' || event.code === 'Tab') {
        // Custom tab focus behavior:
        // 1. Check if focus is on the list item
        // 2. Find the previous focusable element before the list-view.
        // 3. Move focus to that.
        if (event.shiftKey && from.getAttribute('role') === 'listitem') {
          return getFocusElementOutsideOfListView(from, 'previous')
        }

        const listItem = from.closest('[role=listitem]') as HTMLElement
        if (!listItem) return

        const focusableElements = [...iterateFocusableElements(listItem, {strict: true})]

        // Custom tab behavior when a select input and a trailing badge are present in a list item:
        // 1. Check if focusableElements contains a trailing badge.
        // 2. If selectable element also exists then swap the trailing badge and selection focus order
        const hasTrailingBadgeIndex = focusableElements.findIndex(
          element => element.parentElement?.getAttribute('data-listview-component') === 'trailing-badge',
        )
        const hasSelectableElementIndex = focusableElements.findIndex(
          element => element.getAttribute('data-listview-component') === 'selection-input',
        )

        if (hasTrailingBadgeIndex >= 0 && hasSelectableElementIndex >= 0) {
          focusableElements.splice(hasTrailingBadgeIndex, 0, focusableElements[hasSelectableElementIndex]!)
          focusableElements.splice(hasSelectableElementIndex + 1, 1)
        }

        const eventIndex = focusableElements.indexOf(event.target as HTMLElement)
        if (eventIndex === focusableElements.length - 1 && !event.shiftKey) {
          // Custom tab focus behavior:
          // 1. Check if focus is on the last focusable item in a list item
          // 2. Find the next focusable element after the list-view.
          // 3. Move focus to that.
          return getFocusElementOutsideOfListView(from, 'next')
        } else if (eventIndex > 0) {
          // If we are within the listitem, move focus to the next/previous focusable element
          // This is to handle dynamic `visibility: hidden` on elements (e.g. label is hidden/visible based on viewport)
          if (event.shiftKey) return focusableElements[eventIndex - 1]
          return focusableElements[eventIndex + 1]
        }

        // If undefined is returned, the regular algorithm to select the next element to focus will be used.
        // https://primer.style/react/focusZone#focuszonesettings-interface
        return
      }

      if (direction === 'previous') {
        // Focus previous visible element
        return getListItemElement(from, direction) || getFirstElement(from)
      }

      if (direction === 'next') {
        // Focus next visible element
        return getListItemElement(from, direction) || getLastElement(from)
      }

      if (direction === 'start') {
        return getFirstElement(from)
      }

      if (direction === 'end') {
        return getLastElement(from)
      }

      return undefined
    },
  })
  return {containerRef}
}

function getListItemElement(element: HTMLElement, direction: 'next' | 'previous'): HTMLElement | undefined {
  let listItem = element

  // In case the event is fired from a child element, find the parent listitem
  const foundListItem: HTMLElement | null = element.closest('[role=listitem]')
  if (foundListItem) listItem = foundListItem

  const root = listItem.closest('[role=list]')
  if (!root) return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, node => {
    if (!(node instanceof HTMLElement)) return NodeFilter.FILTER_SKIP
    return node.getAttribute('role') === 'listitem' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  })

  let current = walker.firstChild()

  let i = 0
  while (current !== listItem) {
    current = walker.nextNode()
    i++
    if (i > 500) break // fail-safe to not cause an endless loop
  }

  let next = direction === 'next' ? walker.nextNode() : walker.previousNode()

  // If next element is nested inside a collapsed sublist, continue iterating
  while (next instanceof HTMLElement && next.parentElement?.closest('[role=listitem][aria-expanded=false]')) {
    next = direction === 'next' ? walker.nextNode() : walker.previousNode()
  }

  return next instanceof HTMLElement ? next : undefined
}

function getFirstElement(element: HTMLElement): HTMLElement | undefined {
  const root = element.closest('[role=list]')
  const first = root?.querySelector('[role=listitem]')
  return first instanceof HTMLElement ? first : undefined
}

function getLastElement(element: HTMLElement): HTMLElement | undefined {
  const root = element.closest('[role=list]')
  const items = root?.querySelectorAll('[role=listitem]')

  if (!items || items.length < 1) return

  const last = items[items.length - 1]
  if (last instanceof HTMLElement) return last
}

function getFocusElementOutsideOfListView(
  element: HTMLElement,
  direction: 'previous' | 'next',
): HTMLElement | undefined {
  // Find all focusable elements in the document excluding elements in ListView.
  // All focusable elements inside a list-view are programatically given a tabindex of -1 because of the focusZone hook
  // so by setting onlyTabbable:true we disregard elements in ListView to find the next focusable element outside of list-view
  const focusableElements = [...iterateFocusableElements(document.documentElement, {strict: true, onlyTabbable: true})]
  const currentFocusedElementIndex = focusableElements.indexOf(element)

  // Search for the nearest focusable element before/after the current focused element
  // that is outside of a list view and is focusable.
  return direction === 'next'
    ? focusableElements[currentFocusedElementIndex + 1]
    : focusableElements[currentFocusedElementIndex - 1]
}
