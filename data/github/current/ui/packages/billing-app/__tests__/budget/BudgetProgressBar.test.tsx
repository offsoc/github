import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import BudgetProgressBar from '../../components/budget/BudgetProgressBar'

test('Renders', () => {
  render(<BudgetProgressBar budgetCurrentAmount={9} budgetTargetAmount={10} />)
  expect(screen.getByTestId('budget-progressbar')).toHaveAttribute('aria-valuenow', '90')
})

test('Renders and sets amount to 100 when over budget', () => {
  render(<BudgetProgressBar budgetCurrentAmount={11} budgetTargetAmount={10} />)
  expect(screen.getByTestId('budget-progressbar')).toHaveAttribute('aria-valuenow', '100')
})

test('Renders and sets amount to 100 when budget target amount is 0', () => {
  render(<BudgetProgressBar budgetCurrentAmount={10} budgetTargetAmount={0} />)
  expect(screen.getByTestId('budget-progressbar')).toHaveAttribute('aria-valuenow', '100')
})

test('Renders normal values', () => {
  render(<BudgetProgressBar budgetCurrentAmount={2} budgetTargetAmount={10} />)
  expect(screen.getByTestId('budget-progressbar')).toHaveAttribute('aria-valuenow', '20')
})
