import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CopilotSummaryErrorBanner} from '../CopilotSummaryErrorBanner'
import {getCopilotSummaryErrorBannerProps} from '../test-utils/mock-data'

test('Renders the CopilotSummaryErrorBanner', () => {
  const props = getCopilotSummaryErrorBannerProps()
  render(<CopilotSummaryErrorBanner {...props} />)

  expect(screen.getByTestId('copilot-summary-error-banner-icon')).toBeInTheDocument()
  expect(screen.getByTestId('copilot-summary-error-banner-message')).toHaveTextContent(
    'Copilot encountered a temporary error.',
  )
})
