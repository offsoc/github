import {render, screen} from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports
import {useNavigate, useSearchParams} from 'react-router-dom'

import {ActionButtons} from '../../../../client/pages/insights/components/insights-configuration-pane/action-buttons'
import {useInsightsConfigurationPane} from '../../../../client/pages/insights/hooks/use-insights-configuration-pane'
import {useChartActions} from '../../../../client/state-providers/charts/use-chart-actions'
import {type ChartState, useCharts} from '../../../../client/state-providers/charts/use-charts'
import {asMockHook} from '../../../mocks/stub-utilities'
import {existingProject} from '../../../state-providers/memex/helpers'
import {createWrapperWithContexts} from '../../../wrapper-utils'

let isDefaultChart: boolean
let dirtyChartState: {isConfigurationDirty: boolean; isDirty: boolean}

const config = {
  filter: '',
  type: 'bar' as const,
  xAxis: {dataSource: {column: 1}},
  yAxis: {aggregate: {operation: 'count' as const}},
}

const chart: ChartState = {
  number: 1,
  name: 'Chart 1',
  localVersion: {configuration: config},
  serverVersion: {configuration: config},
}

jest.mock('../../../../client/pages/insights/hooks/use-insights-configuration-pane')
jest.mock('react-router-dom')
jest.mock('../../../../client/state-providers/charts/use-charts')
jest.mock('../../../../client/state-providers/charts/use-chart-actions')
jest.mock('../../../../client/state-providers/charts/chart-helpers', () => ({
  __esModule: true,
  isDefaultChart: jest.fn(() => isDefaultChart),
  getDirtyChartState: jest.fn(() => dirtyChartState),
}))
jest.mock('../../../../client/router/use-project-route-params', () => {
  return {
    useProjectRouteParams: () => {
      return {
        ownerIdentifier: 'monsalista',
        ownerType: 'orgs',
        projectNumber: 1,
      }
    },
  }
})

jest.mock('../../../../client/state-providers/memex/use-project-state', () => ({
  useProjectState: () => ({isPublicProject: true}),
}))

const getWrapper = () => {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = createWrapperWithContexts({
    ProjectNumber: existingProject(),
  })
  return wrapper
}

describe('ActionButtons', () => {
  beforeEach(() => {
    asMockHook(useInsightsConfigurationPane).mockReturnValue({
      closePane: jest.fn(),
    })
    asMockHook(useNavigate).mockReturnValue(jest.fn())
    asMockHook(useSearchParams).mockReturnValue([new URLSearchParams(), jest.fn()])
    asMockHook(useChartActions).mockReturnValue({})
    asMockHook(useCharts).mockReturnValue({})

    isDefaultChart = false
    dirtyChartState = {isConfigurationDirty: false, isDirty: false}
  })

  it('should disable buttons if config is not dirty', () => {
    render(<ActionButtons chart={chart} showUpsellDialog={jest.fn()} />, {wrapper: getWrapper()})

    const button = screen.getByTestId('insights-save-changes')
    expect(button).toBeDisabled()

    const discardText = screen.getByTestId('insights-discard-changes')
    expect(discardText).toBeDisabled()
  })

  it('should enable buttons is config is dirty', () => {
    dirtyChartState.isConfigurationDirty = true
    dirtyChartState.isDirty = true

    render(<ActionButtons chart={chart} showUpsellDialog={jest.fn()} />, {wrapper: getWrapper()})

    const button = screen.getByTestId('insights-save-changes')
    expect(button).toBeEnabled()

    const discardText = screen.getByTestId('insights-discard-changes')
    expect(discardText).toBeEnabled()
  })
})
