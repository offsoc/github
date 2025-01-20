import {renderHook} from '@testing-library/react'

import useWhyDidYouRerender from '../use-why-did-you-rerender'

it('does not log anything on initial render, or when re-rendering with the same props', () => {
  const initialProps = {testProps: 'testPropValue'}
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  const {rerender} = renderHook(props => useWhyDidYouRerender('test', {...props}), {initialProps})

  rerender(initialProps)

  expect(consoleSpy).not.toHaveBeenCalled()
})

it('logs to the console when props change, with a list of which', () => {
  const initialProps = {testProps: 'testPropValue'}
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  const {rerender} = renderHook(props => useWhyDidYouRerender('test', {...props}), {initialProps})

  rerender({testProps: 'testPropValueUpdated'})

  expect(consoleSpy).toHaveBeenNthCalledWith(1, '[why-did-you-update]', 'test', {
    testProps: {from: 'testPropValue', to: 'testPropValueUpdated'},
  })
  consoleSpy.mockClear()

  rerender({testProps: 'testPropValueUpdated'})

  expect(consoleSpy).not.toHaveBeenCalled()
})
