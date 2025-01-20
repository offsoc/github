import {screen} from '@testing-library/react'
import {TypeName} from '../TypeName'
import {render} from '@github-ui/react-core/test-utils'

afterEach(() => {
  jest.clearAllMocks()
})

test('renders input', async () => {
  const name = 'test'
  const setName = jest.fn()
  const setError = jest.fn()

  render(<TypeName name={name} setName={setName} error="" setError={setError} />)
  const input = await screen.findByTestId('issue-type-name')
  expect(input.getAttribute('value')).toBe('test')
})

test('handles changes', async () => {
  const name = 'test'
  const setName = jest.fn()
  const setError = jest.fn()

  const {user} = render(<TypeName name={name} setName={setName} error="" setError={setError} />)
  const input = await screen.findByTestId('issue-type-name')
  await user.type(input, '!')
  expect(setError).toHaveBeenCalledTimes(1)
  expect(setName).toHaveBeenCalledWith('test!')
})
