import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

import {CostCenterPage} from '../../routes/'

import {getCostCenterRoutePayload, mockCostCenterOrgQueries} from '../../test-utils/mock-data'
import {CostCenterState, CostCenterType} from '../../enums/cost-centers'

jest.mock('@github-ui/react-core/use-feature-flag')

function mockFeatureFlagEnabled(value: boolean) {
  ;(useFeatureFlag as jest.Mock).mockImplementation(() => value)
}

function TestComponent() {
  const environment = createMockEnvironment()
  mockCostCenterOrgQueries(environment)

  return (
    <RelayEnvironmentProvider environment={environment}>
      <CostCenterPage />
    </RelayEnvironmentProvider>
  )
}

it('Renders the Cost Centers details page', async () => {
  mockFeatureFlagEnabled(true)

  const routePayload = getCostCenterRoutePayload()
  const uuid = routePayload.costCenter.costCenterKey.uuid
  render(<TestComponent />, {routePayload})

  expect(await screen.findByTestId('org-picker-wrapper')).toBeInTheDocument()
  expect(await screen.findByTestId(`edit-cost-center-${uuid}`)).toBeInTheDocument()
  expect(await screen.findByTestId(`delete-cost-center-${uuid}`)).toBeInTheDocument()
})

describe('when in Azure subscription mode', () => {
  it('Renders the Cost Centers details page displays the Azure subscription ID', async () => {
    mockFeatureFlagEnabled(true)

    const routePayload = getCostCenterRoutePayload()
    const uuid = routePayload.costCenter.costCenterKey.uuid
    routePayload.costCenter.costCenterKey.targetType = CostCenterType.AzureSubscription
    routePayload.costCenter.costCenterKey.targetId = 'dummy'
    render(<TestComponent />, {routePayload})

    expect(await screen.findByTestId('azure-subscription-id-box')).toBeInTheDocument()
    expect(await screen.findByTestId('azure-subscription-id-view')).toBeInTheDocument()
    expect(await screen.findByTestId('org-picker-wrapper')).toBeInTheDocument()
    expect(await screen.findByTestId(`edit-cost-center-${uuid}`)).toBeInTheDocument()
    expect(await screen.findByTestId(`delete-cost-center-${uuid}`)).toBeInTheDocument()
  })

  it('Renders the Cost Centers details page but hides the Azure subscription ID if its missing', async () => {
    mockFeatureFlagEnabled(true)

    const routePayload = getCostCenterRoutePayload()
    const uuid = routePayload.costCenter.costCenterKey.uuid
    routePayload.costCenter.costCenterKey.targetType = CostCenterType.AzureSubscription
    routePayload.costCenter.costCenterKey.targetId = ''
    render(<TestComponent />, {routePayload})

    expect(screen.queryByTestId('azure-subscription-id-box')).not.toBeInTheDocument()
    expect(screen.queryByTestId('azure-subscription-id-view')).not.toBeInTheDocument()
    expect(await screen.findByTestId('org-picker-wrapper')).toBeInTheDocument()
    expect(await screen.findByTestId(`edit-cost-center-${uuid}`)).toBeInTheDocument()
    expect(await screen.findByTestId(`delete-cost-center-${uuid}`)).toBeInTheDocument()
  })
})

it('Does not render the Edit or Delete actions for archived cost centers', async () => {
  mockFeatureFlagEnabled(true)

  const routePayload = getCostCenterRoutePayload()
  const uuid = routePayload.costCenter.costCenterKey.uuid
  routePayload.costCenter.costCenterState = CostCenterState.Archived
  render(<TestComponent />, {routePayload})

  expect(await screen.findByTestId('org-picker-wrapper')).toBeInTheDocument()
  expect(screen.queryByTestId(`edit-cost-center-${uuid}`)).not.toBeInTheDocument()
  expect(screen.queryByTestId(`delete-cost-center-${uuid}`)).not.toBeInTheDocument()
})
