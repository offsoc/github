import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'

import {GetUsageReportDialog} from '../../../components/usage'

import {USAGE_REPORT_SELECTIONS, USAGE_REPORT_SELECTIONS_WITH_LEGACY} from '../../../test-utils/mock-data'

describe('GetUsageReportDialog', () => {
  test('Opens dialog when usage report button clicked', async () => {
    render(
      <GetUsageReportDialog
        currentUserEmail="test@github.com"
        usageReportSelections={USAGE_REPORT_SELECTIONS}
        billingPlatformEnabledProducts={['Actions']}
      />,
    )

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => {
      screen.getByText('Get usage report').click()
    })
    await expect(screen.getByRole('dialog')).toBeVisible()
  })

  describe('enabled products display text', () => {
    test('Renders enabled products text when one product enabled', async () => {
      render(
        <GetUsageReportDialog
          currentUserEmail="test@github.com"
          usageReportSelections={USAGE_REPORT_SELECTIONS}
          billingPlatformEnabledProducts={['Actions']}
        />,
      )

      await expect(screen.queryByTestId('usage-report-dialog-header')).not.toBeInTheDocument()
      act(() => {
        screen.getByText('Get usage report').click()
      })
      await expect(screen.getByTestId('usage-report-enabled-products-text')).toHaveTextContent('Actions')
    })

    test('Renders enabled products text when two products enabled', async () => {
      render(
        <GetUsageReportDialog
          currentUserEmail="test@github.com"
          usageReportSelections={USAGE_REPORT_SELECTIONS}
          billingPlatformEnabledProducts={['Actions', 'Copilot']}
        />,
      )

      await expect(screen.queryByTestId('usage-report-dialog-header')).not.toBeInTheDocument()
      act(() => {
        screen.getByText('Get usage report').click()
      })
      await expect(screen.getByTestId('usage-report-enabled-products-text')).toHaveTextContent('Actions and Copilot')
    })

    test('Renders enabled products text when three products enabled', async () => {
      render(
        <GetUsageReportDialog
          currentUserEmail="test@github.com"
          usageReportSelections={USAGE_REPORT_SELECTIONS}
          billingPlatformEnabledProducts={['Actions', 'Copilot', 'Ghec']}
        />,
      )

      await expect(screen.queryByTestId('usage-report-dialog-header')).not.toBeInTheDocument()
      act(() => {
        screen.getByText('Get usage report').click()
      })
      await expect(screen.getByTestId('usage-report-enabled-products-text')).toHaveTextContent(
        'Actions, Copilot and Ghec',
      )
    })

    test('Renders enabled products text when four products enabled', async () => {
      render(
        <GetUsageReportDialog
          currentUserEmail="test@github.com"
          usageReportSelections={USAGE_REPORT_SELECTIONS}
          billingPlatformEnabledProducts={['Actions', 'Copilot', 'Enterprise', 'Advanced security']}
        />,
      )

      await expect(screen.queryByTestId('usage-report-dialog-header')).not.toBeInTheDocument()
      act(() => {
        screen.getByText('Get usage report').click()
      })
      await expect(screen.getByTestId('usage-report-enabled-products-text')).toHaveTextContent(
        'Actions, Copilot, Enterprise and Advanced security',
      )
    })
  })

  test('usage report copy', async () => {
    render(
      <GetUsageReportDialog
        currentUserEmail="test@github.com"
        usageReportSelections={USAGE_REPORT_SELECTIONS}
        billingPlatformEnabledProducts={['Actions']}
      />,
    )

    await expect(screen.queryByTestId('usage-report-dialog-header')).not.toBeInTheDocument()
    act(() => {
      screen.getByText('Get usage report').click()
    })

    expect(
      screen.getByText(
        /Please note that updates to organization name, repository name, and username fields may take up to 24 hours/,
      ),
    ).toBeInTheDocument()
  })

  describe('legacy report option', () => {
    test('legacy report option visible when its a selection', async () => {
      const {user} = render(
        <GetUsageReportDialog
          currentUserEmail="test@github.com"
          usageReportSelections={USAGE_REPORT_SELECTIONS_WITH_LEGACY}
          billingPlatformEnabledProducts={['Actions']}
        />,
      )

      await user.click(screen.getByText('Get usage report'))
      expect(screen.getByTestId('report-control-id-legacy')).toBeInTheDocument()

      expect(
        screen.getByText(/Your enterprise account has transitioned to the enhanced billing platform on/),
      ).toBeInTheDocument()
    })

    test('hide vnext text when legacy report is clicked', async () => {
      const {user} = render(
        <GetUsageReportDialog
          currentUserEmail="test@github.com"
          usageReportSelections={USAGE_REPORT_SELECTIONS_WITH_LEGACY}
          billingPlatformEnabledProducts={['Actions']}
          vnextMigrationDate="Aug 1, 2022"
        />,
      )

      await user.click(screen.getByText('Get usage report'))
      await user.click(screen.getByText('Legacy Report'))

      expect(screen.queryByText(/A detailed report will be generated including usage for /)).not.toBeInTheDocument()
      expect(screen.queryByText(/Please note that updates to organization name /)).not.toBeInTheDocument()
    })
  })

  describe('disabled usage reports', () => {
    test('Renders alert banner when usage reports are disabled', async () => {
      render(
        <GetUsageReportDialog
          currentUserEmail="test@github.com"
          usageReportSelections={USAGE_REPORT_SELECTIONS}
          billingPlatformEnabledProducts={['Actions']}
          disableUsageReports
        />,
      )

      await expect(screen.queryByTestId('disable-usage-report-banner')).not.toBeInTheDocument()
      act(() => {
        screen.getByText('Get usage report').click()
      })
      await expect(screen.getByTestId('disable-usage-report-banner')).toBeInTheDocument()
    })

    test('Disable button when usage reports are disabled', async () => {
      render(
        <GetUsageReportDialog
          currentUserEmail="test@github.com"
          usageReportSelections={USAGE_REPORT_SELECTIONS}
          billingPlatformEnabledProducts={['Actions']}
          disableUsageReports
        />,
      )

      await expect(screen.queryByTestId('disable-usage-report-banner')).not.toBeInTheDocument()
      act(() => {
        screen.getByText('Get usage report').click()
      })
      await expect(
        screen.getByRole('button', {
          name: /Email usage report/i,
        }),
      ).toBeDisabled()
    })
  })
})
