import {Octicon, Link} from '@primer/react'
import {CreditCardIcon} from '@primer/octicons-react'
import {useNavigation} from '../contexts/NavigationContext'
import type {PaymentMethod} from '../types/payment-method'

export interface Props {
  paymentMethod: PaymentMethod
}

export function ManageSeatsPaymentMethod({paymentMethod}: Props) {
  const {basePath} = useNavigation()

  const isSetUp = paymentMethod?.credit_card || paymentMethod?.paypal
  const paymentInfo = isSetUp
    ? paymentMethod?.credit_card
      ? `${paymentMethod.card_type} •••• ${paymentMethod.last_four}`
      : 'PayPal'
    : null

  const linkText = isSetUp ? 'Edit Payment' : 'Set up payment'
  const linkUrl = `${basePath}/settings/billing/payment_information#payment-method`

  return (
    <span className="text-small color-fg-muted">
      <Octicon icon={CreditCardIcon} className="mr-2" />
      {isSetUp && (
        <span className="mr-2" data-testid="payment-info">
          {paymentInfo}
        </span>
      )}
      <Link href={linkUrl} data-testid="payment-info-edit-link">
        {linkText}
      </Link>
    </span>
  )
}
