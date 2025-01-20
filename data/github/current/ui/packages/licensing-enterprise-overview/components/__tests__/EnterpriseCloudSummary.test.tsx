import {render, screen} from '@testing-library/react'
import {NavigationContextProvider} from '../../contexts/NavigationContext'
import {EnterpriseCloudSummary} from '../EnterpriseCloudSummary'
import {getEnterpriseCloudSummaryProps} from '../../test-utils/mock-data'

const renderEnterpriseCloudSummary = (overrideProps = {}) => {
  return render(
    <NavigationContextProvider enterpriseContactUrl={'/enterprise-contact-url'} isStafftools={false} slug={'test-co'}>
      <EnterpriseCloudSummary {...getEnterpriseCloudSummaryProps()} {...overrideProps} />
    </NavigationContextProvider>,
  )
}

describe('EnterpriseCloudSummary Component', () => {
  test('Current payment displays correct amount', () => {
    renderEnterpriseCloudSummary({currentPayment: 1000})
    expect(screen.getByText('1000')).toBeInTheDocument()
  })

  describe('Variant: Active (No Trial)', () => {
    test('renders summary card with active state', () => {
      renderEnterpriseCloudSummary({trialInfo: undefined})

      const trialLabelEl = screen.queryByTestId('summary-card-active-trial-label')
      expect(trialLabelEl).not.toBeInTheDocument()
    })

    test('renders active footer', () => {
      renderEnterpriseCloudSummary({
        billingTermEndDate: new Date('2024-05-12T00:00:00.000-07:00'),
        trialInfo: undefined,
      })

      const footerEl = screen.queryByTestId('ghe-summary-active-footer')
      expect(footerEl).toBeInTheDocument()
      expect(footerEl).toHaveTextContent('Billing date on May 12, 2024.')
    })
  })

  describe('Variant: Active Trial', () => {
    const activeTrialInfo = {
      isActive: true,
      expirationDate: new Date('2024-05-12T00:00:00.000-07:00'),
      trialLicensesAllowed: 42,
    }

    test('renders card with active trial state', () => {
      renderEnterpriseCloudSummary({trialInfo: activeTrialInfo})

      const trialLabelEl = screen.queryByTestId('summary-card-label-trial')
      expect(trialLabelEl).toBeInTheDocument()
    })

    test('renders trial footer', () => {
      renderEnterpriseCloudSummary({trialInfo: activeTrialInfo})

      const footerEl = screen.queryByTestId('ghe-summary-trial-footer')
      expect(footerEl).toBeInTheDocument()
      expect(footerEl).toHaveTextContent('Trial ends on May 12, 2024.')
    })
  })

  describe('Variant: Expired Trial', () => {
    const expiredTrialInfo = {
      isActive: false,
      expirationDate: new Date('2024-05-12T00:00:00.000-07:00'),
    }

    test('renders card with expired trial state', () => {
      renderEnterpriseCloudSummary({trialInfo: expiredTrialInfo})

      const trialLabelEl = screen.queryByTestId('summary-card-label-trial-expired')
      expect(trialLabelEl).toBeInTheDocument()
    })

    test('when trialInfo is provided, renders trial footer', () => {
      renderEnterpriseCloudSummary({trialInfo: expiredTrialInfo})

      const footerEl = screen.queryByTestId('ghe-summary-trial-footer')
      expect(footerEl).toBeInTheDocument()
      expect(footerEl).toHaveTextContent('Trial ended on May 12, 2024.')
    })
  })

  describe('Payment Info', () => {
    test('payment info section is shown for self-serve', () => {
      renderEnterpriseCloudSummary({isSelfServe: true})
      expect(screen.getByTestId('payment-info')).toBeInTheDocument()
    })

    test('payment info section is not shown for non-self-serve', () => {
      renderEnterpriseCloudSummary({isSelfServe: false})
      expect(screen.queryByTestId('payment-info')).not.toBeInTheDocument()
    })
  })
})
