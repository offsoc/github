import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import PaymentDueCard from '../../../components/payment_due/PaymentDueCard'

import type {PaymentDueCardProps} from '../../../components/payment_due/PaymentDueCard'

const DEFAULT_PROPS: PaymentDueCardProps = {
  latestBillAmount: 100.12,
  nextPaymentDate: 'Feb 15, 2025',
  autoPay: true,
  hasBill: true,
  overdue: false,
  meteredViaAzure: false,
}

describe('PaymentDueCard', () => {
  test('renders auto pay enabled card when auto pay is enabled', () => {
    render(<PaymentDueCard {...DEFAULT_PROPS} autoPay={true} />)

    const autoPayEnabledCard = screen.getByTestId('auto-pay-enabled-payment-due-card')
    expect(autoPayEnabledCard).toBeInTheDocument()

    const autoPayDisabledCard = screen.queryByTestId('auto-pay-disabled-payment-due-card')
    expect(autoPayDisabledCard).toBeNull()
  })

  test('renders auto pay disabled card when auto pay is disabled', () => {
    render(<PaymentDueCard {...DEFAULT_PROPS} autoPay={false} />)

    const autoPayDisabledCard = screen.getByTestId('auto-pay-disabled-payment-due-card')
    expect(autoPayDisabledCard).toBeInTheDocument()

    const autoPayEnabledCard = screen.queryByTestId('auto-pay-enabled-payment-due-card')
    expect(autoPayEnabledCard).toBeNull()
  })
})
