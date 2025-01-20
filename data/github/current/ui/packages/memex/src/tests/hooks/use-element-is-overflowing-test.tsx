import {act, render, screen} from '@testing-library/react'
import {useRef} from 'react'

import {useElementIsOverflowing} from '../../client/hooks/use-element-is-overflowing'

test('should not overflow when the elements scrollWidth is smaller than its offsetWidth', async () => {
  mockWidths({offsetWidth: 100, scrollWidth: 50})
  render(<Component />)

  expect(await screen.findByText('Not overflowing')).toBeInTheDocument()
})

test('should overflow when overflowable styles are set, and the content overflows', async () => {
  mockWidths({offsetWidth: 100, scrollWidth: 100})
  render(<Component />)

  expect(await screen.findByText('Not overflowing')).toBeInTheDocument()
})

test("should not overflow when overflowable styles are set, but the content doesn't cause overflow", async () => {
  mockWidths({offsetWidth: 50, scrollWidth: 100})
  render(<Component />)

  expect(await screen.findByText('Overflowing')).toBeInTheDocument()
})

test('should handle resizing up and down with resize observer', async () => {
  const resizeObservers = new Map<
    ResizeObserver,
    {
      entries: Set<ResizeObserverEntry>
      callback: ResizeObserverCallback
    }
  >()

  function handleMockResizeTo(widths: {offsetWidth: number; scrollWidth: number}) {
    mockWidths(widths)
    act(() => {
      for (const [observer, {entries, callback}] of resizeObservers) {
        callback(Array.from(entries), observer)
      }
    })
  }

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

  handleMockResizeTo({offsetWidth: 50, scrollWidth: 100})
  render(<Component />)

  expect(await screen.findByText('Overflowing')).toBeInTheDocument()

  handleMockResizeTo({offsetWidth: 100, scrollWidth: 50})
  expect(await screen.findByText('Not overflowing')).toBeInTheDocument()

  handleMockResizeTo({offsetWidth: 50, scrollWidth: 100})
  expect(await screen.findByText('Overflowing')).toBeInTheDocument()
})

function Component() {
  const elRef = useRef<HTMLDivElement>(null)

  const isOverflowing = useElementIsOverflowing(elRef)

  return <p ref={elRef}>{isOverflowing ? 'Overflowing' : 'Not overflowing'}</p>
}

function mockWidths({offsetWidth, scrollWidth}: {offsetWidth: number; scrollWidth: number}) {
  jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => scrollWidth)
  jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => offsetWidth)
}
