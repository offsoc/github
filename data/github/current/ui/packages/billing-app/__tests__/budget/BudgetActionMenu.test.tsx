import {render} from '@github-ui/react-core/test-utils'
import {screen, fireEvent, within} from '@testing-library/react'
import {noop} from '@github-ui/noop'

import BudgetActionMenu from '../../components/budget/BudgetActionMenu'
import {PageContext} from '../../App'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

const uuid = '123e4567-e89b-12d3-a456-426614174000'

test('Renders the budget action menu component', async () => {
  render(
    <BudgetActionMenu
      budgetId={uuid}
      productName="Actions"
      targetName="Test-Business"
      targetType="Enterprise"
      editLink={'/enterprises/foo'}
      onDeleteClick={noop}
    />,
  )

  const mainButton = screen.getByRole('button')
  fireEvent.click(mainButton)

  const editAction = screen.getByRole('menuitem', {name: /edit/i})
  const deleteAction = screen.getByRole('menuitem', {name: /delete/i})

  expect(editAction).toBeInTheDocument()
  expect(editAction).toHaveAttribute('href', '/enterprises/foo')
  expect(deleteAction).toBeInTheDocument()
})

test('Does not render the delete action on a stafftools route', async () => {
  render(
    <PageContext.Provider value={{isStafftoolsRoute: true, isEnterpriseRoute: true, isOrganizationRoute: false}}>
      <BudgetActionMenu
        budgetId={uuid}
        productName="Actions"
        targetName="Test-Business"
        targetType="Enterprise"
        editLink={'/enterprises/foo'}
        onDeleteClick={noop}
      />
    </PageContext.Provider>,
  )

  const mainButton = screen.getByRole('button')
  fireEvent.click(mainButton)

  const deleteAction = screen.queryByRole('menuitem', {name: /delete/i})
  expect(deleteAction).not.toBeInTheDocument()
})

test('Budgets can be deleted', async () => {
  render(
    <BudgetActionMenu
      budgetId={uuid}
      productName="Actions"
      targetName="Test-Business"
      targetType="Enterprise"
      editLink={'/enterprises/foo'}
      onDeleteClick={noop}
    />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  const deleteButton = await screen.findByTestId(`delete-budget-${uuid}`)
  fireEvent.click(deleteButton)

  const deleteDialog = await screen.findByRole('dialog')
  expect(deleteDialog).toBeInTheDocument()

  const confirmButton = within(deleteDialog).getByRole('button', {name: 'Delete budget'})
  fireEvent.click(confirmButton)
  expect(deleteDialog).not.toBeInTheDocument()
})
