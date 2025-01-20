import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import BudgetLabel from '../../components/budget/BudgetLabel'

test('Renders', () => {
  render(<BudgetLabel budgetCurrentAmount={9} budgetTargetAmount={10} />)
  expect(screen.getByTestId('budget-label')).toHaveTextContent('90%')
})

test('Renders over budget', () => {
  render(<BudgetLabel budgetCurrentAmount={11} budgetTargetAmount={10} />)
  expect(screen.getByTestId('budget-label')).toHaveTextContent('Over budget')
})

test('Renders over percentage higher than 90%', () => {
  render(<BudgetLabel budgetCurrentAmount={9.2} budgetTargetAmount={10} />)
  expect(screen.getByTestId('budget-label')).toHaveTextContent('92%')
})

test('Does not render when percentage is lower than 90%', () => {
  render(<BudgetLabel budgetCurrentAmount={8.9} budgetTargetAmount={10} />)
  expect(screen.queryByTestId('budget-label')).toBeNull()
})

test('Rounds percentage to the nearest whole number', () => {
  render(<BudgetLabel budgetCurrentAmount={9.3132} budgetTargetAmount={10} />)
  expect(screen.getByTestId('budget-label')).toHaveTextContent('93%')
})
