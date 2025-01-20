import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {BudgetAmount} from '../../components/budget/BudgetAmount'
import {BudgetLimitTypes} from '../../enums/budgets'

test('Renders', () => {
  render(
    <BudgetAmount
      budgetAmount={0}
      setBudgetAmount={() => {}}
      budgetLimitType={BudgetLimitTypes.AlertingOnly}
      setBudgetLimitType={() => {}}
      budgetProduct="actions"
      action="create"
    />,
  )

  expect(screen.getByTestId('budget-amount-input')).toBeTruthy()
})

test('Does not allow non numeric input', async () => {
  const {user} = render(
    <BudgetAmount
      budgetAmount={0}
      setBudgetAmount={() => {}}
      budgetLimitType={BudgetLimitTypes.AlertingOnly}
      setBudgetLimitType={() => {}}
      budgetProduct="actions"
      action="create"
    />,
  )

  const input = screen.getByTestId('budget-amount-input')
  await user.type(input, 'abc.!@#$%^&*()')

  expect(input).toHaveValue('0')
})

test('Stop usage checkbox unchecked if budget limit type is AlertingOnly', () => {
  render(
    <BudgetAmount
      budgetAmount={0}
      setBudgetAmount={() => {}}
      budgetLimitType={BudgetLimitTypes.AlertingOnly}
      setBudgetLimitType={() => {}}
      budgetProduct="actions"
      action="create"
    />,
  )

  const input = screen.getByTestId('alert-checkbox')
  expect(input).not.toBeChecked()
})

test('Stop usage checkbox checked if budget limit type is PreventFurtherUsage', () => {
  render(
    <BudgetAmount
      budgetAmount={0}
      setBudgetAmount={() => {}}
      budgetLimitType={BudgetLimitTypes.PreventFurtherUsage}
      setBudgetLimitType={() => {}}
      budgetProduct="other product"
      action="create"
    />,
  )

  const input = screen.getByTestId('alert-checkbox')
  expect(input).toBeChecked()
})
