import {useState} from 'react'
import {screen, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {SeatAssignmentPolicy} from '../SeatAssignmentPolicy'
import type {CopilotForBusinessTrial, PlanText} from '../../../types'
import {CopilotForBusinessSeatPolicy} from '../../../types'
import {getSeatManagementRoutePayload} from '../../../test-utils/mock-data'

jest.setTimeout(20_000)
const payload = getSeatManagementRoutePayload()

const TestSeatAssignmentPolicy = (props: {
  policy?: CopilotForBusinessSeatPolicy
  policyChangeIntent?: 'remove' | 'add' | null
  membersCount?: number
  seatCount?: number
  businessTrial?: CopilotForBusinessTrial
  planText?: PlanText
  emptyState?: boolean
}) => {
  const policy = props.policy ?? CopilotForBusinessSeatPolicy.Disabled
  const policyIntent = props.policyChangeIntent ?? null
  const membersCount = props.membersCount ?? payload.members_count
  const seatCount = props.seatCount ?? 4
  const businessTrial = props.businessTrial
  const planText = props.planText ?? payload.plan_text
  const [selectedPolicy, setSelectedPolicy] = useState(policy)
  const [currentPolicy, setCurrentPolicy] = useState(policy)
  const setPayload = jest.fn()
  const emptyState = props.emptyState ?? false

  return (
    <SeatAssignmentPolicy
      organization={{name: 'SomeOrg', id: 1, billable: true, has_seat: true, add_seat_link: null}}
      currentPolicy={currentPolicy}
      setCurrentPolicy={setCurrentPolicy}
      selectedPolicy={selectedPolicy}
      setSelectedPolicy={setSelectedPolicy}
      seatCount={seatCount}
      setPayload={setPayload}
      seatBreakdown={payload.seat_breakdown}
      setPolicyChangeIntent={jest.fn()}
      policyChangeIntent={policyIntent}
      membersCount={membersCount}
      businessTrial={businessTrial}
      nextBillingDate={payload.next_billing_date}
      planText={planText}
      emptyState={emptyState}
    />
  )
}

describe('SeatAssignmentPolicy component', () => {
  it('renders with the proper radio button checked', () => {
    render(<TestSeatAssignmentPolicy />)
    fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
    const disableRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
    expect(disableRadio).toBeChecked()
  })

  it('renders with the correct number of available members', () => {
    render(<TestSeatAssignmentPolicy />)
    fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
    expect(screen.getByText('All members of the organization')).toBeInTheDocument()
  })

  it('correctly changes the radio button when each option is clicked', async () => {
    const {user} = render(<TestSeatAssignmentPolicy />)

    const policyButton = screen.getByTestId('seat-assignment-policy-action')

    await user.click(policyButton)
    const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
    await user.click(enableAllRadio)
    expect(screen.getByText('Enabled for: All members of the organization')).toBeVisible()

    await user.click(policyButton)
    const enableSelectedRadio = screen.getByTestId(
      `seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForSelected}`,
    )
    await user.click(enableSelectedRadio)
    expect(screen.getByText('Enabled for: Selected members')).toBeVisible()

    await user.click(policyButton)
    const disableRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
    await user.click(disableRadio)
    expect(policyButton).toHaveTextContent('Disabled')
  })

  it('posts to the update endpoint when a new option is checked', async () => {
    const {user} = render(<TestSeatAssignmentPolicy policy={CopilotForBusinessSeatPolicy.EnabledForSelected} />)
    await user.click(screen.getByTestId('seat-assignment-policy-action'))
    const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
    await user.click(enableAllRadio)
    const confirmButton = screen.getByRole('button', {name: 'Purchase seats'})
    await user.click(confirmButton)

    const expectedData = {
      copilot_permissions: CopilotForBusinessSeatPolicy.EnabledForAll,
      keep: false,
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith(
      '/organizations/SomeOrg/settings/copilot/seat_management_permissions_json',
      {
        method: 'POST',
        body: JSON.stringify(expectedData),
        headers: expect.any(Object),
      },
    )
  })

  // This test is currently failing and needs to be fixed
  it.skip('does not post when the current policy is still checked', async () => {
    const {user} = render(<TestSeatAssignmentPolicy />)
    await user.click(screen.getByTestId('seat-assignment-policy-action'))

    mockFetch.clear()
    const disabledRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
    await user.click(disabledRadio)

    expect(mockFetch.fetch).not.toHaveBeenCalled()
  })
})

describe('Policy change dialog', () => {
  describe('when changing the policy from disabled to allow all', () => {
    it('shows the purchase seats dialog when there are no existing seats', () => {
      render(
        <TestSeatAssignmentPolicy seatCount={0} policy={CopilotForBusinessSeatPolicy.Disabled} planText="Business" />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
      fireEvent.click(enableAllRadio)

      screen.getByText('Confirm seats purchase for all members')
      screen.getByText('You will be adding 4 Copilot seats to your monthly bill.')
      screen.getByText('Estimated monthly cost is $76.00 ($19/month each seat).')
      const purchaseSeats = screen.getByRole('button', {name: 'Purchase 4 seats'})
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent

      expect(purchaseSeats).toBeInTheDocument()
      expect(nextPaymentTotal).toContain('$76.00')
    })

    it('shows the purchase seats dialog with the correct number of new seats', () => {
      render(
        <TestSeatAssignmentPolicy seatCount={2} policy={CopilotForBusinessSeatPolicy.Disabled} planText="Business" />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
      fireEvent.click(enableAllRadio)

      screen.getByText('Confirm seats purchase for all members')
      screen.getByText('You will be adding 2 Copilot seats to your monthly bill.')
      screen.getByText('Estimated monthly cost is $76.00 ($19/month each seat).')
      const purchaseSeats = screen.getByRole('button', {name: 'Purchase 2 seats'})
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent

      expect(purchaseSeats).toBeInTheDocument()
      expect(nextPaymentTotal).toContain('$76.00')
    })

    it('shows a modal summarizing the Copilot Business trial and number of seats that will be added', () => {
      const endDate = String('2023-12-31T00:00:00')
      const trial = {
        has_trial: true,
        active: true,
        ends_at: endDate,
        copilot_plan: 'business',
      } as CopilotForBusinessTrial
      render(
        <TestSeatAssignmentPolicy seatCount={0} businessTrial={trial} policy={CopilotForBusinessSeatPolicy.Disabled} />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
      fireEvent.click(enableAllRadio)
      screen.getByText('Confirm seats purchase for all members')
      screen.getByText('You will be adding 4 Copilot seats.')
      screen.getByText('You will not be charged until 31 December 2023.')
      const purchaseSeats = screen.getByRole('button', {name: 'Purchase 4 seats'})

      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the Copilot Enterprise trial and number of seats that will be added', () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'enterprise',
      } as CopilotForBusinessTrial
      render(
        <TestSeatAssignmentPolicy seatCount={0} businessTrial={trial} policy={CopilotForBusinessSeatPolicy.Disabled} />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
      fireEvent.click(enableAllRadio)
      screen.getByText('Confirm seats purchase for all members')
      screen.getByText('You will be adding 4 Copilot seats to your monthly bill.')
      screen.getByText('Estimated monthly cost is $76.00 ($19/month each seat).')
      const purchaseSeats = screen.getByRole('button', {name: 'Purchase 4 seats'})
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent

      expect(purchaseSeats).toBeInTheDocument()
      expect(nextPaymentTotal).toContain('$76.00')
    })
  })

  describe('when changing the policy from disabled to selected', () => {
    it('does not show the confirmation dialog when there are no seats', () => {
      render(<TestSeatAssignmentPolicy seatCount={0} />)
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableSelectedRadio = screen.getByTestId(
        `seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForSelected}`,
      )
      fireEvent.click(enableSelectedRadio)

      const scratchButton = screen.queryByTestId('scratch-button')
      expect(scratchButton).not.toBeInTheDocument()
      const keepButton = screen.queryByTestId('keep-button')
      expect(keepButton).not.toBeInTheDocument()
    })

    it('shows the confirmation dialog when there are seats pending for cancellation', () => {
      render(<TestSeatAssignmentPolicy />)
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableSelectedRadio = screen.getByTestId(
        `seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForSelected}`,
      )
      fireEvent.click(enableSelectedRadio)

      const scratchButton = screen.getByTestId('scratch-button')
      expect(scratchButton).toBeInTheDocument()
      const keepButton = screen.getByTestId('keep-button')
      expect(keepButton.textContent).toBe('Renew seats')
      const cost = screen.getByTestId('confirmation-policy-expected-cost')
      expect(cost.textContent).toBe('4 seats with an approximate cost of $76.00')
    })

    it('shows the confirmation dialog and the estimated cost correctly when on Copilot Business trial', () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'business',
      } as CopilotForBusinessTrial
      render(<TestSeatAssignmentPolicy businessTrial={trial} />)
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableSelectedRadio = screen.getByTestId(
        `seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForSelected}`,
      )
      fireEvent.click(enableSelectedRadio)

      const scratchButton = screen.getByTestId('scratch-button')
      expect(scratchButton).toBeInTheDocument()
      const keepButton = screen.getByTestId('keep-button')
      expect(keepButton.textContent).toBe('Renew seats')
      const cost = screen.getByTestId('confirmation-policy-expected-cost')
      expect(cost.textContent).toContain('4 seats with an approximate cost of $0.00')
    })

    it('shows the confirmation dialog and the estimated cost correctly when on Copilot Enterprise trial', () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'enterprise',
      } as CopilotForBusinessTrial
      render(<TestSeatAssignmentPolicy businessTrial={trial} />)
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableSelectedRadio = screen.getByTestId(
        `seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForSelected}`,
      )
      fireEvent.click(enableSelectedRadio)

      const scratchButton = screen.getByTestId('scratch-button')
      expect(scratchButton).toBeInTheDocument()
      const keepButton = screen.getByTestId('keep-button')
      expect(keepButton.textContent).toBe('Renew seats')
      const cost = screen.getByTestId('confirmation-policy-expected-cost')
      expect(cost.textContent).toBe('4 seats with an approximate cost of $76.00')
    })
  })

  describe('when changing the policy from allow all to selected', () => {
    it('shows warning', () => {
      render(<TestSeatAssignmentPolicy policy={CopilotForBusinessSeatPolicy.EnabledForAll} />)
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableSelectedRadio = screen.getByTestId(
        `seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForSelected}`,
      )
      fireEvent.click(enableSelectedRadio)
      const scratchButton = screen.getByTestId('scratch-button')
      expect(scratchButton).toBeInTheDocument()
      const keepButton = screen.getByTestId('keep-button')
      expect(keepButton.textContent).toBe('Renew seats')
    })
  })

  describe('when changing the policy from allow all to disabled', () => {
    it('shows a modal summarizing the cost and number of seats that will be removed', () => {
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForAll}
          policyChangeIntent="remove"
          planText="Business"
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const disabledRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
      fireEvent.click(disabledRadio)

      screen.getByText('Please confirm you want to remove access to Copilot for all members of this organization.')
      screen.getByText('You will be removing 5 Copilot seats from your monthly bill.')
      screen.getByText('Estimated monthly cost is $95.00 ($19/month each seat) until 31 December 2023.')
      screen.getByText('Your last payment')
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Confirm and remove seats'})

      expect(nextPaymentTotal).toContain('$95.00')
      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the cost for Copilot Enterprise', () => {
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForAll}
          policyChangeIntent="remove"
          planText="Enterprise"
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const disabledRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
      fireEvent.click(disabledRadio)

      screen.getByText('Please confirm you want to remove access to Copilot for all members of this organization.')
      screen.getByText('You will be removing 5 Copilot seats from your monthly bill.')
      screen.getByText('Estimated monthly cost is $195.00 ($39/month each seat) until 31 December 2023.')
      screen.getByText('Your last payment')
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Confirm and remove seats'})

      expect(nextPaymentTotal).toContain('$195.00')
      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the cost of Copilot Business trial and number of seats that will be removed', () => {
      const trial = {
        has_trial: true,
        active: true,
        ends_at: String(new Date()),
        copilot_plan: 'business',
      } as CopilotForBusinessTrial
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForAll}
          policyChangeIntent="remove"
          businessTrial={trial}
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const disabledRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
      fireEvent.click(disabledRadio)

      screen.getByText('Please confirm you want to remove access to Copilot for all members of this organization.')
      screen.getByText('You will be removing 5 Copilot seats.')
      expect(screen.queryByText('Your last payment')).not.toBeInTheDocument()

      const purchaseSeats = screen.getByRole('button', {name: 'Confirm and remove seats'})
      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the cost of Copilot Enterprise trial and number of seats that will be removed', () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'enterprise',
      } as CopilotForBusinessTrial
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForAll}
          policyChangeIntent="remove"
          businessTrial={trial}
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const disabledRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
      fireEvent.click(disabledRadio)

      screen.getByText('Please confirm you want to remove access to Copilot for all members of this organization.')
      screen.getByText('You will be removing 5 Copilot seats from your monthly bill.')
      screen.getByText('Estimated monthly cost is $95.00 ($19/month each seat) until 31 December 2023.')
      screen.getByText('Your last payment')
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Confirm and remove seats'})

      expect(nextPaymentTotal).toContain('$95.00')
      expect(purchaseSeats).toBeInTheDocument()
    })
  })

  describe('when changing the policy from selected to allow all', () => {
    it('shows a modal summarizing the cost, number of seats that will be added and flash message', () => {
      render(<TestSeatAssignmentPolicy policy={CopilotForBusinessSeatPolicy.EnabledForSelected} membersCount={4} />)
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
      fireEvent.click(enableAllRadio)

      const message = screen.getByText('You will not be charged twice for members who already had seats assigned.')
      const paymentHeader = screen.getByText('You will be charged for 1 new seat')
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent
      const costPerLicense = screen.getByTestId('cfb-cost-per-license-datum').textContent
      const totalAssignedSeats = screen.getByTestId('cfb-total-assigned-seats-datum').textContent
      const existingSeats = screen.getByTestId('cfb-existing-seats-datum').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Purchase seats'})

      expect(message).toBeInTheDocument()
      expect(paymentHeader).toBeInTheDocument()
      expect(nextPaymentTotal).toBe('$76.00 per month')
      expect(costPerLicense).toBe('$19.00')
      expect(totalAssignedSeats).toBe('4')
      expect(existingSeats).toBe('3')
      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the Copilt Business trial, number of seats that will be added and flash message', () => {
      const trial = {
        has_trial: true,
        active: true,
        ends_at: String(new Date()),
        copilot_plan: 'business',
      } as CopilotForBusinessTrial
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          membersCount={5}
          businessTrial={trial}
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
      fireEvent.click(enableAllRadio)

      const message = screen.getByText('Members who already had seats assigned will not be added twice.')
      const freeTrialUntil = screen.getByTestId('cfb-free-trial-until').textContent
      const totalAssignedSeats = screen.getByTestId('cfb-total-assigned-seats-datum').textContent
      const existingSeats = screen.getByTestId('cfb-existing-seats-datum').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Purchase seats'})

      expect(message).toBeInTheDocument()
      expect(freeTrialUntil).toContain('Free trial until')
      expect(totalAssignedSeats).toBe('5')
      expect(existingSeats).toBe('3')
      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the cost of Copilt Enterprise trial, number of seats that will be added and flash message', () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'enterprise',
      } as CopilotForBusinessTrial
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          membersCount={4}
          businessTrial={trial}
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
      fireEvent.click(enableAllRadio)

      const message = screen.getByText('You will not be charged twice for members who already had seats assigned.')
      const paymentHeader = screen.getByText('You will be charged for 1 new seat')
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent
      const costPerLicense = screen.getByTestId('cfb-cost-per-license-datum').textContent
      const totalAssignedSeats = screen.getByTestId('cfb-total-assigned-seats-datum').textContent
      const existingSeats = screen.getByTestId('cfb-existing-seats-datum').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Purchase seats'})

      expect(message).toBeInTheDocument()
      expect(paymentHeader).toBeInTheDocument()
      expect(nextPaymentTotal).toBe('$76.00 per month')
      expect(costPerLicense).toBe('$19.00')
      expect(totalAssignedSeats).toBe('4')
      expect(existingSeats).toBe('3')
      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the cost and the total number of seats when the number of seats does not change', () => {
      render(<TestSeatAssignmentPolicy membersCount={3} policy={CopilotForBusinessSeatPolicy.EnabledForSelected} />)
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const enableAllRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.EnabledForAll}`)
      fireEvent.click(enableAllRadio)

      const paymentHeader = screen.getByText('Your next payment')
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent
      const costPerLicense = screen.getByTestId('cfb-cost-per-license-datum').textContent
      const totalAssignedSeats = screen.getByTestId('cfb-total-assigned-seats-datum').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Purchase seats'})

      expect(paymentHeader).toBeInTheDocument()
      expect(nextPaymentTotal).toBe('$57.00 per month')
      expect(costPerLicense).toBe('$19.00')
      expect(totalAssignedSeats).toBe('3')
      expect(purchaseSeats).toBeInTheDocument()
    })
  })

  describe('when changing the policy from selected to disabled', () => {
    it('shows a modal summarizing the cost and number of seats that will be removed', () => {
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          policyChangeIntent="remove"
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const disabledRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
      fireEvent.click(disabledRadio)

      screen.getByText('Please confirm you want to remove access to Copilot for all members of this organization.')
      screen.getByText('You will be removing 5 Copilot seats from your monthly bill.')
      screen.getByText('Estimated monthly cost is $95.00 ($19/month each seat) until 31 December 2023.')
      screen.getByText('Your last payment')
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Confirm and remove seats'})

      expect(nextPaymentTotal).toBe('$95.00  ')
      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the Copilot Business trial and number of seats that will be removed', () => {
      const trial = {
        has_trial: true,
        active: true,
        ends_at: String(new Date()),
        copilot_plan: 'business',
      } as CopilotForBusinessTrial
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          policyChangeIntent="remove"
          businessTrial={trial}
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const disabledRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
      fireEvent.click(disabledRadio)

      screen.getByText('Please confirm you want to remove access to Copilot for all members of this organization.')
      screen.getByText('You will be removing 5 Copilot seats.')
      expect(screen.queryByText('Your last payment')).not.toBeInTheDocument()
      const purchaseSeats = screen.getByRole('button', {name: 'Confirm and remove seats'})
      expect(purchaseSeats).toBeInTheDocument()
    })

    it('shows a modal summarizing the cost of Copilot Enterprise trial and number of seats that will be removed', () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'enterprise',
      } as CopilotForBusinessTrial
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          policyChangeIntent="remove"
          planText="Business"
          businessTrial={trial}
        />,
      )
      fireEvent.click(screen.getByTestId('seat-assignment-policy-action'))
      const disabledRadio = screen.getByTestId(`seat-assignment-radio-${CopilotForBusinessSeatPolicy.Disabled}`)
      fireEvent.click(disabledRadio)

      screen.getByText('Please confirm you want to remove access to Copilot for all members of this organization.')
      screen.getByText('You will be removing 5 Copilot seats from your monthly bill.')
      screen.getByText('Estimated monthly cost is $95.00 ($19/month each seat) until 31 December 2023.')
      screen.getByText('Your last payment')
      const nextPaymentTotal = screen.getByTestId('cfb-payment-total').textContent
      const purchaseSeats = screen.getByRole('button', {name: 'Confirm and remove seats'})

      expect(nextPaymentTotal).toBe('$95.00  ')
      expect(purchaseSeats).toBeInTheDocument()
    })
  })

  describe('blankslate', () => {
    it('has the right button name two options if blank slate', () => {
      render(
        <TestSeatAssignmentPolicy
          policy={CopilotForBusinessSeatPolicy.Disabled}
          policyChangeIntent="remove"
          emptyState={true}
        />,
      )
      const button = screen.getByTestId('seat-assignment-policy-action')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Start adding seats')
      fireEvent.click(button)
      expect(screen.getByText('Purchase for selected members')).toBeInTheDocument()
      expect(screen.getByText('Purchase for all members (4)')).toBeInTheDocument()
      expect(screen.queryByTestId('seat-assignment-radio-disabled')).not.toBeInTheDocument()
    })

    it('has the right button name and three options if not blank slate', () => {
      render(<TestSeatAssignmentPolicy policy={CopilotForBusinessSeatPolicy.Disabled} policyChangeIntent="remove" />)
      const button = screen.getByTestId('seat-assignment-policy-action')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Disabled')
      fireEvent.click(button)
      expect(screen.getByText('Selected members')).toBeInTheDocument()
      expect(screen.getByText('All members of the organization')).toBeInTheDocument()
      expect(screen.getByTestId('seat-assignment-radio-disabled')).toBeInTheDocument()
    })
  })
})
