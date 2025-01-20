import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, waitFor, act} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import {BudgetAlertSelector} from '../../components/budget/BudgetAlertSelector'
import {mockBudgetAlertQueries} from '../../test-utils/mock-data'

const mockSetAlertEnabled = jest.fn()
const mockSetAlertRecipientUsers = jest.fn()

function SetupAndRenderComponent(props?: Partial<React.ComponentProps<typeof BudgetAlertSelector>>) {
  const environment = createMockEnvironment()
  render(
    <RelayEnvironmentProvider environment={environment}>
      <BudgetAlertSelector
        slug="test"
        alertEnabled={false}
        setAlertEnabled={mockSetAlertEnabled}
        alertRecipientUserIds={['U_345']}
        setAlertRecipientUserIds={mockSetAlertRecipientUsers}
        {...props}
      />
    </RelayEnvironmentProvider>,
  )
  act(() => {
    mockBudgetAlertQueries(environment, props)
  })
}

test('Renders', async () => {
  SetupAndRenderComponent()

  const checkbox = await screen.findByLabelText('Receive budget threshold alerts')

  expect(checkbox).toBeVisible()
  expect(checkbox).toHaveAttribute('aria-checked', 'false')
  expect(screen.getByRole('heading')).toHaveTextContent('Alerts')
  await waitFor(() => {
    expect(screen.queryByText('Alert Recipients')).not.toBeInTheDocument()
  })
})

test('Renders a user picker when alerting is enabled', async () => {
  SetupAndRenderComponent({alertEnabled: true})

  const checkbox = await screen.findByLabelText('Receive budget threshold alerts')

  expect(checkbox).toBeVisible()
  expect(checkbox).toHaveAttribute('aria-checked', 'true')
  const headings = await screen.findAllByRole('heading')
  expect(headings[0]).toHaveTextContent('Alerts')
  expect(headings[1]).toHaveTextContent('Alert recipients')
  expect(await screen.findByTestId('user-picker')).toBeVisible()
})

test('Toggles alerting', async () => {
  SetupAndRenderComponent({alertEnabled: false})

  const checkbox = await screen.findByLabelText('Receive budget threshold alerts')
  fireEvent.click(checkbox)

  await waitFor(() => {
    expect(mockSetAlertEnabled).toHaveBeenCalledWith(true)
  })
})

test('Renders existing recipients', async () => {
  SetupAndRenderComponent({
    alertEnabled: true,
    alertRecipientUserIds: ['U_123'],
  })

  expect(await screen.findByTestId('user-picker')).toBeVisible()
  expect(await screen.findByText('1 selected')).toBeVisible()
  expect(await screen.findByText('U_123-login')).toBeVisible()
})

test('Renders multiple existing recipients', async () => {
  SetupAndRenderComponent({
    alertEnabled: true,
    alertRecipientUserIds: ['U_123', 'U_234'],
  })

  expect(await screen.findByTestId('user-picker')).toBeVisible()
  expect(await screen.findByText('2 selected')).toBeVisible()
})
