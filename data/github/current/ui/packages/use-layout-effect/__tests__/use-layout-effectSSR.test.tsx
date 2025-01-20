/** @jest-environment node */
import {renderToString} from 'react-dom/server'
import {useLayoutEffect} from '../use-layout-effect'
import {useState} from 'react'

const Component = () => {
  const [state, setState] = useState('')
  useLayoutEffect(() => {
    setState('ran effect')
  }, [])
  return <div>{state}</div>
}
test('Renders the useIsomorphicLayoutEffect hook', async () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {})
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  const log = jest.spyOn(console, 'log').mockImplementation(() => {})
  expect(() => {
    renderToString(<Component />)
  }).not.toThrow()

  expect(error).not.toHaveBeenCalled()
  expect(warn).not.toHaveBeenCalled()
  expect(log).not.toHaveBeenCalled()
})
