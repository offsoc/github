import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {TestReactComponentPackage} from '../TestReactComponentPackage'

test('Renders the TestReactComponentPackage', () => {
  const message = 'Hello React!'
  render(<TestReactComponentPackage exampleMessage={message} />)
  expect(screen.getByRole('article')).toHaveTextContent(message)
})
