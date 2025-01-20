// Navigation Behavior
//
// Provides basic cursor, vi and emacs keyboard navigation. As well as
// mouseover selection.
//
// item Element with .js-navigation-item. The current focused
//            item is denoted with the .navigation-focus class.
// container Element with .js-navigation-container class name.
//                 Contains item elements. The active container is denoted
//                 by the .js-active-navigation-container class.
//
// The .js-active-navigation-container class can be part of the html or
// added programmatically with navigation('focus'). Making it part of
// the template will automatically activate it without any extra JS.
// Just make sure its the only active container on the page.
//
// li.navigation-focus { background: yellow; }
//
// <ul class="js-navigation-container js-active-navigation-container">
//   <li class="js-navigation-item"><a href="">One</a></li>
//   <li class="js-navigation-item"><a href="">Two</a></li>
//   <li class="js-navigation-item"><a href="">Three</a></li>
// </ul>
//
// Methods
//
// .navigation('active')
//
// Returns current active container.
//
// .navigation('activate')
//
// Activates navigation container.
//
// .navigation('deactivate')
//
// Deactivates navigation container.
//
// .navigation('push')
//
// Activates navigation container and push it onto a stack.
//
// .navigation('pop')
//
// Deactivates navigation container and remove it from stack. Then
// activate the previous container on the top of the stack.
//
// .navigation('focus')
//
// Activates navigation container and focus first item.
//
// .navigation('clear')
//
// Removes current focus.
//
// .navigation('refocus')
//
// Removes current focus and focuses on the first item.
//
//
// Events
//
// navigation:focus
//
// Bubbles Yes
// Cancelable Yes
// Default action Focus navigation item
// Target .js-navigation-item Element
//
// navigation:keydown
//
// Bubbles Yes
// Cancelable Yes
// Default action Deactivate navigation
// Target .js-navigation-item or .js-navigation-container Element
// Context info
//   * originalEvent - keydown event
//   * relatedTarget - .js-navigation-container Element
//
// navigation:keyopen
//
// Bubbles Yes
// Cancelable No
// Target .js-navigation-item Element
// Context info
//   * modifierKey - Boolean for ctrl or command modifier key
//
// navigation:open
//
// Bubbles Yes
// Cancelable Yes
// Target .js-navigation-item Element
// Context info
//   * modifierKey - Boolean for ctrl or command modifier key
//

import {compose, fromEvent} from '@github-ui/subscription'
import {fire, on} from 'delegated-events'
import {overflowOffset, overflowParent, positionedOffset} from '@primer/behaviors'
import {eventToHotkeyString} from '@github-ui/hotkey'
import {isShortcutAllowed} from '@github-ui/hotkey/keyboard-shortcuts-helper'
import {observe} from '@github/selector-observer'
import scrollTo from './scrollto'
import visible from '@github-ui/visible'
import {ssrSafeWindow} from '@github-ui/ssr-utils'

const ctrlBindings = ssrSafeWindow?.navigator.userAgent.match(/Macintosh/)
const modifierKey = ctrlBindings ? 'metaKey' : 'ctrlKey'
const hotkeyModifier = ctrlBindings ? 'Meta' : 'Control'

let disableMouseEvents = false
let mousePosition = {
  x: 0,
  y: 0,
}

type ScrollBehavior = 'auto' | 'smooth'

// Binds mouseover handlers on navigation containers.
//
// This is an optimization to avoid adding a global mouseover to document.
observe('.js-navigation-container:not(.js-navigation-container-no-mouse)', {
  subscribe: el =>
    compose(fromEvent(el, 'mouseover', onContainerMouseMove), fromEvent(el, 'mouseover', onContainerMouseOver)),
})

// Tracks last mouse position inside container.
function onContainerMouseMove(event: Event) {
  if (!(event instanceof MouseEvent)) return
  if (mousePosition.x !== event.clientX || mousePosition.y !== event.clientY) {
    disableMouseEvents = false
  }
  mousePosition = {
    x: event.clientX,
    y: event.clientY,
  }
}

function onContainerMouseOver(event: Event) {
  if (disableMouseEvents) {
    return
  }
  const container = event.currentTarget
  const {target} = event
  if (
    !(target instanceof Element) ||
    !(container instanceof HTMLElement) ||
    !container.closest('.js-active-navigation-container')
  ) {
    return
  }
  const item = target.closest('.js-navigation-item')
  if (item) focusItem(item, container)
}

let count = 0
observe('.js-active-navigation-container', {
  add() {
    count++
    if (count === 1) document.addEventListener('keydown', fireCustomKeydown)
  },
  remove() {
    count--
    if (count === 0) document.removeEventListener('keydown', fireCustomKeydown)
  },
})

// Dispatches custom events from focused items.
//
// It also makes it easy to bind custom hotkeys to focused items.
function fireCustomKeydown(event: KeyboardEvent) {
  if (
    event.target !== document.body &&
    event.target instanceof HTMLElement &&
    !event.target.classList.contains('js-navigation-enable')
  ) {
    return
  }

  disableMouseEvents = true

  const container = getActiveContainer()
  let dispatched = false

  if (container) {
    const target = container.querySelector('.js-navigation-item.navigation-focus') || container
    dispatched = fire(target, 'navigation:keydown', {
      hotkey: eventToHotkeyString(event),
      originalEvent: event,
      originalTarget: event.target,
    })
  }

  if (!dispatched) {
    event.preventDefault()
  }
}

on('navigation:keydown', '.js-active-navigation-container', function (event) {
  const container = event.currentTarget as HTMLElement
  const isInput = event.detail.originalTarget.matches('input, textarea')
  const item = event.target as HTMLElement

  if (!isShortcutAllowed(event.detail.originalEvent)) return

  if (item.classList.contains('js-navigation-item')) {
    if (isInput) {
      if (ctrlBindings) {
        switch (eventToHotkeyString(event.detail.originalEvent)) {
          case 'Control+n':
            cursorDown(item, container)
            break
          case 'Control+p':
            cursorUp(item, container)
        }
      }
      switch (eventToHotkeyString(event.detail.originalEvent)) {
        case 'ArrowUp':
          cursorUp(item, container)
          break
        case 'ArrowDown':
          cursorDown(item, container)
          break
        case 'Enter':
        case `${hotkeyModifier}+Enter`:
          keyOpen(item, event.detail.originalEvent[modifierKey])
          break
      }
    } else {
      if (ctrlBindings) {
        switch (eventToHotkeyString(event.detail.originalEvent)) {
          case 'Control+n':
            cursorDown(item, container)
            break
          case 'Control+p':
            cursorUp(item, container)
            break
          case 'Alt+v':
            pageUp(item, container)
            break
          case 'Control+v':
            pageDown(item, container)
        }
      }
      switch (eventToHotkeyString(event.detail.originalEvent)) {
        case 'j':
        case 'J':
          cursorDown(item, container)
          break
        case 'k':
        case 'Shift+K':
          cursorUp(item, container)
          break
        case 'o':
        case 'Enter':
        case `${hotkeyModifier}+Enter`:
          keyOpen(item, event.detail[modifierKey])
          break
      }
    }
  } else {
    const firstItem = getItems(container)[0]
    if (firstItem) {
      if (isInput) {
        if (ctrlBindings) {
          switch (eventToHotkeyString(event.detail.originalEvent)) {
            case 'Control+n':
              focusItem(firstItem, container)
          }
        }
        switch (eventToHotkeyString(event.detail.originalEvent)) {
          case 'ArrowDown':
            focusItem(firstItem, container)
        }
      } else {
        if (ctrlBindings) {
          switch (eventToHotkeyString(event.detail.originalEvent)) {
            case 'Control+n':
            case 'Control+v':
              focusItem(firstItem, container)
          }
        }
        switch (eventToHotkeyString(event.detail.originalEvent)) {
          case 'j':
            focusItem(firstItem, container)
        }
      }
    }
  }

  if (isInput) {
    if (ctrlBindings) {
      switch (eventToHotkeyString(event.detail.originalEvent)) {
        case 'Control+n':
        case 'Control+p':
          event.preventDefault()
      }
    }
    switch (eventToHotkeyString(event.detail.originalEvent)) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault()
        break
      case 'Enter':
        event.preventDefault()
    }
  } else {
    if (ctrlBindings) {
      switch (eventToHotkeyString(event.detail.originalEvent)) {
        case 'Control+n':
        case 'Control+p':
        case 'Control+v':
        case 'Alt+v':
          event.preventDefault()
      }
    }
    switch (eventToHotkeyString(event.detail.originalEvent)) {
      case 'j':
      case 'k':
      case 'o':
        event.preventDefault()
        break
      case 'Enter':
      case `${modifierKey}+Enter`:
        event.preventDefault()
    }
  }
})

// Fire custom navigation:open event.
//
// Examples:
//
// on('navigation:open', '.listings .listing', function() {
//   window.location = this.querySelector('a').getAttribute('href')
// }).
function fireOpen(
  event: Event & {modifierKey?: boolean; altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean},
) {
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  const modifier = event.modifierKey || event.altKey || event.ctrlKey || event.metaKey
  const dispatched = fire(event.currentTarget as Element, 'navigation:open', {
    modifierKey: modifier,
    shiftKey: event.shiftKey,
  })
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */

  if (!dispatched) {
    event.preventDefault()
  }
}

// Open the item on click.
on('click', '.js-active-navigation-container .js-navigation-item', function (event) {
  fireOpen(event)
})

// Handle keydown open events.
on('navigation:keyopen', '.js-active-navigation-container .js-navigation-item', function (event) {
  const a = event.currentTarget.classList.contains('js-navigation-open')
    ? event.currentTarget
    : event.currentTarget.querySelector('.js-navigation-open')
  if (a instanceof HTMLAnchorElement) {
    if (event.detail.modifierKey) {
      window.open(a.href, '_blank')
      window.focus()
    } else {
      const clicked = a.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        }),
      )
      if (clicked) {
        a.click()
      }
    }
    event.preventDefault()
  } else {
    fireOpen(event)
  }
})

// Make container active by adding the js-active-navigation-container class to it.
export function activate(container: Element | null) {
  const activeContainer = getActiveContainer()
  if (container !== activeContainer) {
    if (activeContainer !== null) deactivate(activeContainer)
    container?.classList.add('js-active-navigation-container')
  }
}

// Remove active id from container.
export function deactivate(container: Element) {
  container.classList.remove('js-active-navigation-container')
}

const containerStack: Element[] = []

// Active container and push previous onto a stack.
export function push(container: HTMLElement) {
  const activeContainer = getActiveContainer()
  if (activeContainer) {
    containerStack.push(activeContainer)
  }
  activate(container)
}

// Deactivate container and activate the next on the stack.
export function pop(container: Element) {
  deactivate(container)
  clear(container)

  const activeContainer = containerStack.pop()
  if (activeContainer) {
    activate(activeContainer)
  }
}

// Active the container and focus on the target or first element.
export function focus(container: HTMLElement, targetElement?: HTMLElement) {
  const target = targetElement || container

  const firstItem = getItems(container)[0]
  const item = target.closest('.js-navigation-item') || firstItem

  activate(container)

  if (item instanceof HTMLElement) {
    const focusPrevented = focusItem(item, container)
    if (focusPrevented) {
      return
    }
    const parent = overflowParent(item)
    if (!parent) return
    scrollItemTo(parent, item)
  }
}

// Clear current focus.
export function clear(container: Element) {
  const elements = container.querySelectorAll('.js-navigation-item.navigation-focus')
  for (const element of elements) {
    element.classList.remove('navigation-focus')
  }
}

// Clear current focus and focus on the target or first element.
export function refocus(container: HTMLElement, target?: HTMLElement) {
  clear(container)
  focus(container, target)
}

// Select the previous item and scroll to it if its off screen.
function cursorUp(item: HTMLElement, container: HTMLElement) {
  const items = getItems(container)
  const index = items.indexOf(item)
  const previous = items[index - 1]
  if (previous) {
    const focusPrevented = focusItem(previous, container)
    if (focusPrevented) {
      return
    }

    const overflowParentEl = overflowParent(previous)
    if (!overflowParentEl) return
    if (getScrollStyle(container) === 'page') {
      scrollPageTo(overflowParentEl, previous)
    } else {
      scrollItemTo(overflowParentEl, previous)
    }
  }
}

// Select the next item and scroll to it if its off screen.
function cursorDown(item: HTMLElement, container: HTMLElement) {
  const items = getItems(container)
  const index = items.indexOf(item)
  const next = items[index + 1]

  if (next) {
    const focusPrevented = focusItem(next, container)
    if (focusPrevented) {
      return
    }

    const overflowParentEl = overflowParent(next)
    if (!overflowParentEl) return
    if (getScrollStyle(container) === 'page') {
      scrollPageTo(overflowParentEl, next)
    } else {
      scrollItemTo(overflowParentEl, next)
    }
  }
}

// Scrolls up to the previous item that is above the viewport.
function pageUp(item: HTMLElement, container: HTMLElement) {
  const items = getItems(container)
  let index = items.indexOf(item)
  const overflowParentEl = overflowParent(item)

  if (overflowParentEl == null) {
    return
  }

  let previous
  let dimension
  while (
    (previous = items[index - 1]) &&
    (dimension = overflowOffset(previous, overflowParentEl)) &&
    dimension.top >= 0
  ) {
    index--
  }

  if (previous) {
    const focusPrevented = focusItem(previous, container)
    if (focusPrevented) {
      return
    }

    scrollPageTo(overflowParentEl, previous)
  }
}

// Scrolls down to the next item that is below the viewport.
function pageDown(item: HTMLElement, container: HTMLElement) {
  const items = getItems(container)
  let index = items.indexOf(item)
  const overflowParentEl = overflowParent(item)

  if (overflowParentEl == null) {
    return
  }

  let next
  let dimension
  while ((next = items[index + 1]) && (dimension = overflowOffset(next, overflowParentEl)) && dimension.bottom >= 0) {
    index++
  }

  if (next) {
    const focusPrevented = focusItem(next, container)
    if (focusPrevented) {
      return
    }
    scrollPageTo(overflowParentEl, next)
  }
}

// Handle opening item from keyboard.
//
// Hitting o or enter on a item will call this method.
function keyOpen(item: Element, modifier = false) {
  fire(item, 'navigation:keyopen', {
    modifierKey: modifier,
  })
}

function focusItem(target: Element, container: Element): boolean {
  if (fire(target, 'navigation:focus')) {
    clear(container)
    target.classList.add('navigation-focus')

    return false
  } else {
    return true
  }
}

function getActiveContainer() {
  return document.querySelector('.js-active-navigation-container')
}

function getItems(container: Element): HTMLElement[] {
  const items = []
  for (const element of container.querySelectorAll('.js-navigation-item')) {
    if (element instanceof HTMLElement && visible(element)) {
      items.push(element)
    }
  }

  return items
}

function getScrollStyle(container: HTMLElement): string {
  return container.getAttribute('data-navigation-scroll') || 'item'
}

function scrollPageTo(container: HTMLElement, element: HTMLElement, behavior: ScrollBehavior = 'smooth') {
  const overflow = overflowOffset(element, container)
  if (!overflow) return

  if (overflow.bottom <= 0) {
    element.scrollIntoView({behavior, block: 'start'})
  } else if (overflow.top <= 0) {
    element.scrollIntoView({behavior, block: 'end'})
  }
}

function scrollItemTo(container: HTMLElement, element: HTMLElement) {
  const position = positionedOffset(element, container)
  const overflow = overflowOffset(element, container)

  if (position == null || overflow == null) {
    return
  }

  if (overflow.bottom <= 0 && document.body) {
    const scrollHeight = container.offsetParent != null ? container.scrollHeight : document.body.scrollHeight
    const overflowHeight = overflow.height ?? 0

    const scrollTop = scrollHeight - (position.bottom + overflowHeight)
    scrollTo(container, {
      top: scrollTop,
    })
  } else if (overflow.top <= 0) {
    scrollTo(container, {
      top: position.top,
    })
  }
}
