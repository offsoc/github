import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {BudgetProductSelector} from '../../components/budget/BudgetProductSelector'

import {MOCK_PRODUCTS} from '../../test-utils/mock-data'

test('Renders', () => {
  render(<BudgetProductSelector budgetProduct="actions" setBudgetProduct={() => {}} products={MOCK_PRODUCTS} />)
  expect(screen.getByRole('heading')).toHaveTextContent('Product')
})
