import {renderHook} from '@testing-library/react'

import {useTrackingRef} from '../use-tracking-ref'

function renderUseTrackingRef<T>(value: T) {
  return renderHook(props => useTrackingRef(props.value), {
    initialProps: {
      value,
    },
  })
}

it('renders a default', () => {
  const {result} = renderUseTrackingRef('default')
  expect(result.current.current).toEqual('default')
})

it('updates state from the external state setter', () => {
  const {result, rerender} = renderUseTrackingRef('default')
  expect(result.current.current).toEqual('default')

  rerender({value: 'new value'})

  expect(result.current.current).toEqual('new value')

  rerender({value: 'new value 2'})

  expect(result.current.current).toEqual('new value 2')
})
