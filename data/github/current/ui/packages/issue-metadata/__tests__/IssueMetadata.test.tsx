import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {IssueMetadata} from '../IssueMetadata'

test('Renders the IssueMetadata', () => {
  const message = 'Hello React!'
  render(<IssueMetadata exampleMessage={message} />)
  expect(screen.getByRole('article')).toHaveTextContent(message)
})
