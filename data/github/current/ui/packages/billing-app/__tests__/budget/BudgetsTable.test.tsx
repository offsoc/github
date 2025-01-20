import {render} from '@github-ui/react-core/test-utils'
import {screen, fireEvent, within} from '@testing-library/react'
import {noop} from '@github-ui/noop'

import BudgetsTable from '../../components/budget/BudgetsTable'
import {PageContext} from '../../App'

import type {Budget} from '../../types/budgets'
import {BudgetLimitTypes} from '../../enums/budgets'
import {doRequest} from '../../hooks/use-request'

jest.mock('../../hooks/use-request', () => ({
  doRequest: jest.fn(),
  HTTPMethod: {DELETE: 'DELETE'},
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

test('Renders table', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 20,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['billing_manager']} deleteBudget={noop} />)

  expect(screen.getByRole('table')).toBeVisible()
  expect(screen.getAllByRole('row')).toHaveLength(data.length + 1)
})

test('Renders 90% warning', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 100,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 90,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['owner']} deleteBudget={noop} />)

  expect(screen.getByText('90%')).toBeVisible()
})

test('Renders Overage warning', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 100,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 110,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: true,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['billing_manager']} deleteBudget={noop} />)

  expect(screen.getByText('Over budget')).toBeVisible()
})

test('Filters by all', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 100,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 110,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['billing_manager']} deleteBudget={noop} />)
  fireEvent.click(screen.getByText('Scope: All'))
  fireEvent.click(screen.getByRole('menuitemradio', {name: 'All'}))
  expect(screen.getByText('Organization')).toBeVisible()
  expect(screen.getByText('Repository')).toBeVisible()
})

test('Filters by organizations', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 100,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 110,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Org',
      targetAmount: 100,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 110,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test3',
      uuid: '3',
      alertEnabled: true,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['billing_manager']} deleteBudget={noop} />)

  fireEvent.click(screen.getByText('Scope: All'))
  fireEvent.click(screen.getByRole('menuitemradio', {name: 'Organizations'}))
  expect(screen.getAllByText('Organization')).toHaveLength(2)
  expect(screen.queryByText('Repository')).toBeNull()
})

test('Filters by repositories', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 100,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 110,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test3',
      uuid: '3',
      alertEnabled: true,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['owner']} deleteBudget={noop} />)
  fireEvent.click(screen.getByText('Scope: All'))
  fireEvent.click(screen.getByRole('menuitemradio', {name: 'Repositories'}))
  expect(screen.getAllByText('Repository')).toHaveLength(2)
  expect(screen.queryByText('Organization')).toBeNull()
})

test('Hides pagination component when data length < pageSize', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 100,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 110,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test3',
      uuid: '3',
      alertEnabled: true,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['owner']} deleteBudget={noop} />)
  expect(screen.getAllByText('Repository')).toHaveLength(2)
  expect(screen.queryByText('previous')).toBeNull()
})

test('Renders the action menu for an enterprise owner', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 20,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['owner']} deleteBudget={noop} />)

  const actionMenu = screen.getByRole('button', {name: `View actions for Repo test2's budget`})

  expect(actionMenu).toBeInTheDocument()
})

test('Renders the action menu for a billing manager', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 20,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['billing_manager']} deleteBudget={noop} />)

  const actionMenu = screen.getByRole('button', {name: `View actions for Repo test2's budget`})

  expect(actionMenu).toBeInTheDocument()
})

test('Renders the action menu for an enterprise org owner', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 20,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
  ]
  render(<BudgetsTable budgets={data} adminRoles={['enterprise_org_owner']} deleteBudget={noop} />)

  const actionMenu = screen.getByRole('button', {name: `View actions for Repo test2's budget`})

  expect(actionMenu).toBeInTheDocument()
})

test('Deletes budget', async () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 20,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
    {
      targetType: 'Repo',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 10,
      targetId: '1',
      targetName: 'test2',
      uuid: '2',
      alertEnabled: false,
    },
  ]
  ;(doRequest as jest.Mock).mockResolvedValue({
    statusCode: 200,
    ok: true,
  })

  const {user} = render(<BudgetsTable budgets={data} adminRoles={['billing_manager']} deleteBudget={noop} />)

  const actionMenu = screen.getByRole('button', {name: `View actions for Repo test2's budget`})

  await user.click(actionMenu)

  const deleteButton = screen.getByText('Delete')

  await user.click(deleteButton)

  const deleteDialog = await screen.findByRole('dialog')
  const confirmButton = within(deleteDialog).getByRole('button', {name: 'Delete budget'})
  await user.click(confirmButton)

  expect(doRequest).toHaveBeenCalledTimes(1)
})

test('Renders the action menu for any user on a stafftools route', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 20,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
  ]

  render(
    <PageContext.Provider value={{isStafftoolsRoute: true, isEnterpriseRoute: true, isOrganizationRoute: false}}>
      <BudgetsTable budgets={data} adminRoles={[]} deleteBudget={noop} />
    </PageContext.Provider>,
  )

  const actionMenu = screen.getByRole('button', {name: `View actions for Org test1's budget`})
  expect(actionMenu).toBeInTheDocument()
})

test('Does not render the action menu for a non owner or non billing manager on non stafftools route', () => {
  const data: Budget[] = [
    {
      targetType: 'Org',
      targetAmount: 50,
      budgetLimitType: BudgetLimitTypes.AlertingOnly,
      currentAmount: 20,
      targetId: '1',
      targetName: 'test1',
      uuid: '1',
      alertEnabled: true,
    },
  ]

  render(
    <PageContext.Provider value={{isStafftoolsRoute: false, isEnterpriseRoute: true, isOrganizationRoute: false}}>
      <BudgetsTable budgets={data} adminRoles={[]} deleteBudget={noop} />
    </PageContext.Provider>,
  )

  const actionMenu = screen.queryByRole('button', {name: `View actions for Org test1's budget`})
  expect(actionMenu).not.toBeInTheDocument()
})
