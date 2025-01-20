import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import {getEditHostedComputeNetworkingPolicySettingsRoutePayload} from '../test-utils/mock-data'
import {EditHostedComputeNetworkingPolicySettings} from '../routes/EditHostedComputeNetworkingPolicySettings'

test('Renders the EditHostedComputeNetworkingPolicySettings', () => {
  const payload = getEditHostedComputeNetworkingPolicySettingsRoutePayload()
  payload.orgsCanCreateNetworkConfigurations = true
  render(<EditHostedComputeNetworkingPolicySettings />, {routePayload: payload})
  expect(screen.getByText(NetworkConfigurationConsts.hostedComputeNetworkingTitle)).toBeInTheDocument()
})

describe('Organization network configuration creation checkboxes', () => {
  test('when orgs are allowed to create network configurations', () => {
    const payload = getEditHostedComputeNetworkingPolicySettingsRoutePayload()
    payload.orgsCanCreateNetworkConfigurations = true
    render(<EditHostedComputeNetworkingPolicySettings />, {routePayload: payload})

    expect(screen.getByTestId('orgsCanCreate')).toBeChecked()
    expect(screen.getByTestId('orgsCannotCreate')).not.toBeChecked()
  })

  test('when orgs are not allowed to create network configurations', () => {
    const payload = getEditHostedComputeNetworkingPolicySettingsRoutePayload()
    payload.orgsCanCreateNetworkConfigurations = false
    render(<EditHostedComputeNetworkingPolicySettings />, {routePayload: payload})

    expect(screen.getByTestId('orgsCanCreate')).not.toBeChecked()
    expect(screen.getByTestId('orgsCannotCreate')).toBeChecked()
  })
})
