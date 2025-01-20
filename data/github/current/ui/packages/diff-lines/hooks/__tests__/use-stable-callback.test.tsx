import {renderHook} from '@testing-library/react'

import {useStableCallback} from '../use-stable-callback'

it('maintains reference to first function definition', () => {
  const initialFnHook = jest.fn((a: number) => a + 1)
  const {result, rerender} = renderHook(() => useStableCallback(initialFnHook))

  const initialHookReference = result.current
  jest.mocked(initialHookReference)
  expect(result.current(4)).toBe(5)
  const newFnHook = jest.fn((a: number) => a * 9)

  // Rerender the hook with a new function reference
  rerender(newFnHook)
  // Assert that the original functionality still works
  expect(result.current(4)).toBe(5)
  // Assert that the original defined function was called 2 times
  expect(initialFnHook).toHaveBeenCalledTimes(2)
  // Assert that the current hook reference has not changed
  expect(result.current).toBe(initialHookReference)
  // Assert that the fn passed to rerender or the hook did not get called
  expect(newFnHook).not.toHaveBeenCalled()
})

it('does not get called after unmounting', () => {
  const initialFnHook = jest.fn((a: number) => a + 1)
  const {result, unmount} = renderHook(() => useStableCallback(initialFnHook))

  // Unmount the hook
  unmount()
  // Call the hook
  result.current(5)
  // Assert that the initial hook function reference was not called
  expect(initialFnHook).not.toHaveBeenCalled()
})
