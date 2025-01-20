import {renderHook} from '@testing-library/react'

import {usePageVisibility} from '../../client/hooks/use-page-visibility'

describe('usePageVisibility', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', {value: 'visible', writable: true})
    Object.defineProperty(document, 'hidden', {value: false, writable: true})
    document.dispatchEvent(new Event('visibilitychange'))
  })

  it('should get page visibility when page is visible', () => {
    const {result} = renderHook(() => usePageVisibility())

    expect(result.current).toBe(true)
  })

  it('should set page visibility to false when page becomes hidden', () => {
    Object.defineProperty(document, 'hidden', {value: true, writable: true})
    document.dispatchEvent(new Event('visibilitychange'))

    const {result} = renderHook(() => usePageVisibility())

    expect(result.current).toBe(false)
  })

  it('should remove event listener when cleaning up hook', () => {
    const addEventListenerMock = jest.fn()
    const removeListenerMock = jest.fn()
    document.addEventListener = addEventListenerMock
    document.removeEventListener = removeListenerMock

    const {unmount} = renderHook(() => usePageVisibility())
    unmount()

    expect(removeListenerMock).toHaveBeenCalledWith('visibilitychange', addEventListenerMock.mock.calls[0][1])
  })
})
