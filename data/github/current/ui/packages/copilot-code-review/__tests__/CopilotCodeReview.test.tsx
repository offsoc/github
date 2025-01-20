import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CopilotCodeReviewButton} from '../CopilotCodeReviewButton'
import {getPullRequestPathParams} from '../test-utils/mock-data'

test('Renders the CopilotCodeReviewButton', () => {
  const props = getPullRequestPathParams()
  render(<CopilotCodeReviewButton {...props} />)
  expect(screen.getByRole('button')).toHaveTextContent('Ask Copilot to review')
})
