import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import AutoPayEnabledCard from '../../../components/payment_due/AutoPayEnabledCard'

import type {PaymentDueCardProps} from '../../../components/payment_due/PaymentDueCard'

const DEFAULT_PROPS: PaymentDueCardProps = {
  latestBillAmount: 100.12,
  nextPaymentDate: 'Feb 15, 2025',
  autoPay: true,
  hasBill: true,
  overdue: false,
  meteredViaAzure: false,
}

describe('AutoPayEnabledCard', () => {
  test('renders card', () => {
    render(<AutoPayEnabledCard {...DEFAULT_PROPS} />)

    const autoPayEnabledCard = screen.getByTestId('auto-pay-enabled-payment-due-card')
    expect(autoPayEnabledCard).toBeInTheDocument()
  })

  test('renders latest bill balance', () => {
    render(<AutoPayEnabledCard {...DEFAULT_PROPS} />)

    const latestBillAmount = screen.getByText(`$${DEFAULT_PROPS.latestBillAmount}`)
    expect(latestBillAmount).toBeInTheDocument()
  })

  test('Shows payment history', () => {
    render(<AutoPayEnabledCard {...DEFAULT_PROPS} />)

    const paymentHistoryLink = screen.getByText('Payment history')
    expect(paymentHistoryLink).toBeInTheDocument()
  })

  describe('#overdue', () => {
    test('Renders next payment date', () => {
      render(<AutoPayEnabledCard {...DEFAULT_PROPS} overdue />)

      const nextPaymentDate = screen.getByText(/Your next payment is scheduled for/)
      expect(nextPaymentDate).toBeInTheDocument()
    })

    test('Shows overdue label when overdue', () => {
      render(<AutoPayEnabledCard {...DEFAULT_PROPS} overdue />)

      const overdueLabel = screen.getByText('Overdue')
      expect(overdueLabel).toBeInTheDocument()
    })

    test('Hides overdue label when not overdue', () => {
      render(<AutoPayEnabledCard {...DEFAULT_PROPS} overdue={false} />)

      const overdueLabel = screen.queryByText('Overdue')
      expect(overdueLabel).toBeNull()
    })
  })

  describe('#meteredViaAzure', () => {
    test('renders metered via Azure copy when meteredViaAzure is true', () => {
      render(<AutoPayEnabledCard {...DEFAULT_PROPS} meteredViaAzure />)

      const meteredViaAzureCopy = screen.getByText('Metered usage billed via Azure is not included.')
      expect(meteredViaAzureCopy).toBeInTheDocument()
    })

    test('hides metered via Azure copy when meteredViaAzure is false', () => {
      render(<AutoPayEnabledCard {...DEFAULT_PROPS} meteredViaAzure={false} />)

      const meteredViaAzureCopy = screen.queryByText('Metered usage billed via Azure is not included.')
      expect(meteredViaAzureCopy).toBeNull()
    })
  })
})
