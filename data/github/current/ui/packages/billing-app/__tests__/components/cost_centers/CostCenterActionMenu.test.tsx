import {ThemeProvider} from '@primer/react'
import {act, screen, within} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {render} from '@github-ui/react-core/test-utils'

import CostCenterActionMenu from '../../../components/cost_centers/CostCenterActionMenu'
import {createMockEnvironment} from 'relay-test-utils'
import {mockCostCenter} from '../../../test-utils/mock-data'
import {CostCenterState} from '../../../enums/cost-centers'

jest.mock('@github-ui/feature-flags')
jest.mock('@github-ui/react-core/use-feature-flag')

const useNavigateMock = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => useNavigateMock,
  }
})

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({business: 'github-inc'}),
}))

// The useNavigate navigation from deleting a cost center does not work without this
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    mark: jest.fn(),
    clearResourceTimings: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue({pop: jest.fn()}),
    measure: jest.fn(),
  },
})

const TestComponent = (costCenter = mockCostCenter) => {
  const environment = createMockEnvironment()

  return (
    <RelayEnvironmentProvider environment={environment}>
      <ThemeProvider>
        <CostCenterActionMenu costCenter={costCenter} />
      </ThemeProvider>
    </RelayEnvironmentProvider>
  )
}

describe('CostCenterActionMenu', () => {
  const uuid = mockCostCenter.costCenterKey.uuid

  test('Renders', async () => {
    render(TestComponent())

    expect(screen.getByTestId(`cost-center-${uuid}-action-menu`)).toBeInTheDocument()

    expect(screen.queryByTestId(`edit-cost-center-${uuid}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`delete-cost-center-${uuid}`)).not.toBeInTheDocument()
  })

  test('Renders the edit item', async () => {
    const {user} = render(TestComponent())

    expect(screen.getByTestId(`cost-center-${uuid}-action-menu`)).toBeInTheDocument()

    const button = await screen.findByRole('button')
    await user.click(button)

    expect(screen.getByTestId(`edit-cost-center-${uuid}`)).toBeInTheDocument()
  })

  test('Renders the delete item', async () => {
    const {user} = render(TestComponent())

    expect(screen.getByTestId(`cost-center-${uuid}-action-menu`)).toBeInTheDocument()

    const button = await screen.findByRole('button')
    await user.click(button)

    await expect(screen.getByTestId(`delete-cost-center-${uuid}`)).toBeInTheDocument()
  })

  test('Does not render the Edit or Delete actions for archived cost centers', async () => {
    const costCenter = {...mockCostCenter}
    costCenter.costCenterState = CostCenterState.Archived

    const {user} = render(TestComponent(costCenter))

    expect(screen.getByTestId(`cost-center-${uuid}-action-menu`)).toBeInTheDocument()

    const button = await screen.findByRole('button')
    await user.click(button)

    expect(screen.queryByTestId(`edit-cost-center-${uuid}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`delete-cost-center-${uuid}`)).not.toBeInTheDocument()
  })

  test('Cost centers can be deleted', async () => {
    const {user} = render(TestComponent())

    expect(screen.getByTestId(`cost-center-${uuid}-action-menu`)).toBeInTheDocument()

    const button = await screen.findByRole('button')
    await user.click(button)

    const deleteItem = await screen.findByTestId(`delete-cost-center-${uuid}`)
    await user.click(deleteItem)

    const deleteDialog = await screen.findByTestId('delete-cost-center-dialog')
    expect(deleteDialog).toBeInTheDocument()

    const confirmButton = within(deleteDialog).getByRole('button', {name: 'Delete cost center'})

    await act(async () => {
      await user.click(confirmButton)
    })
  })
})
