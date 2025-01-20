import {renderHook} from '@testing-library/react'
import {usePreviousValue} from '../use-previous-value'

test('Returns undefined for first render, previous state on subsequent renders', () => {
  const {result, rerender} = renderHook((value: string) => usePreviousValue<string>(value))

  expect(result.current).toBe(undefined)

  rerender('hello world')

  expect(result.current).toBe(undefined)

  rerender('goodbye world')

  expect(result.current).toEqual('hello world')

  rerender('sup world?')

  expect(result.current).toEqual('goodbye world')
})
