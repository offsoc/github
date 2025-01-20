import {screen, within} from '@testing-library/react'

import {render} from '../../test-utils/Render'
import {SecretScanningMetrics} from '../SecretScanningMetrics'
import {getSecretScanningMetricsProps} from '../test-utils/mock-data'

test('renders the SecretScanningMetrics', () => {
  const props = getSecretScanningMetricsProps()
  render(<SecretScanningMetrics {...props} />)
  expect(screen.getByText('Secret scanning')).toBeInTheDocument()
  expect(screen.getByText('All data is in UTC (GMT) time.')).toBeInTheDocument()
})

describe('incomplete data warning', () => {
  test('renders a warning when show is true', async () => {
    const props = getSecretScanningMetricsProps()
    render(<SecretScanningMetrics {...props} showIncompleteDataWarning={true} incompleteDataWarningDocHref="mydoc" />)
    expect(within(screen.getByTestId('incomplete-data-warning')).getByRole('link')).toHaveAttribute('href', 'mydoc')
  })

  test('does not render a warning when show is false', async () => {
    const props = getSecretScanningMetricsProps()
    render(<SecretScanningMetrics {...props} showIncompleteDataWarning={false} incompleteDataWarningDocHref="mydoc" />)
    expect(screen.queryByTestId('incomplete-data-warning')).not.toBeInTheDocument()
  })
})

describe('DateSpanPicker', () => {
  it('renders with the default date span when no date span is provided', () => {
    const props = getSecretScanningMetricsProps()
    render(<SecretScanningMetrics {...props} initialDateSpan={undefined} />)
    expect(screen.getByTestId('date-span-picker-calendar-icon')).toBeInTheDocument()
    expect(within(screen.getByTestId('date-span-picker-button')).getByText('Last 30 days')).toBeInTheDocument()
  })

  it('renders a DateSpanPicker with the provided date period', () => {
    const props = getSecretScanningMetricsProps()
    render(<SecretScanningMetrics {...props} initialDateSpan={{period: 'last14days'}} />)
    expect(screen.getByTestId('date-span-picker-calendar-icon')).toBeInTheDocument()
    expect(within(screen.getByTestId('date-span-picker-button')).getByText('Last 14 days')).toBeInTheDocument()
  })

  it('should render with explicit date range', () => {
    const props = getSecretScanningMetricsProps()
    render(<SecretScanningMetrics {...props} initialDateSpan={{from: '2023-01-01', to: '2023-12-31'}} />)
    expect(screen.getByTestId('date-span-picker-calendar-icon')).toBeInTheDocument()
    expect(
      within(screen.getByTestId('date-span-picker-button')).getByText('Jan 1, 2023 - Dec 31, 2023'),
    ).toBeInTheDocument()
  })
})
