import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {NetworkConfigurations} from '../routes/NetworkConfigurations'
import {getNetworkConfigurationsRoutePayload} from '../test-utils/mock-data'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'

test('Renders the NetworkConfigurations Business Empty State card', () => {
  const payload = getNetworkConfigurationsRoutePayload()
  payload.networks = []
  payload.isBusiness = true
  payload.canEditNetworkConfiguration = true
  render(<NetworkConfigurations />, {routePayload: payload})
  expect(screen.getByText('Hosted compute networking')).toBeInTheDocument()
  expect(
    screen.getByText(NetworkConfigurationConsts.noNetworkConfigurationsAddedDescriptionBusiness),
  ).toBeInTheDocument()
})

test('Renders the NetworkConfigurations Org Empty State card', () => {
  const payload = getNetworkConfigurationsRoutePayload()
  payload.networks = []
  payload.canEditNetworkConfiguration = true
  render(<NetworkConfigurations />, {routePayload: payload})
  expect(screen.getByText('Hosted compute networking')).toBeInTheDocument()
  expect(screen.getByText(NetworkConfigurationConsts.noNetworkConfigurationsAddedDescriptionOrg)).toBeInTheDocument()
})

test('Renders the NetworkConfigurations Org List', () => {
  const payload = getNetworkConfigurationsRoutePayload()
  payload.isBusiness = true
  payload.canEditNetworkConfiguration = true
  render(<NetworkConfigurations />, {routePayload: payload})
  expect(screen.getByText('Hosted compute networking')).toBeInTheDocument()
  expect(screen.getByText('test-name')).toBeInTheDocument()
})

test('Renders OrgDisabledEmptyStateCard when disabled', () => {
  const payload = getNetworkConfigurationsRoutePayload()
  payload.networks = []
  payload.canEditNetworkConfiguration = false
  render(<NetworkConfigurations />, {routePayload: payload})
  expect(screen.getByText(NetworkConfigurationConsts.orgDisabledEmptyStateCardDescription)).toBeInTheDocument()
})

test('Renders NetworkConfigurationList when disabled', () => {
  const payload = getNetworkConfigurationsRoutePayload()
  payload.canEditNetworkConfiguration = false
  render(<NetworkConfigurations />, {routePayload: payload})
  expect(screen.getByText('Hosted compute networking')).toBeInTheDocument()
  expect(screen.getByText('test-name')).toBeInTheDocument()
})
