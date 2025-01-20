import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {BudgetSelectedProduct} from '../../components/budget/BudgetSelectedProduct'
import {MOCK_PRODUCTS} from '../../test-utils/mock-data'

test('Renders the component', () => {
  render(<BudgetSelectedProduct budgetProduct="actions" enabledProducts={MOCK_PRODUCTS} />)
  expect(screen.getByRole('heading')).toHaveTextContent('Product')
  expect(screen.getByText('Actions')).toBeInTheDocument()
})
