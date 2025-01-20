import {fireEvent, render, screen} from '@testing-library/react'
import {setupUserEvent} from '@github-ui/react-core/test-utils'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {type ManageSeatsProps, ManageSeats} from '../ManageSeats'
import {getPaymentMethod} from '../../test-utils/mock-data'
import {NavigationContextProvider} from '../../contexts/NavigationContext'

const defaultProps: ManageSeatsProps = {
  currentPrice: '$0.00',
  isMonthlyPlan: true,
  isTrial: false,
  paymentMethod: getPaymentMethod(),
  onCancelClick: jest.fn(),
  onSaveClick: jest.fn(),
  seatsPurchased: 20,
  seatsConsumed: 10,
}
const analyticsMetadata = {}
const renderManageSeats = (overrideProps = {}) => {
  return render(
    <AnalyticsProvider appName={'test-app'} category="test-analytics-category" metadata={analyticsMetadata}>
      <NavigationContextProvider enterpriseContactUrl={'/enterprise-contact-url'} isStafftools={false} slug={'test-co'}>
        <ManageSeats {...defaultProps} {...overrideProps} />
      </NavigationContextProvider>
    </AnalyticsProvider>,
  )
}

describe('ManageSeats Component', () => {
  test('renders with default props', () => {
    renderManageSeats()

    expect(screen.getByTestId('manage-seats')).toBeInTheDocument()

    const paymentTermLabel = screen.getByTestId('payment-term-label')
    expect(paymentTermLabel).toBeInTheDocument()

    const newSeatsInput = screen.getByTestId('new-seats-input')
    expect(newSeatsInput).toBeInTheDocument()
    expect(newSeatsInput).toHaveValue(defaultProps.seatsPurchased)

    const addSeatButton = screen.getByTestId('add-seat-button')
    expect(addSeatButton).toBeInTheDocument()

    const removeSeatButton = screen.getByTestId('remove-seat-button')
    expect(removeSeatButton).toBeInTheDocument()

    const saveButton = screen.getByTestId('manage-seats-save-button')
    expect(saveButton).toBeInTheDocument()

    const cancelButton = screen.getByTestId('manage-seats-cancel-button')
    expect(cancelButton).toBeInTheDocument()
  })

  test('Shows correct payment term label for monthly plan', () => {
    renderManageSeats({isMonthlyPlan: true, isTrial: false})
    expect(screen.getByTestId('payment-term-label')).toHaveTextContent('Monthly payment')
  })

  test('Shows correct payment term label for yearly plan', () => {
    renderManageSeats({isMonthlyPlan: false, isTrial: false})
    expect(screen.getByTestId('payment-term-label')).toHaveTextContent('Yearly payment')
  })

  test('Shows correct payment term label for estimated monthly payment in trial', () => {
    renderManageSeats({isMonthlyPlan: true, isTrial: true})
    expect(screen.getByTestId('payment-term-label')).toHaveTextContent('Estimated monthly payment')
  })

  test('Shows correct payment term label for estimated yearly payment in trial', () => {
    renderManageSeats({isMonthlyPlan: false, isTrial: true})
    expect(screen.getByTestId('payment-term-label')).toHaveTextContent('Estimated yearly payment')
  })

  test('handles seat addition correctly', () => {
    renderManageSeats()

    fireEvent.click(screen.getByTestId('add-seat-button'))

    expect(screen.getByTestId('new-seats-input')).toHaveValue(defaultProps.seatsPurchased + 1)
  })

  test('handles seat removal correctly', () => {
    renderManageSeats()

    fireEvent.click(screen.getByTestId('remove-seat-button'))

    expect(screen.getByTestId('new-seats-input')).toHaveValue(defaultProps.seatsPurchased - 1)
  })

  test('handles max seats during trial correctly', () => {
    renderManageSeats({isTrial: true, seatsPurchased: 50})

    fireEvent.click(screen.getByTestId('add-seat-button'))

    expect(screen.getByTestId('new-seats-input')).toHaveValue(50)
    expect(screen.getByText(/You may have a maximum of 50 seats during your trial/)).toBeInTheDocument()
  })

  test('handles at-least-one-seat rule correctly', () => {
    renderManageSeats({seatsPurchased: 1, seatsConsumed: 1})

    fireEvent.click(screen.getByTestId('remove-seat-button'))

    expect(screen.getByTestId('new-seats-input')).toHaveValue(1)
    expect(screen.getByText(/You need at least 1 seat/)).toBeInTheDocument()
  })

  test('prevents lowering seats beneath consumed count', () => {
    renderManageSeats({seatsPurchased: 3, seatsConsumed: 3})

    fireEvent.click(screen.getByTestId('remove-seat-button'))

    expect(screen.getByTestId('new-seats-input')).toHaveValue(3)
    expect(screen.getByText(/You need at least 3 seats/)).toBeInTheDocument()
  })

  test('prevents increase of more than 300', async () => {
    renderManageSeats({seatsPurchased: 100})

    const field = screen.getByTestId('new-seats-input')
    const user = setupUserEvent()
    await user.type(field, '401')
    await user.tab() // validation happens on blur

    expect(field).toHaveValue(400)
    expect(screen.getByText(/You can only add or remove up to 300 seats at a time/)).toBeInTheDocument()
  })

  test('calls onSaveClick with valid seat count', () => {
    const onSaveClick = jest.fn()
    renderManageSeats({onSaveClick})

    fireEvent.click(screen.getByTestId('manage-seats-save-button'))

    expect(onSaveClick).toHaveBeenCalledWith(defaultProps.seatsPurchased)
  })

  test('calls onCancelClick', () => {
    const onCancelClick = jest.fn()
    renderManageSeats({onCancelClick})

    fireEvent.click(screen.getByTestId('manage-seats-cancel-button'))

    expect(onCancelClick).toHaveBeenCalled()
  })

  test('sends analytics event on seat addition', async () => {
    renderManageSeats()

    fireEvent.click(screen.getByTestId('add-seat-button'))

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'enterprise_account_manage_seats',
        action: 'click_to_increase_seats_number',
        label: 'ref_cta:increase_seats_number;ref_loc:enterprise_licensing',
      },
    })
  })

  test('sends analytics event on seat removal', async () => {
    renderManageSeats()

    fireEvent.click(screen.getByTestId('remove-seat-button'))

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'enterprise_account_manage_seats',
        action: 'click_to_decrease_seats_number',
        label: 'ref_cta:decrease_seats_number;ref_loc:enterprise_licensing',
      },
    })
  })

  test('sends analytics event on seat input click', async () => {
    renderManageSeats()

    fireEvent.click(screen.getByTestId('new-seats-input'))

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'enterprise_account_manage_seats',
        action: 'click_on_seats_input',
        label: 'ref_cta:seats_input;ref_loc:enterprise_licensing',
      },
    })
  })
})
