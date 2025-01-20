import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {BudgetSelectedScope} from '../../components/budget/BudgetSelectedScope'
import {BUDGET_SCOPE_CUSTOMER} from '../../constants'

test('Renders the component', () => {
  render(<BudgetSelectedScope budgetScope={BUDGET_SCOPE_CUSTOMER} budgetTargetName="github-inc" />)
  expect(screen.getByRole('heading')).toHaveTextContent('Budget scope')
  expect(screen.getByText('Enterprise')).toBeInTheDocument()
  expect(screen.getByText('Spending for all organizations and repositories in your enterprise.')).toBeInTheDocument()
  // This disable is needed because the icon has an aria-hidden attribute and those elements are ignored by testing-library
  // eslint-disable-next-line testing-library/no-node-access
  const globeIcon = document.querySelector('.octicon-globe')
  expect(globeIcon).toBeInTheDocument()
  expect(screen.getByText('github-inc')).toBeInTheDocument()
})
