import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ErrorWithRetry} from '../ErrorWithRetry'

test('Renders the ErrorWithRetry', () => {
  const message = 'Hello React!'
  let wasRetried = false
  const retry = () => (wasRetried = true)

  render(<ErrorWithRetry message={message} retry={retry} />)

  expect(screen.getByText(message)).toBeInTheDocument()

  const button = screen.getByRole('button')
  expect(button).toHaveTextContent('Try again')

  act(() => button.click())

  expect(wasRetried).toBe(true)
})
