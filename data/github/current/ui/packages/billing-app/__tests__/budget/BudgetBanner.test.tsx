import {fireEvent, screen} from '@testing-library/react'

import BudgetBanner from '../../components/budget/BudgetBanner'

import {render} from '@github-ui/react-core/test-utils'

import type {BudgetAlertDetails} from '../../types/budgets'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

test('Renders with the correct variant and icon when 75% of the budget has been spent', async () => {
  const budgetAlertDetail: BudgetAlertDetails = {
    text: "You've used 75% of your enterprise budget.",
    variant: 'warning',
    dismissible: false,
    dismiss_link: '',
    budget_id: 'test-budget-id',
  }

  const backgroundColor = 'var(--bgColor-attention-muted,var(--color-attention-subtle,#fff8c5))'
  const iconColor = 'var(--fgColor-attention,var(--color-attention-fg,#9a6700))'

  render(<BudgetBanner budgetAlertDetail={budgetAlertDetail} />)

  const banner = screen.getByTestId('billing-banner')
  const icon = screen.getByLabelText('Alert icon')

  expect(banner).toHaveStyle(`background-color: ${backgroundColor}`)
  expect(icon).toHaveStyle(`color:  ${iconColor}`)
  expect(screen.getByText(budgetAlertDetail.text)).toBeInTheDocument()
})

test('Renders with the correct variant and icon when 90% of the budget has been spent', async () => {
  const budgetAlertDetail: BudgetAlertDetails = {
    text: "You've used 90% of your enterprise budget.",
    variant: 'warning',
    dismissible: false,
    dismiss_link: '',
    budget_id: 'test-budget-id',
  }

  const backgroundColor = 'var(--bgColor-attention-muted,var(--color-attention-subtle,#fff8c5))'
  const iconColor = 'var(--fgColor-attention,var(--color-attention-fg,#9a6700))'

  render(<BudgetBanner budgetAlertDetail={budgetAlertDetail} />)

  const banner = screen.getByTestId('billing-banner')
  const icon = screen.getByLabelText('Alert icon')

  expect(banner).toHaveStyle(`background-color: ${backgroundColor}`)
  expect(icon).toHaveStyle(`color:  ${iconColor}`)
  expect(screen.getByText(budgetAlertDetail.text)).toBeInTheDocument()
})

test('Renders with the correct variant and icon when 100% of the budget has been spent', async () => {
  const budgetAlertDetail: BudgetAlertDetails = {
    text: "You've used 100% of your enterprise budget.",
    variant: 'danger',
    dismissible: false,
    dismiss_link: '',
    budget_id: 'test-budget-id',
  }
  const backgroundColor = 'var(--bgColor-danger-muted,var(--color-danger-subtle,#ffebe9))'
  const iconColor = 'var(--fgColor-danger,var(--color-danger-emphasis,#cf222e))'

  render(<BudgetBanner budgetAlertDetail={budgetAlertDetail} />)

  const banner = screen.getByTestId('billing-banner')
  const icon = screen.getByLabelText('Alert icon')

  expect(banner).toHaveStyle(`background-color: ${backgroundColor}`)
  expect(icon).toHaveStyle(`color:  ${iconColor}`)
  expect(screen.getByText(budgetAlertDetail.text)).toBeInTheDocument()
})

test('Renders with a close button when dismissible is true', async () => {
  const budgetAlertDetail: BudgetAlertDetails = {
    text: "You've used 100% of your enterprise budget.",
    variant: 'danger',
    dismissible: true,
    dismiss_link: '',
    budget_id: 'test-budget-id',
  }

  render(<BudgetBanner budgetAlertDetail={budgetAlertDetail} />)
  const closeButton = screen.getByLabelText('Close')

  expect(closeButton).toBeInTheDocument()
})

test('Renders without a close button when dismissible is false', async () => {
  const budgetAlertDetail: BudgetAlertDetails = {
    text: "You've used 100% of your enterprise budget.",
    variant: 'danger',
    dismissible: false,
    dismiss_link: '',
    budget_id: 'test-budget-id',
  }

  render(<BudgetBanner budgetAlertDetail={budgetAlertDetail} />)
  const closeButton = screen.queryByLabelText('Close')

  expect(closeButton).not.toBeInTheDocument()
})

test('The banner is no longer visible when the close button is clicked', async () => {
  const budgetAlertDetail: BudgetAlertDetails = {
    text: "You've used 100% of your enterprise budget.",
    variant: 'danger',
    dismissible: true,
    dismiss_link: '',
    budget_id: 'test-budget-id',
  }

  render(<BudgetBanner budgetAlertDetail={budgetAlertDetail} />)
  expect(screen.getByTestId('billing-banner')).toBeInTheDocument()
  const closeButton = screen.getByLabelText('Close')
  fireEvent.click(closeButton)
  expect(screen.queryByTestId('billing-banner')).not.toBeInTheDocument()
})
