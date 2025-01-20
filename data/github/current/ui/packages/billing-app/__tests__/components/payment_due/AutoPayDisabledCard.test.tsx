import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import AutoPayDisabledCard from '../../../components/payment_due/AutoPayDisabledCard'

import type {PaymentDueCardProps} from '../../../components/payment_due/PaymentDueCard'

const DEFAULT_PROPS: PaymentDueCardProps = {
  latestBillAmount: 100.12,
  nextPaymentDate: 'Feb 15, 2025',
  autoPay: true,
  hasBill: true,
  overdue: false,
  meteredViaAzure: false,
}

describe('AutoPayDisabledCard', () => {
  test('renders card', () => {
    render(<AutoPayDisabledCard {...DEFAULT_PROPS} />)

    const autoPayEnabledCard = screen.getByTestId('auto-pay-disabled-payment-due-card')
    expect(autoPayEnabledCard).toBeInTheDocument()
  })

  test('renders latest bill balance', () => {
    render(<AutoPayDisabledCard {...DEFAULT_PROPS} />)

    const latestBillAmount = screen.getByText(`$${DEFAULT_PROPS.latestBillAmount}`)
    expect(latestBillAmount).toBeInTheDocument()
  })

  test('Shows recurring payments disabled copy', () => {
    render(<AutoPayDisabledCard {...DEFAULT_PROPS} />)

    const recurringPaymentsCopy = screen.getByText(/recurring payments are disabled/)
    expect(recurringPaymentsCopy).toBeInTheDocument()
  })

  describe('#hasBill', () => {
    test('shows pay now button when hasBill is true', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} hasBill />)

      const payNowButton = screen.getByText('Pay now')
      expect(payNowButton).toBeInTheDocument()
    })

    test('hides pay now button when hasBill is false', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} hasBill={false} />)

      const payNowButton = screen.queryByText('Pay now')
      expect(payNowButton).toBeNull()
    })

    test('shows payment due date when hasBill and not overdue', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} hasBill overdue={false} />)

      const payNowButton = screen.getByText('by Feb 15, 2025')
      expect(payNowButton).toBeInTheDocument()
    })

    test('hides payment due date when hasBill but overdue', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} hasBill overdue />)

      const payNowButton = screen.queryByText('by Feb 15, 2025')
      expect(payNowButton).toBeNull()
    })

    test('hides payment due date when not hasBill and not overdue', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} hasBill={false} overdue={false} />)

      const payNowButton = screen.queryByText('by Feb 15, 2025')
      expect(payNowButton).toBeNull()
    })
  })

  describe('#overdue', () => {
    test('Shows overdue label when overdue', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} overdue />)

      const overdueLabel = screen.getByText('Overdue')
      expect(overdueLabel).toBeInTheDocument()
    })

    test('Hides overdue label when not overdue', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} overdue={false} />)

      const overdueLabel = screen.queryByText('Overdue')
      expect(overdueLabel).toBeNull()
    })
  })

  describe('#meteredViaAzure', () => {
    test('renders metered via Azure copy when meteredViaAzure is true', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} meteredViaAzure />)

      const meteredViaAzureCopy = screen.getByText('Metered usage billed via Azure is not included.')
      expect(meteredViaAzureCopy).toBeInTheDocument()
    })

    test('hides metered via Azure copy when meteredViaAzure is false', () => {
      render(<AutoPayDisabledCard {...DEFAULT_PROPS} meteredViaAzure={false} />)

      const meteredViaAzureCopy = screen.queryByText('Metered usage billed via Azure is not included.')
      expect(meteredViaAzureCopy).toBeNull()
    })
  })
})
