import {act, renderHook} from '@testing-library/react'

import {useObserveSelector} from '../use-observe-selector'

// eslint-disable-next-line @typescript-eslint/unbound-method
const mutationObserverDisconnect = MutationObserver.prototype.disconnect

describe('useObserveSelector', () => {
  const disconnectMock = jest.fn()

  beforeAll(() => {
    MutationObserver.prototype.disconnect = disconnectMock
  })

  afterAll(() => {
    MutationObserver.prototype.disconnect = mutationObserverDisconnect
  })

  afterEach(() => {
    disconnectMock.mockClear()
  })

  it('returns the elements that match the selector', () => {
    document.body.innerHTML = `
      <div class="target" id="foo"></div>
      <div class="target" id="bar"></div>
    `
    const {result} = renderHook(() => useObserveSelector('.target'))
    expect(result.current[0]).toHaveAttribute('id', 'foo')
    expect(result.current[1]).toHaveAttribute('id', 'bar')
  })

  it('filters elements if an item type is provided', () => {
    document.body.innerHTML = `
      <div class="target" id="foo"></div>
      <span class="target" id="bar"></div>
    `
    const {result} = renderHook(() => useObserveSelector('.target', HTMLSpanElement))
    // ensure the type is also narrowed
    const elements: HTMLSpanElement[] = result.current
    expect(elements[0]).toHaveAttribute('id', 'bar')
  })

  it('updates when the selector updates', async () => {
    document.body.innerHTML = `
      <div class="target" id="foo"></div>
      <div class="target" id="bar"></div>
    `
    const {result} = renderHook(() => useObserveSelector('.target'))

    const firstResult = result.current
    expect(firstResult[0]).toHaveAttribute('id', 'foo')
    expect(firstResult[1]).toHaveAttribute('id', 'bar')

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      document.body.innerHTML = `
        <div class="target" id="foo"></div>
        <div class="target" id="baz"></div>
        <div class="target" id="bar"></div>
      `
    })

    const secondResult = result.current
    expect(secondResult[0]).toHaveAttribute('id', 'foo')
    expect(secondResult[1]).toHaveAttribute('id', 'baz')
    expect(secondResult[2]).toHaveAttribute('id', 'bar')
  })

  it('disconnects on dismount', () => {
    const {unmount} = renderHook(() => useObserveSelector('.target'))
    unmount()
    expect(disconnectMock).toHaveBeenCalled()
  })
})
