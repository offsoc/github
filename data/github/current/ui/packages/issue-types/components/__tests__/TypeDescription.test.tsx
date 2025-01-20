import {screen} from '@testing-library/react'
import {TypeDescription} from '../TypeDescription'
import {render} from '@github-ui/react-core/test-utils'

afterEach(() => {
  jest.clearAllMocks()
})

describe('type description updating', () => {
  test('renders input and handles changes', async () => {
    const description = 'test'
    const setDescription = jest.fn()
    const setError = jest.fn()

    const {user} = render(
      <TypeDescription description={description} setDescription={setDescription} error="" setError={setError} />,
    )

    const input = await screen.findByTestId('issue-type-description')
    expect(input.getAttribute('value')).toBe('test')

    await user.type(input, '!')
    expect(setError).toHaveBeenCalledTimes(1)
    expect(setDescription).toHaveBeenCalledWith('test!')
  })
})
