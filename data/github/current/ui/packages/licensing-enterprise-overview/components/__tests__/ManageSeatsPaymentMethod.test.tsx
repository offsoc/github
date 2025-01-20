import {render, screen} from '@testing-library/react'
import {NavigationContextProvider} from '../../contexts/NavigationContext'
import {type Props as ManageSeatsPaymentMethodProps, ManageSeatsPaymentMethod} from '../ManageSeatsPaymentMethod'

const defaultProps: ManageSeatsPaymentMethodProps = {
  paymentMethod: {
    credit_card: true,
    card_type: 'Visa',
    last_four: '1234',
    paypal: undefined,
  },
}
const renderPaymentMethod = (overrideProps = {}) => {
  return render(
    <NavigationContextProvider enterpriseContactUrl={'/enterprise-contact-url'} isStafftools={false} slug={'test-co'}>
      <ManageSeatsPaymentMethod {...defaultProps} {...overrideProps} />
    </NavigationContextProvider>,
  )
}

describe('ManageSeatsPaymentMethod Component', () => {
  test('when credit card set up, renders payment info and edit link', () => {
    renderPaymentMethod({
      paymentMethod: {
        credit_card: true,
        card_type: 'Visa',
        last_four: '1234',
      },
    })

    const paymentInfoEl = screen.queryByTestId('payment-info')
    expect(paymentInfoEl).toBeInTheDocument()
    expect(paymentInfoEl).toHaveTextContent('Visa •••• 1234')

    const editLinkEl = screen.queryByTestId('payment-info-edit-link')
    expect(editLinkEl).toBeInTheDocument()
    expect(editLinkEl).toHaveTextContent('Edit Payment')
    expect(editLinkEl).toHaveAttribute(
      'href',
      '/enterprises/test-co/settings/billing/payment_information#payment-method',
    )
  })

  test('when paypal set up, renders payment info and edit link', () => {
    renderPaymentMethod({
      paymentMethod: {
        paypal: true,
      },
    })

    const paymentInfoEl = screen.queryByTestId('payment-info')
    expect(paymentInfoEl).toBeInTheDocument()
    expect(paymentInfoEl).toHaveTextContent('PayPal')

    const editLinkEl = screen.queryByTestId('payment-info-edit-link')
    expect(editLinkEl).toBeInTheDocument()
    expect(editLinkEl).toHaveTextContent('Edit Payment')
    expect(editLinkEl).toHaveAttribute(
      'href',
      '/enterprises/test-co/settings/billing/payment_information#payment-method',
    )
  })

  test('when not set up, renders setup link and no payment type label', () => {
    renderPaymentMethod({
      paymentMethod: {
        credit_card: undefined,
        paypal: undefined,
      },
    })

    const paymentInfoEl = screen.queryByTestId('payment-info')
    expect(paymentInfoEl).not.toBeInTheDocument()

    const editLinkEl = screen.queryByTestId('payment-info-edit-link')
    expect(editLinkEl).toBeInTheDocument()
    expect(editLinkEl).toHaveTextContent('Set up payment')
  })
})
