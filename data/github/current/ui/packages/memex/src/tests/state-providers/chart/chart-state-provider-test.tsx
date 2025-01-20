import {act, render, renderHook, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import ToastContainer from '../../../client/components/toasts/toast-container'
import useToasts from '../../../client/components/toasts/use-toasts'
import {ChartStateProvider} from '../../../client/state-providers/charts/chart-state-provider'
import {useChartActions} from '../../../client/state-providers/charts/use-chart-actions'
import {useCharts} from '../../../client/state-providers/charts/use-charts'
import {ProjectNumberContext} from '../../../client/state-providers/memex/memex-state-provider'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {createMockEnvironment} from '../../create-mock-environment'
import {asMockHook} from '../../mocks/stub-utilities'
import {existingProject} from '../memex/helpers'

jest.mock('../../../client/components/toasts/use-toasts')

function Wrapper({children}: {children: React.ReactNode}) {
  createMockEnvironment({
    jsonIslandData: {
      'memex-data': DefaultMemex,
      'memex-enabled-features': ['memex_charts_basic_public'],
      'memex-limits': {
        limitedChartsLimit: 2,
        projectItemLimit: 1200,
        projectItemArchiveLimit: 10_000,
        singleSelectColumnOptionsLimit: 25,
        autoAddCreationLimit: 4,
        viewsLimit: 50,
      },
      'github-billing-enabled': true,
    },
  })
  return (
    <MemoryRouter initialEntries={['/orgs/monalisa/projects/1']}>
      <ToastContainer>
        <ProjectNumberContext.Provider value={existingProject()}>
          <ChartStateProvider>{children}</ChartStateProvider>
        </ProjectNumberContext.Provider>
      </ToastContainer>
    </MemoryRouter>
  )
}

jest.mock('../../../client/state-providers/memex/use-project-state', () => ({
  useProjectState: () => ({
    isPublicProject: false,
  }),
}))

jest.mock('../../../client/state-providers/columns/use-find-column', () => ({
  useFindColumn: jest.fn().mockImplementation(() => {
    return {findColumn: jest.fn().mockImplementation(() => 1)}
  }),
}))

jest.mock('../../../client/state-providers/columns/use-find-column-by-database-id', () => ({
  useFindColumnByDatabaseId: jest.fn().mockImplementation(() => {
    return {findColumnbyDatabaseId: jest.fn().mockImplementation(() => 'columnName')}
  }),
}))

describe('ChartStateProvider', () => {
  let addToast: ReturnType<typeof useToasts>['addToast']

  beforeEach(() => {
    addToast = jest.fn<
      ReturnType<ReturnType<typeof useToasts>['addToast']>,
      Parameters<ReturnType<typeof useToasts>['addToast']>
    >()

    asMockHook(useToasts).mockReturnValue({
      addToast,
    })
  })

  it('renders without error', () => {
    render(<div>Some children</div>, {wrapper: Wrapper})

    expect(screen.getByText('Some children')).toBeInTheDocument()
  })

  it('provides methods for interacting with chart set via the useCharts hook', async () => {
    const {result} = renderHook(
      () => {
        return {...useCharts(), ...useChartActions()}
      },
      {
        wrapper: Wrapper,
      },
    )

    const defaultConfig = result.current.getDefaultChart().chart.configuration
    const request = result.current.getCreateChartRequest()
    const configuration = request.chart.configuration
    const defaultChart = {
      description: 'This chart shows the current status for the total number of items in your project.',
      localVersion: {configuration: defaultConfig},
      name: 'Status chart',
      number: 0,
      serverVersion: {configuration: defaultConfig},
    }

    expect(result.current.chartConfigurations).toEqual({
      0: defaultChart,
    })

    await act(async () => {
      await result.current.createChartConfiguration.perform(request)
    })

    expect(result.current.chartConfigurations).toEqual({
      0: defaultChart,
      1: {
        number: 1,
        name: 'Chart: 1',
        localVersion: {
          configuration,
        },
        serverVersion: {
          configuration,
        },
      },
    })

    expect(result.current.getChartConfigurationByNumber(100000)).toEqual(undefined)

    let item = result.current.chartConfigurations[1]

    const updatedBarChartConfig = {
      ...configuration,
      type: 'bar' as const,
    }

    // update a charts local config
    act(() => {
      result.current.updateLocalChartConfiguration(item.number, updatedBarChartConfig)
    })

    item = result.current.chartConfigurations[1]

    expect(item.localVersion.configuration).toEqual(updatedBarChartConfig)

    // update the locally modified chart's name only
    await act(async () => {
      await result.current.updateChartName.perform({
        chartNumber: item.number,
        chart: {
          name: 'Test chart updated',
        },
      })
    })

    expect(result.current.chartConfigurations).toEqual({
      0: defaultChart,
      1: {
        number: 1,
        name: 'Test chart updated',
        localVersion: {
          configuration: updatedBarChartConfig,
        },
        serverVersion: {
          configuration,
        },
      },
    })

    /**
     * update call for a non-existant chart configuration should error
     */
    await act(async () => {
      await result.current.updateChartConfiguration.perform({
        chartNumber: 200,
        chart: {name: 'Test chart updated 2x', configuration},
      })
      expect(addToast).toHaveBeenCalledWith({message: 'No chart exists for chartNumber: 200', type: 'error'})
    })

    expect(result.current.chartConfigurations).toEqual({
      0: defaultChart,
      1: {
        number: 1,
        description: undefined,
        name: 'Test chart updated',
        localVersion: {
          configuration: updatedBarChartConfig,
        },
        serverVersion: {
          configuration,
        },
      },
    })

    item = result.current.chartConfigurations[1]

    // update the locally modified chart's configuration on the server
    await act(async () => {
      await result.current.updateChartConfiguration.perform({
        chartNumber: item.number,
        chart: {
          configuration: updatedBarChartConfig,
        },
      })
    })

    expect(result.current.chartConfigurations).toEqual({
      0: defaultChart,
      1: {
        number: 1,
        description: undefined,
        name: 'Test chart updated',
        localVersion: {
          configuration: updatedBarChartConfig,
        },
        serverVersion: {
          configuration: updatedBarChartConfig,
        },
      },
    })

    expect(result.current.canCreateChart()).toBe(true)

    await act(async () => {
      await result.current.createChartConfiguration.perform(result.current.getCreateChartRequest())
    })

    expect(result.current.chartConfigurations).toEqual({
      0: defaultChart,
      1: {
        number: 1,
        description: undefined,
        name: 'Test chart updated',
        localVersion: {
          configuration: updatedBarChartConfig,
        },
        serverVersion: {
          configuration: updatedBarChartConfig,
        },
      },
      2: {
        number: 2,
        name: 'Chart: 2',
        localVersion: {
          configuration,
        },
        serverVersion: {
          configuration,
        },
      },
    })

    // Without memex_charts_basic_private feature gate enabled,
    // the maximum number of saved charts in a private project is 2 (limitedChartsLimit).
    expect(result.current.canCreateChart()).toBe(false)

    await act(async () => {
      await result.current.destroyChartConfiguration.perform(item.number)
    })

    expect(result.current.chartConfigurations).toEqual({
      0: defaultChart,
      2: {
        number: 2,
        name: 'Chart: 2',
        localVersion: {
          configuration,
        },
        serverVersion: {
          configuration,
        },
      },
    })

    expect(result.current.canCreateChart()).toBe(true)
  })

  describe('updateChartConfigurations', () => {
    it('updates local state to match server state when new charts are added / removed', () => {
      const {result} = renderHook(
        () => {
          return {...useCharts(), ...useChartActions()}
        },
        {
          wrapper: Wrapper,
        },
      )

      // Just the default chart
      expect(Object.keys(result.current.chartConfigurations)).toHaveLength(1)

      act(() => {
        result.current.updateChartConfigurations([
          {
            number: 1,
            name: 'New chart',
            configuration: {
              type: 'bar',
              filter: '',
              xAxis: {
                dataSource: {
                  column: 'time',
                },
              },
              yAxis: {
                aggregate: {
                  operation: 'sum',
                },
              },
            },
          },
        ])
      })

      // Default chart + one new chart
      expect(Object.keys(result.current.chartConfigurations)).toHaveLength(2)
      expect(result.current.chartConfigurations[1].localVersion.configuration.type).toBe('bar')

      act(() => {
        result.current.updateChartConfigurations([
          {
            number: 1,
            name: 'New chart',
            ...result.current.chartConfigurations[1].serverVersion,
            configuration: {
              ...result.current.chartConfigurations[1].serverVersion.configuration,
              type: 'line',
            },
          },
        ])
      })

      // Default chart + one new chart
      expect(Object.keys(result.current.chartConfigurations)).toHaveLength(2)
      // The type of the custom chart should now be line
      expect(result.current.chartConfigurations[1].localVersion.configuration.type).toBe('line')
      // Ensure the default chart still has a description
      expect(result.current.chartConfigurations[0].description).toBeTruthy()

      act(() => {
        result.current.updateChartConfigurations([])
      })

      // Just the default chart
      expect(Object.keys(result.current.chartConfigurations)).toHaveLength(1)
    })

    it('does not update local state if dirty', () => {
      const {result} = renderHook(
        () => {
          return {...useCharts(), ...useChartActions()}
        },
        {
          wrapper: Wrapper,
        },
      )

      act(() => {
        result.current.updateChartConfigurations([
          {
            number: 1,
            name: 'New chart',
            configuration: {
              type: 'bar',
              filter: '',
              xAxis: {
                dataSource: {
                  column: 'time',
                },
              },
              yAxis: {
                aggregate: {
                  operation: 'sum',
                },
              },
            },
          },
        ])
      })

      expect(result.current.chartConfigurations[1].localVersion.configuration.type).toBe('bar')

      act(() => {
        result.current.updateLocalChartConfiguration(1, {type: 'column'})
      })

      expect(result.current.chartConfigurations[1].localVersion.configuration.type).toBe('column')

      act(() => {
        result.current.updateChartConfigurations([
          {
            number: 1,
            name: 'Chart name changed',
            ...result.current.chartConfigurations[1].serverVersion,
            configuration: {
              ...result.current.chartConfigurations[1].serverVersion.configuration,
              type: 'line',
            },
          },
        ])
      })

      // The type of the custom chart's local version should still be column
      expect(result.current.chartConfigurations[1].localVersion.configuration.type).toBe('column')

      // The type of the custom chart's server version should now be line
      expect(result.current.chartConfigurations[1].serverVersion.configuration.type).toBe('line')

      // The updated chart name is reflected despite being dirty
      expect(result.current.chartConfigurations[1].name).toBe('Chart name changed')
    })
  })
})
