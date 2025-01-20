import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {CostCentersPage} from '../../routes/'

import {getCostCentersRoutePayload} from '../../test-utils/mock-data'

jest.mock('@github-ui/react-core/use-feature-flag')

function mockFeatureFlagEnabled(value: boolean) {
  ;(useFeatureFlag as jest.Mock).mockImplementation(() => value)
}

describe('CostCentersPage', () => {
  it('Renders the Cost Centers page', async () => {
    const routePayload = getCostCentersRoutePayload()
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <CostCentersPage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )

    // use find by and await for this since getAllByRole fails with suspense loaded component
    expect(await screen.findByText(/1 active cost center/)).toBeInTheDocument()
  })

  it('Renders cost center tabs when feature flag is enabled', async () => {
    const routePayload = getCostCentersRoutePayload()
    const environment = createMockEnvironment()
    mockFeatureFlagEnabled(true)
    render(
      <RelayEnvironmentProvider environment={environment}>
        <CostCentersPage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )

    expect(await screen.findByTestId('active-cost-centers-tab')).toHaveAttribute('aria-current', 'page')
    expect(await screen.findByTestId('deleted-cost-centers-tab')).not.toHaveAttribute('aria-current', 'page')
    expect(await screen.findByText(/1 active cost center/)).toBeInTheDocument()

    const tab = await screen.findByTestId('deleted-cost-centers-tab')
    fireEvent.click(tab)

    expect(await screen.findByTestId('active-cost-centers-tab')).not.toHaveAttribute('aria-current', 'page')
    expect(await screen.findByTestId('deleted-cost-centers-tab')).toHaveAttribute('aria-current', 'page')
    expect(await screen.findByText(/0 deleted cost centers/)).toBeInTheDocument()
  })
})
