import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import {screen, waitFor, act} from '@testing-library/react'

import BudgetForm, {defaultBudgetLimitType} from '../../components/budget/BudgetForm'

import {BudgetLimitTypes} from '../../enums/budgets'

import {mockBudgetAlertQueries, MOCK_PRODUCTS} from '../../test-utils/mock-data'

import type {EditBudget} from '../../types/budgets'
import type {AdminRole} from '../../types/common'
import type {Product} from '../../types/products'
import {PageContext} from '../../App'

jest.mock('@github-ui/ssr-utils', () => ({
  get IS_BROWSER() {
    // Without this, `useHydratedEffect()` does nothing and toasts won't show.
    return true
  },
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  budget: EditBudget | undefined
  adminRoles?: AdminRole[]
  enabledProducts?: Product[]
  isEnterpriseRoute?: boolean
}

// `Submits the create budget form` throws without this due to soft navigation
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    mark: jest.fn(),
    clearResourceTimings: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue({pop: jest.fn()}),
    measure: jest.fn(),
  },
})

function TestComponent({
  environment,
  budget,
  adminRoles = ['owner'],
  enabledProducts = MOCK_PRODUCTS,
  isEnterpriseRoute = true,
}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <PageContext.Provider
        value={{
          isStafftoolsRoute: false,
          isEnterpriseRoute,
          isOrganizationRoute: !isEnterpriseRoute,
        }}
      >
        <BudgetForm
          budget={budget}
          slug="test"
          currentUserId="U_123"
          adminRoles={adminRoles}
          enabledProducts={enabledProducts}
        />
      </PageContext.Provider>
    </RelayEnvironmentProvider>
  )
}

function SetupAndRenderComponent(
  budget?: EditBudget,
  adminRoles?: AdminRole[],
  enabledProducts?: Product[],
  isEnterpriseRoute?: boolean,
) {
  const environment = createMockEnvironment()

  const view = render(
    <TestComponent
      environment={environment}
      budget={budget}
      adminRoles={adminRoles}
      enabledProducts={enabledProducts}
      isEnterpriseRoute={isEnterpriseRoute}
    />,
  )

  act(() => {
    mockBudgetAlertQueries(environment, {})
  })

  return view
}

test('Renders correctly for a new budget', async () => {
  SetupAndRenderComponent()

  await expect(
    screen.findByRole('heading', {name: 'Budgets and alerts / New monthly budget'}),
  ).resolves.toBeInTheDocument()
  await expect(screen.findByRole('button', {name: 'Create budget'})).resolves.toBeInTheDocument()
})

test('Renders correctly for editing a budget', async () => {
  const budget = {
    targetType: 'Organization',
    targetAmount: 50,
    budgetLimitType: BudgetLimitTypes.AlertingOnly,
    currentAmount: 20,
    targetId: '1',
    uuid: '1',
    alertEnabled: false,
    alertRecipientUserIds: [],
    targetName: 'test',
    pricingTargetId: 'actions',
    pricingTargetType: 'NoPricingTarget',
  }
  SetupAndRenderComponent(budget)

  await expect(
    screen.findByRole('heading', {name: 'Budgets and alerts / Edit monthly budget'}),
  ).resolves.toBeInTheDocument()
  await expect(screen.findByRole('button', {name: 'Update budget'})).resolves.toBeInTheDocument()
})

test('Hides the repository picker from enterprise owners', async () => {
  SetupAndRenderComponent(undefined, ['owner'])

  const repoPicker = screen.queryByLabelText('Repository')
  expect(repoPicker).toBeNull()
})

test('Hides the repository picker from billing managers', async () => {
  SetupAndRenderComponent(undefined, ['billing_manager'])

  const repoPicker = screen.queryByLabelText('Repository')
  expect(repoPicker).toBeNull()
})

test('Shows the repository picker if the admin is an org owner', async () => {
  SetupAndRenderComponent(undefined, ['billing_manager', 'enterprise_org_owner'])

  const repoPicker = screen.queryByLabelText('Repository')
  expect(repoPicker).toBeTruthy()
})

test('Displays only repo and cost center selectors when the user is only an org owner', async () => {
  SetupAndRenderComponent(undefined, ['enterprise_org_owner'])

  const costCenPicker = screen.queryByLabelText('Cost center')
  expect(costCenPicker).toBeTruthy()

  const repoPicker = screen.queryByLabelText('Repository')
  expect(repoPicker).toBeTruthy()

  const orgPicker = screen.queryByLabelText('Organization')
  expect(orgPicker).toBeNull()

  const entPicker = screen.queryByLabelText('Enterprise')
  expect(entPicker).toBeNull()
})

test('Displays organization and enterprise scope selectors when the user is enterprise owner', async () => {
  SetupAndRenderComponent(undefined, ['enterprise_org_owner', 'owner'])

  const orgPicker = screen.queryByLabelText('Organization')
  expect(orgPicker).toBeTruthy()

  const entPicker = screen.queryByLabelText('Enterprise')
  expect(entPicker).toBeTruthy()
})

test('Displays organization and enterprise scope selectors when the user is billing manager', async () => {
  SetupAndRenderComponent(undefined, ['billing_manager'])

  const orgPicker = screen.queryByLabelText('Organization')
  expect(orgPicker).toBeTruthy()

  const entPicker = screen.queryByLabelText('Enterprise')
  expect(entPicker).toBeTruthy()
})

test('Submits the create budget form', async () => {
  const {user} = SetupAndRenderComponent()

  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/budgets`)

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.type(amountField, '5')
  expect(await screen.findByText('current-user')).toBeVisible()

  const submitButton = screen.getByRole('button', {name: 'Create budget'})

  await user.click(submitButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Submits the create budget form when amount is 0', async () => {
  const {user} = SetupAndRenderComponent()

  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/budgets`)

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.clear(amountField)
  await user.type(amountField, '0')
  expect(await screen.findByText('current-user')).toBeVisible()

  const submitButton = screen.getByRole('button', {name: 'Create budget'})

  await user.click(submitButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Does not submit the form when alerts are enabled with no recipients', async () => {
  const {user} = SetupAndRenderComponent()

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.type(amountField, '5')

  // de-select current user as alert recipient
  const defaultSelectedUser = await screen.findByLabelText('Remove option')
  await user.click(defaultSelectedUser)

  const submitButton = screen.getByRole('button', {name: 'Create budget'})
  await user.click(submitButton)

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('At least one alert recipient must be selected')
  })
})

test('Does not submit the create budget form when no product is selected', async () => {
  const {user} = SetupAndRenderComponent(undefined, undefined, [])
  // Enterprise is selected by default
  const entRadioButton: HTMLInputElement = screen.getByLabelText('Enterprise')
  expect(entRadioButton).toBeChecked()

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.type(amountField, '5')

  const submitButton = screen.getByRole('button', {name: 'Create budget'})
  await user.click(submitButton)

  await expect(screen.findByText('A product must be selected')).resolves.toBeInTheDocument()
})

test('Submits the edit budget form, modal not displayed as type is AlertingOnly', async () => {
  const editBudget: EditBudget = {
    targetId: '4',
    targetType: 'Repo',
    targetAmount: 12,
    budgetLimitType: BudgetLimitTypes.AlertingOnly,
    currentAmount: 0,
    targetName: 'My Repo Budget',
    uuid: 'test-uuid',
    alertEnabled: false,
    alertRecipientUserIds: [],
    pricingTargetId: 'actions',
    pricingTargetType: 'ProductPricing',
  }
  const {user} = SetupAndRenderComponent(editBudget)

  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/budgets/test-uuid`)

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.type(amountField, '5')

  const submitButton = screen.getByRole('button', {name: 'Update budget'})

  await user.click(submitButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Submits the edit budget form, modal not displayed as budget value will be higher than current', async () => {
  const editBudget: EditBudget = {
    targetId: '4',
    targetType: 'Repo',
    targetAmount: 12,
    budgetLimitType: BudgetLimitTypes.AlertingOnly,
    currentAmount: 0,
    targetName: 'My Repo Budget',
    uuid: 'test-uuid',
    alertEnabled: false,
    alertRecipientUserIds: [],
    pricingTargetId: 'actions',
    pricingTargetType: 'ProductPricing',
  }
  const {user} = SetupAndRenderComponent(editBudget)

  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/budgets/test-uuid`)

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.clear(amountField)
  await user.type(amountField, '15')

  const submitButton = screen.getByRole('button', {name: 'Update budget'})

  await user.click(submitButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Submits the edit budget form, confirmation modal displayed', async () => {
  const editBudget: EditBudget = {
    targetId: '4',
    targetType: 'Repo',
    targetAmount: 6,
    budgetLimitType: BudgetLimitTypes.PreventFurtherUsage,
    currentAmount: 0,
    targetName: 'My Repo Budget',
    uuid: 'test-uuid',
    alertEnabled: false,
    alertRecipientUserIds: [],
    pricingTargetId: 'actions',
    pricingTargetType: 'ProductPricing',
  }
  const {user} = SetupAndRenderComponent(editBudget)

  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/budgets/test-uuid`)

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.clear(amountField)
  await user.type(amountField, '5')

  const submitButton = screen.getByRole('button', {name: 'Update budget'})
  await user.click(submitButton)

  const editDialog = await screen.findByTestId('confirm-budget-edit-dialog')
  expect(editDialog).toBeInTheDocument()

  const confirmButton = screen.getByRole('button', {name: 'Confirm'})
  await user.click(confirmButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Submits the edit budget form, confirmation modal is displayed and is cancelled', async () => {
  const editBudget: EditBudget = {
    targetId: '4',
    targetType: 'Repo',
    targetAmount: 6,
    budgetLimitType: BudgetLimitTypes.PreventFurtherUsage,
    currentAmount: 0,
    targetName: 'My Repo Budget',
    uuid: 'test-uuid',
    alertEnabled: false,
    alertRecipientUserIds: [],
    pricingTargetId: 'actions',
    pricingTargetType: 'ProductPricing',
  }
  const {user} = SetupAndRenderComponent(editBudget)

  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/budgets/test-uuid/edit`)

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.clear(amountField)
  await user.type(amountField, '5')

  const submitButton = screen.getByRole('button', {name: 'Update budget'})
  await user.click(submitButton)

  const editDialog = await screen.findByTestId('confirm-budget-edit-dialog')
  expect(editDialog).toBeInTheDocument()

  const cancelButton = screen.getByTestId('confirm-budget-edit-dialog-cancel')
  await user.click(cancelButton)

  await act(async () => {
    expect(mock).not.toHaveBeenCalled()
  })
})

test('Submits the create budget form when a user selects enterprise as the scope after first clicking on a different scope', async () => {
  const {user} = SetupAndRenderComponent()

  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/budgets`)

  // Enterprise is selected by default
  const entRadioButton: HTMLInputElement = screen.getByLabelText('Enterprise')
  expect(entRadioButton).toBeChecked()

  // Select org as the budget scope
  const orgRadioButton: HTMLInputElement = screen.getByLabelText('Organization')
  await user.click(orgRadioButton)
  expect(orgRadioButton).toBeChecked()
  expect(entRadioButton).not.toBeChecked()

  // Re-select enterprise as the budget scope
  await user.click(entRadioButton)
  expect(entRadioButton).toBeChecked()

  const amountField = screen.getByRole('textbox', {name: 'BudgetAmountInput'})
  await user.type(amountField, '5')
  expect(await screen.findByText('current-user')).toBeVisible()

  const submitButton = screen.getByRole('button', {name: 'Create budget'})
  await user.click(submitButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('The scope and product selectors are hidden on the edit budget form', async () => {
  const editBudget: EditBudget = {
    targetId: '4',
    targetType: 'Repo',
    targetAmount: 12,
    currentAmount: 0,
    targetName: 'My Repo Budget',
    uuid: 'test-uuid',
    alertEnabled: false,
    alertRecipientUserIds: [],
    pricingTargetId: 'actions',
    pricingTargetType: 'ProductPricing',
    budgetLimitType: BudgetLimitTypes.AlertingOnly,
  }
  SetupAndRenderComponent(editBudget)

  const productSelectorText = screen.queryByText('Select the product to include in this budget.')
  const scopeSelectorText = screen.queryByText('Select the scope of spending for this budget')
  expect(productSelectorText).toBeNull()
  expect(scopeSelectorText).toBeNull()
})

test('The default budget limit type returns PreventFurtherUsage for Actions', async () => {
  const product = 'actions'
  const budgetLimitType = defaultBudgetLimitType(product)
  expect(budgetLimitType).toEqual(BudgetLimitTypes.PreventFurtherUsage)
})

test('The default budget limit type returns PreventFurtherUsage for Packages', async () => {
  const product = 'packages'
  const budgetLimitType = defaultBudgetLimitType(product)
  expect(budgetLimitType).toEqual(BudgetLimitTypes.PreventFurtherUsage)
})

test('The default budget limit type returns AlertingOnly for Copilot', async () => {
  const product = 'copilot'
  const budgetLimitType = defaultBudgetLimitType(product)
  expect(budgetLimitType).toEqual(BudgetLimitTypes.AlertingOnly)
})
