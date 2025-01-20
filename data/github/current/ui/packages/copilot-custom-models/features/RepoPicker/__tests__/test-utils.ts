import {act, screen, waitFor} from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'

class IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []

  disconnect() {
    return null
  }

  observe() {
    return null
  }

  takeRecords() {
    return []
  }

  unobserve() {
    return null
  }
}

export function setupIntersectionObserverMock(): void {
  class MockIntersectionObserver implements IntersectionObserver {
    root = null
    rootMargin = ''
    thresholds = []
    disconnect: () => null = () => null
    observe: () => null = () => null
    takeRecords: () => never[] = () => []
    unobserve: () => null = () => null
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  })

  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  })
}

export function setupResizeObserverMock() {
  class MockResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  })
}

export async function clickPickerButton() {
  const button = await screen.findByRole('button', {name: /[All|Select] repositories/})
  await userEvent.click(button)

  await screen.findByRole('menu')
}

export async function clickMenuItem(which: 'selected' | 'all') {
  const pattern = which === 'selected' ? 'Selected repositories' : 'All repositories'
  const name = new RegExp(pattern)

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    const menuItem = await screen.findByRole('menuitemradio', {name})
    await userEvent.click(menuItem)
  })
}

export async function openPicker() {
  await clickPickerButton()

  await clickMenuItem('selected')

  await waitFor(async () => expect(await screen.findByRole('dialog')).toBeInTheDocument())
}

export async function openList({count = 1}: {count: number}) {
  const button = await screen.findByText(`Repositories: ${count} selected`)
  await userEvent.click(button)

  await waitFor(async () => expect(await screen.findByRole('dialog')).toBeInTheDocument())
}
