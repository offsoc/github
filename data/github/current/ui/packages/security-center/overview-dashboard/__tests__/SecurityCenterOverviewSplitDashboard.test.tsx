import {screen, within} from '@testing-library/react'

import {render} from '../../test-utils/Render'
import {SecurityCenterOverviewSplitDashboard} from '../SecurityCenterOverviewSplitDashboard'
import {getSecurityCenterOverviewDashboardProps} from '../test-utils/mock-data'

jest.useFakeTimers()
const currTime = new Date('2024-01-10T00:00:00Z')
jest.setSystemTime(currTime)

window.performance.mark = jest.fn()
window.performance.measure = jest.fn()
window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}])
window.performance.clearMarks = jest.fn()
window.performance.clearMeasures = jest.fn()

test('renders the SecurityCenterOverviewSplitDashboard', () => {
  const props = getSecurityCenterOverviewDashboardProps()
  render(<SecurityCenterOverviewSplitDashboard {...props} />)
  expect(screen.getByText('Reopened alerts')).toBeInTheDocument()
  expect(screen.getByText('Secrets bypassed')).toBeInTheDocument()

  expect(screen.getByText('Detection')).toBeInTheDocument()
  expect(screen.getByText('Remediation')).toBeInTheDocument()
  expect(screen.getByText('Prevention')).toBeInTheDocument()
})

describe('DateSpanPicker behavior', () => {
  it('renders a DateSpanPicker with the default date span when no date span is provided', () => {
    const props = getSecurityCenterOverviewDashboardProps()
    render(<SecurityCenterOverviewSplitDashboard {...props} initialDateSpan={undefined} />)

    expect(screen.getByTestId('date-span-picker-calendar-icon')).toBeInTheDocument()
    expect(within(screen.getByTestId('date-span-picker-button')).getByText('Last 30 days')).toBeInTheDocument()
  })

  it('renders a DateSpanPicker with the provided date period', () => {
    const props = getSecurityCenterOverviewDashboardProps()
    render(<SecurityCenterOverviewSplitDashboard {...props} initialDateSpan={{period: 'last14days'}} />)

    expect(screen.getByTestId('date-span-picker-calendar-icon')).toBeInTheDocument()
    expect(within(screen.getByTestId('date-span-picker-button')).getByText('Last 14 days')).toBeInTheDocument()
  })

  it('renders a DateSpanPicker with the provided date range', () => {
    const props = getSecurityCenterOverviewDashboardProps()
    render(<SecurityCenterOverviewSplitDashboard {...props} initialDateSpan={{from: '2023-01-01', to: '2024-01-01'}} />)

    expect(screen.getByTestId('date-span-picker-calendar-icon')).toBeInTheDocument()
    expect(within(screen.getByTestId('date-span-picker-button')).getByText('Jan 1, 2023 - Jan 1')).toBeInTheDocument()
  })
})

describe('incomplete data warning', () => {
  test('renders a warning when show is true', async () => {
    const props = getSecurityCenterOverviewDashboardProps()
    render(<SecurityCenterOverviewSplitDashboard {...props} incompleteDataWarning={{show: true, docHref: 'mydoc'}} />)

    expect(within(screen.getByTestId('incomplete-data-warning')).getByRole('link')).toHaveAttribute('href', 'mydoc')
  })

  test('does not render a warning when show is false', async () => {
    const props = getSecurityCenterOverviewDashboardProps()
    render(<SecurityCenterOverviewSplitDashboard {...props} incompleteDataWarning={{show: false}} />)

    expect(screen.queryByTestId('incomplete-data-warning')).not.toBeInTheDocument()
  })

  it('renders with security tip', () => {
    const props = getSecurityCenterOverviewDashboardProps()
    render(<SecurityCenterOverviewSplitDashboard {...props} showOnboardingBanner={true} scope="organization" />)

    expect(screen.getByTestId('tip-message').textContent).toBe(
      'Uncover insights to help prioritize efforts in your AppSec program and share progress with the various stakeholders across your organization with detailed reporting in a security overview.',
    )

    expect(screen.getByTestId('tip-return-link').getAttribute('href')).toBe(
      '/orgs/my-org/organization_onboarding/advanced_security',
    )
  })

  it('renders without security tip', () => {
    const props = getSecurityCenterOverviewDashboardProps()
    render(<SecurityCenterOverviewSplitDashboard {...props} />)

    expect(screen.queryByTestId('tip-message')).not.toBeInTheDocument()

    expect(screen.queryByTestId('tip-return-link')).not.toBeInTheDocument()
  })
})
