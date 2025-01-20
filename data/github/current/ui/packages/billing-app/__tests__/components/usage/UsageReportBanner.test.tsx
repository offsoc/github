import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {UsageReportBanner} from '../../../components/usage/UsageReportBanner'

test('Renders the banner when the banner has not been dismissed', () => {
  render(<UsageReportBanner />)

  expect(screen.getByText(/We have recently shipped a more enhanced usage report/i)).toBeInTheDocument()
})

test('Does not render the banner when the banner has been dismissed', () => {
  render(<UsageReportBanner />)
  const closeButton = screen.getByLabelText('Close')
  fireEvent.click(closeButton)
  expect(screen.queryByText(/We have recently shipped a more enhanced usage report/i)).not.toBeInTheDocument()
})
