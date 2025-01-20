import {render} from '@github-ui/react-core/test-utils'
import {noop} from '@github-ui/noop'
import {screen} from '@testing-library/react'
import {createMockEnvironment} from 'relay-test-utils'

import {BudgetScopeSelector} from '../../components/budget/BudgetScopeSelector'
import {BUDGET_SCOPE_ENTERPRISE} from '../../constants'
import {RelayEnvironmentProvider} from 'react-relay'

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
}

function TestComponent({environment}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <BudgetScopeSelector
        budgetScope={BUDGET_SCOPE_ENTERPRISE}
        budgetScopeIds={['1']}
        setBudgetScope={noop}
        setBudgetScopeId={noop}
        slug=""
        budgetProduct="actions"
      />
    </RelayEnvironmentProvider>
  )
}

test('Renders', () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  expect(screen.getByRole('heading')).toHaveTextContent('Budget scope')
  expect(screen.getByRole('group')).toHaveTextContent('Enterprise')
  expect(screen.getByRole('group')).toHaveTextContent('Organization')
  expect(screen.getByRole('group')).toHaveTextContent('Repository')
})
