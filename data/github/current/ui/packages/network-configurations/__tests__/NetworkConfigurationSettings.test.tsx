import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {NetworkConfigurationSettings} from '../routes/NetworkConfigurationSettings'
import {getNetworkConfigurationSettingsRoutePayload} from '../test-utils/mock-data'
import {ComputeService} from '../classes/network-configuration'

test('Renders NetworkConfiguration show page', () => {
  const payload = getNetworkConfigurationSettingsRoutePayload()
  payload.canEditNetworkConfiguration = true
  render(<NetworkConfigurationSettings />, {routePayload: payload})
  expect(screen.getByText('Hosted compute networking')).toBeInTheDocument()
  expect(screen.getByText('test-resourceName')).toBeInTheDocument()
})

test('Renders NetworkConfiguration show page enabled banner when disabled', () => {
  const payload = getNetworkConfigurationSettingsRoutePayload()
  payload.canEditNetworkConfiguration = true
  payload.networkConfiguration.computeService = ComputeService.None
  render(<NetworkConfigurationSettings />, {routePayload: payload})
  expect(screen.getByText('Hosted compute networking')).toBeInTheDocument()
  expect(
    screen.getByText(
      'This network configuration is currently disabled. Runner groups using this configuration will not work.',
    ),
  ).toBeInTheDocument()
  expect(screen.getByText('Enable configuration')).toBeInTheDocument()
  expect(screen.getByText('test-resourceName')).toBeInTheDocument()
})

test('Renders NetworkConfiguration show page enabled banner when disable org edit', () => {
  const payload = getNetworkConfigurationSettingsRoutePayload()
  payload.canEditNetworkConfiguration = false
  payload.networkConfiguration.computeService = ComputeService.None
  render(<NetworkConfigurationSettings />, {routePayload: payload})
  expect(screen.getByText('Hosted compute networking')).toBeInTheDocument()
  expect(
    screen.getByText(
      'This network configuration is currently disabled. Runner groups using this configuration will not work.',
    ),
  ).toBeInTheDocument()
  expect(screen.queryByText('Enable configuration')).not.toBeInTheDocument()
  expect(screen.getByText('test-resourceName')).toBeInTheDocument()
})
