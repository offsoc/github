// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'
import {screen} from '@testing-library/react'

export function clickAskCopilotForReview() {
  const requestReviewButton = screen.getByText('Ask Copilot to review')
  expect(requestReviewButton).toBeInTheDocument()
  userEvent.click(requestReviewButton)
}
