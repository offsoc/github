import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {LabelToken} from '../LabelToken'

test('Renders the LabelToken', () => {
  const message = 'Hello GitHub'
  render(<LabelToken text={message} />)
  expect(screen.getByText('Hello GitHub')).toBeInTheDocument()
})
