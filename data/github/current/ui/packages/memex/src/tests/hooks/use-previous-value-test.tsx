import {renderHook} from '@testing-library/react'

import {usePreviousValue} from '../../client/hooks/common/use-previous-value'

function renderUsePreviousValue<T>(value: T) {
  return renderHook(props => usePreviousValue(props.value), {
    initialProps: {
      value,
    },
  })
}

test('it renders a default', () => {
  const {result} = renderUsePreviousValue('default')
  expect(result.current).toEqual('default')
})

test('it updates state from the external state setter', () => {
  const {result, rerender} = renderUsePreviousValue('default')
  expect(result.current).toEqual('default')

  rerender({value: 'new value'})

  expect(result.current).toEqual('default')

  rerender({value: 'new value 2'})

  expect(result.current).toEqual('new value')
})
