import useIsMounted from '@github-ui/use-is-mounted'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {apiCreateChart} from '../../api/charts/api-create-chart'
import {apiDestroyChart} from '../../api/charts/api-destroy-chart'
import {apiUpdateChart} from '../../api/charts/api-update-chart'
import {
  type CreateMemexChartRequest,
  DEFAULT_CHART_TIME_PERIOD,
  type MemexChart,
  type MemexChartConfiguration,
  type UpdateMemexChartRequest,
} from '../../api/charts/contracts/api'
import {
  InsightsChartCreate,
  InsightsChartDelete,
  InsightsChartDiscardLocal,
  InsightsChartRename,
  InsightsChartUpdate,
  InsightsChartUpdateLocal,
  type InsightsStatsType,
} from '../../api/stats/contracts'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {isNumber} from '../../helpers/parsing'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useApiRequest} from '../../hooks/use-api-request'
import {useInsightsEnabledFeatures} from '../../pages/insights/hooks/use-insights-features'
import {
  FILTER_QUERY_PARAM,
  VIEW_TYPE_PARAM,
  X_AXIS_DATASOURCE_COLUMN_PARAM,
  X_AXIS_GROUP_BY_PARAM,
  Y_AXIS_AGGREGATE_COLUMNS_PARAM,
  Y_AXIS_AGGREGATE_OPERATION_PARAM,
} from '../../platform/url'
import {useProjectRouteParams} from '../../router/use-project-route-params'
import {PROJECT_INSIGHTS_NUMBER_ROUTE, PROJECT_INSIGHTS_ROUTE} from '../../routes'
import {InsightsResources} from '../../strings'
import {useFindColumn} from '../columns/use-find-column'
import {useFindColumnByDatabaseId} from '../columns/use-find-column-by-database-id'
import {getDirtyChartState, isAggregateOperation, isChartLayout, isDefaultChart} from './chart-helpers'
import {ChartActionsContext} from './use-chart-actions'
import {type ChartState, ChartStateContext} from './use-charts'
import {useGetChartLinkParameters} from './use-set-next-chart-params'

export function createTrackableChart(chart: MemexChart, overrides?: Partial<MemexChart['configuration']>): ChartState {
  const {
    configuration: {description, ...restConfiguration},
  } = chart
  // Set a default time period for historical charts created
  // before time period persistence was added.
  const {time, xAxis} = restConfiguration
  if (!time && xAxis.dataSource.column === 'time') {
    restConfiguration.time = {period: DEFAULT_CHART_TIME_PERIOD}
  }
  return {
    number: chart.number,
    name: chart.name,
    description,
    localVersion: {
      configuration: {
        ...restConfiguration,
        ...overrides,
      },
    },
    serverVersion: {
      configuration: restConfiguration,
    },
  }
}

function useGetOverrides() {
  const {hasUnlimitedSavedCharts} = useInsightsEnabledFeatures()

  const getOverrides = useCallback(
    (searchParams: URLSearchParams) => {
      const overrides: Partial<MemexChartConfiguration> = {}

      if (hasUnlimitedSavedCharts) {
        const layoutTypeParam = searchParams.get(VIEW_TYPE_PARAM)
        if (layoutTypeParam != null) {
          if (isChartLayout(layoutTypeParam)) {
            overrides.type = layoutTypeParam
          }
        }

        const xAxisDataSourceColumnParam = searchParams.get(X_AXIS_DATASOURCE_COLUMN_PARAM)
        const xAxisGroupedByParam = searchParams.get(X_AXIS_GROUP_BY_PARAM)
        if (xAxisDataSourceColumnParam != null && xAxisGroupedByParam != null) {
          overrides.xAxis = {
            dataSource:
              xAxisDataSourceColumnParam === 'time'
                ? {column: 'time'}
                : {column: parseInt(xAxisDataSourceColumnParam, 10)},
            groupBy: xAxisGroupedByParam
              ? {
                  column: parseInt(xAxisGroupedByParam, 10),
                }
              : undefined,
          }
        }

        const yAxisAggregateOperation = searchParams.get(Y_AXIS_AGGREGATE_OPERATION_PARAM)
        const yAxisAggregateColumns = searchParams.get(Y_AXIS_AGGREGATE_COLUMNS_PARAM)

        if (yAxisAggregateOperation != null && yAxisAggregateColumns != null) {
          if (isAggregateOperation(yAxisAggregateOperation)) {
            overrides.yAxis = {
              aggregate: {
                operation: yAxisAggregateOperation,
                columns: yAxisAggregateColumns ? [parseInt(yAxisAggregateColumns, 10)] : undefined,
              },
            }
          }
        }
      }

      const filterQueryParams = searchParams.get(FILTER_QUERY_PARAM)
      if (filterQueryParams != null) {
        overrides.filter = filterQueryParams
      }

      return overrides
    },
    [hasUnlimitedSavedCharts],
  )
  return {getOverrides}
}

/**
 * Using a newChart (from the server) and potentially an oldChartState (from local state if it exists),
 * creates a new ChartState that persists any local changes if the oldChartState exists and is dirty.
 *
 * The serverVersion of the newChart will _always_ be used, so that if the user discards their local
 * changes, they will revert to the latest server version.
 * @param newChart A chart configuration from the server
 * @param oldChartState An existing chart state from local state
 * @returns A new chart state that persists local changes if the oldChartState exists and is dirty
 */
function updateChartFromServer(newChart: MemexChart, oldChartState: ChartState | undefined): ChartState {
  if (oldChartState && getDirtyChartState(oldChartState).isDirty) {
    return {...oldChartState, name: newChart.name, serverVersion: {configuration: newChart.configuration}}
  }
  return createTrackableChart(newChart)
}

export const ChartStateProvider = memo(function ChartStateProvider({children}: {children: React.ReactNode}) {
  const {isInsightsEnabled, hasUnlimitedSavedCharts, savedChartsLimit} = useInsightsEnabledFeatures()
  const {getChartLinkParameters} = useGetChartLinkParameters()
  const {getInitialChartState} = useGetInitialChartState()
  const {getOverrides} = useGetOverrides()
  const {findColumn} = useFindColumn()
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()
  const {postStats} = usePostStats()
  const isMounted = useIsMounted()
  const postStatsTimeoutRef = useRef<{[chartNumber: number]: number}>({})

  const getBurnUpCreateChartRequest = useCallback((): CreateMemexChartRequest => {
    /**
     * The assertion is safe here, because the status column always exists.
     *
     * We must call `findColumn` here, and not memoize its result in the component
     * body because it relies on an implementation that won't change when the underlying
     * columns change, and therefore may cache an old value, rather the the current
     * value at lookup time.  This is only an issue when we have a new project,
     * with a null `databaseId` for this column, and save the project. The databaseId
     * updates, but the `useMemo` hook will not be re-invoked, since findColumn is stable
     * only referring to a ref that tracks the values of the column state
     */
    const statusColumn = not_typesafe_nonNullAssertion(findColumn('Status'))
    return {
      chart: {
        configuration: {
          filter: 'is:issue',
          type: 'stacked-area',
          xAxis: {
            dataSource: {column: 'time'},
            groupBy: {column: statusColumn.databaseId},
          },
          yAxis: {
            aggregate: {operation: 'count'},
          },
          time: {
            period: DEFAULT_CHART_TIME_PERIOD,
          },
        },
      },
    }
  }, [findColumn])

  /**
   * Default new charts to a simple current state column chart of project Status.
   */
  const getColumnCreateChartRequest = useCallback((): CreateMemexChartRequest => {
    /**
     * The assertion is safe here, because the status column always exists.
     *
     * We must call `findColumn` here, and not memoize its result in the component
     * body because it relies on an implementation that won't change when the underlying
     * columns change, and therefore may cache an old value, rather the the current
     * value at lookup time.  This is only an issue when we have a new project,
     * with a null `databaseId` for this column, and save the project. The databaseId
     * updates, but the `useMemo` hook will not be re-invoked, since findColumn is stable
     * only referring to a ref that tracks the values of the column state
     */
    const statusColumn = not_typesafe_nonNullAssertion(findColumn('Status'))
    return {
      chart: {
        configuration: {
          filter: '',
          type: 'column',
          xAxis: {
            dataSource: {column: statusColumn.databaseId},
          },
          yAxis: {
            aggregate: {operation: 'count'},
          },
        },
      },
    }
  }, [findColumn])

  const getDefaultChart = useCallback((): CreateMemexChartRequest => {
    return isInsightsEnabled ? getBurnUpCreateChartRequest() : getColumnCreateChartRequest()
  }, [getBurnUpCreateChartRequest, getColumnCreateChartRequest, isInsightsEnabled])

  const getCreateChartRequest = useCallback((): CreateMemexChartRequest => {
    return getColumnCreateChartRequest()
  }, [getColumnCreateChartRequest])

  const [chartConfigurations, setChartConfigurations] = useState(() => {
    return getInitialChartState(getDefaultChart().chart.configuration)
  })

  const canCreateChart = useCallback((): boolean => {
    return (
      hasUnlimitedSavedCharts ||
      Object.values(chartConfigurations).filter(chart => !isDefaultChart(chart)).length < savedChartsLimit
    )
  }, [chartConfigurations, hasUnlimitedSavedCharts, savedChartsLimit])

  //#region Stateful lookups
  const getChartConfigurationByNumber = useCallback(
    (chartNumber: number) => {
      return chartConfigurations[chartNumber]
    },
    [chartConfigurations],
  )
  const projectRouteParams = useProjectRouteParams()
  const getChartLinkTo = useCallback(
    (chartNumber: number) => {
      const chart = getChartConfigurationByNumber(chartNumber)

      if (!chart) {
        const pathname = PROJECT_INSIGHTS_ROUTE.generatePath(projectRouteParams)

        return {
          url: pathname,
          pathname,
          search: '',
        }
      }

      const pathname = isDefaultChart(chart)
        ? PROJECT_INSIGHTS_ROUTE.generatePath(projectRouteParams)
        : PROJECT_INSIGHTS_NUMBER_ROUTE.generatePath({...projectRouteParams, insightNumber: chart.number})
      const nextParams = getChartLinkParameters(chart)

      const search = nextParams.toString()
      return {
        url: `${pathname}${search ? `?${search}` : ''}`,
        pathname,
        search,
      }
    },
    [getChartConfigurationByNumber, getChartLinkParameters, projectRouteParams],
  )
  //#endregion

  //#region Stateless interactions

  const postInsightsStats = useCallback(
    (action: InsightsStatsType, chartNumber: number, configuration?: Partial<MemexChartConfiguration>) => {
      if (postStatsTimeoutRef.current[chartNumber]) {
        window.clearTimeout(postStatsTimeoutRef.current[chartNumber])
      }
      postStatsTimeoutRef.current[chartNumber] = window.setTimeout(() => {
        if (isMounted()) {
          const columnNames: {[key: string]: string | undefined} = {}
          if (action === InsightsChartCreate || action === InsightsChartUpdate) {
            const dataSource = configuration?.xAxis?.dataSource?.column
            columnNames.dataSourceName = isNumber(dataSource) ? findColumnByDatabaseId(dataSource)?.name : dataSource
            const groupBy = configuration?.xAxis?.groupBy?.column
            columnNames.groupByName = isNumber(groupBy) ? findColumnByDatabaseId(groupBy)?.name : groupBy
            const aggregate = configuration?.yAxis?.aggregate?.columns?.[0]
            columnNames.aggregateName = isNumber(aggregate) ? findColumnByDatabaseId(aggregate)?.name : aggregate
          }
          postStats({
            name: action,
            context: JSON.stringify({chartNumber, ...columnNames, ...configuration}),
          })
        }
      }, 250)
    },
    [findColumnByDatabaseId, isMounted, postStats],
  )

  const createChartConfiguration = useApiRequest({
    request: useCallback(
      async function createChartConfigurationRequest(request: CreateMemexChartRequest) {
        const newChart = await apiCreateChart(request)
        setChartConfigurations(prevConfigurations => {
          return {
            ...prevConfigurations,
            [newChart.chart.number]: createTrackableChart(newChart.chart),
          }
        })
        postInsightsStats(InsightsChartCreate, newChart.chart.number, newChart.chart.configuration)
        return newChart
      },
      [postInsightsStats],
    ),
  })

  const updateChartName = useApiRequest({
    request: useCallback(
      async function updateChartConfigurationRequest(request: UpdateMemexChartRequest) {
        if (request.chartNumber < 0) throw new Error('Invalid chart number')
        const updatedChart = await apiUpdateChart(request)
        setChartConfigurations(prevConfigurations => {
          return {
            ...prevConfigurations,
            [updatedChart.chart.number]: {
              ...prevConfigurations[updatedChart.chart.number],
              name: updatedChart.chart.name,
            },
          }
        })
        postInsightsStats(InsightsChartRename, updatedChart.chart.number, updatedChart.chart.configuration)
        return updatedChart
      },
      [postInsightsStats],
    ),
  })

  const updateChartConfiguration = useApiRequest({
    request: useCallback(
      async function updateChartConfigurationRequest(request: UpdateMemexChartRequest) {
        if (request.chartNumber < 0) throw new Error('Invalid chart number')
        const updatedChart = await apiUpdateChart(request)
        setChartConfigurations(prevConfigurations => {
          return {
            ...prevConfigurations,
            [updatedChart.chart.number]: createTrackableChart(updatedChart.chart),
          }
        })
        postInsightsStats(InsightsChartUpdate, updatedChart.chart.number, updatedChart.chart.configuration)
        return updatedChart
      },
      [postInsightsStats],
    ),
  })

  const destroyChartConfiguration = useApiRequest({
    request: useCallback(
      async function destroyChartConfigurationRequest(chartNumber: number) {
        if (chartNumber < 0) throw new Error('Invalid chart number')
        await apiDestroyChart({chartNumber})
        setChartConfigurations(prevConfigurations => {
          if (!prevConfigurations[chartNumber]) return prevConfigurations
          const {[chartNumber]: removedConfiguration, ...restConfigurations} = prevConfigurations
          return restConfigurations
        })
        postInsightsStats(InsightsChartDelete, chartNumber)
      },
      [postInsightsStats],
    ),
  })

  const updateLocalChartConfiguration = useCallback(
    (chartNumber: number, configuration: Partial<MemexChartConfiguration>) => {
      setChartConfigurations(prevConfigurations => {
        // The filter bar can trigger unnecessary callbacks, including on navigation between charts.  Check if we can ignore it.
        const prevConfig = prevConfigurations[chartNumber]
        const ignore =
          !prevConfig ||
          (configuration.filter !== undefined &&
            Object.keys(configuration).length === 1 &&
            configuration.filter === prevConfig.localVersion.configuration.filter)
        if (ignore) return prevConfigurations
        // postInsightsStats() is included here within setState because it's dependent on checking prevConfig for changes.
        // Stats are posted async after a delay, so calling it should not affect the UI responsiveness.
        postInsightsStats(InsightsChartUpdateLocal, chartNumber, configuration)
        return {
          ...prevConfigurations,
          [chartNumber]: {
            ...prevConfig,
            localVersion: {
              configuration: {
                ...prevConfig.localVersion.configuration,
                ...configuration,
              },
            },
          },
        }
      })
    },
    [postInsightsStats],
  )

  const resetLocalChangesForChartNumber = useCallback(
    (chartNumber: number) => {
      setChartConfigurations(prevConfigurations => {
        const prevConfigForChartNumber = prevConfigurations[chartNumber]
        if (!prevConfigForChartNumber) return prevConfigurations
        return {
          ...prevConfigurations,
          [chartNumber]: {
            ...prevConfigForChartNumber,
            localVersion: prevConfigForChartNumber.serverVersion,
          },
        }
      })
      postInsightsStats(InsightsChartDiscardLocal, chartNumber)
    },
    [postInsightsStats],
  )
  //#endregion

  const getChartsRef = useTrackingRef(getChartConfigurationByNumber)
  /**
   * On popstate, set the filters from the url, overriding other changes
   */
  useEffect(
    function syncLocalStateWithUrlOnPopState() {
      function handlePopState() {
        const insightsNumberMatch = PROJECT_INSIGHTS_NUMBER_ROUTE.matchFullPath(window.location.pathname)
        const insightsMatch = PROJECT_INSIGHTS_ROUTE.matchFullPath(window.location.pathname)

        let insightsNumber: number
        if (insightsNumberMatch && insightsNumberMatch.params.insightNumber) {
          insightsNumber = parseInt(insightsNumberMatch.params.insightNumber, 10)
        } else if (insightsMatch) {
          insightsNumber = 0
        } else {
          return
        }
        const chart = getChartsRef.current(insightsNumber)
        const params = new URLSearchParams(window.location.search)

        if (chart) {
          updateLocalChartConfiguration(chart.number, {
            ...chart.serverVersion.configuration,
            ...getOverrides(params),
          })
        }
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    },
    [getChartsRef, getOverrides, updateLocalChartConfiguration],
  )

  const updateChartConfigurations = useCallback((charts: Array<MemexChart>) => {
    setChartConfigurations(oldChartStates => {
      const newChartStates = Object.fromEntries(
        charts.map(newChart => {
          const mergedChartState = updateChartFromServer(newChart, oldChartStates[newChart.number])
          return [mergedChartState.number, mergedChartState]
        }),
      )
      // Default Chart is number: 0 and won't be included in data from the server, so we add it here.
      // This doesn't catch the edge case if Insights enablement is changed, but refresh doesn't include feature flag values anyway.
      newChartStates[0] = not_typesafe_nonNullAssertion(oldChartStates[0])
      return newChartStates
    })
  }, [])

  return (
    <ChartStateContext.Provider
      value={useMemo(() => {
        return {
          chartConfigurations,
          getChartConfigurationByNumber,
          getChartLinkTo,
          getDefaultChart,
          getCreateChartRequest,
          canCreateChart,
          updateChartConfigurations,
        }
      }, [
        chartConfigurations,
        getChartConfigurationByNumber,
        getChartLinkTo,
        getDefaultChart,
        getCreateChartRequest,
        canCreateChart,
        updateChartConfigurations,
      ])}
    >
      <ChartActionsContext.Provider
        value={useMemo(() => {
          return {
            createChartConfiguration,
            updateChartConfiguration,
            updateChartName,
            destroyChartConfiguration,
            updateLocalChartConfiguration,
            resetLocalChangesForChartNumber,
          }
        }, [
          createChartConfiguration,
          destroyChartConfiguration,
          updateChartConfiguration,
          updateChartName,
          updateLocalChartConfiguration,
          resetLocalChangesForChartNumber,
        ])}
      >
        {children}
      </ChartActionsContext.Provider>
    </ChartStateContext.Provider>
  )
})

function useGetInitialChartState() {
  const {getOverrides} = useGetOverrides()

  const getInitialChartState = useCallback(
    (defaultChartConfiguration: MemexChartConfiguration) => {
      const initialCharts = fetchJSONIslandData('memex-charts-data') ?? []
      const isInsightsBurnUpChart = defaultChartConfiguration.xAxis.dataSource.column === 'time'

      const name = isInsightsBurnUpChart
        ? InsightsResources.defaultLeanBurnupChartName
        : InsightsResources.defaultStatusChartName
      const description = isInsightsBurnUpChart
        ? InsightsResources.defaultLeanBurnupChartDescription
        : InsightsResources.defaultStatusChartDescription

      const defaultChart: MemexChart = {
        number: 0,
        name,
        configuration: {
          ...defaultChartConfiguration,
          description,
        },
      }

      const allCharts = [defaultChart, ...initialCharts]
      const matchInsightsChartParams = PROJECT_INSIGHTS_NUMBER_ROUTE.matchFullPath(window.location.pathname)
      const burnUpChartRoute = PROJECT_INSIGHTS_ROUTE.matchFullPath(window.location.pathname)

      /**
       * if we're on an insights route, get the number from the url for
       * that insight chart, otherwise leave it null
       */
      let currentInsightNumber: number | null = null
      if (matchInsightsChartParams && matchInsightsChartParams.params.insightNumber) {
        currentInsightNumber = parseInt(matchInsightsChartParams.params.insightNumber, 10)
      } else if (burnUpChartRoute) {
        currentInsightNumber = 0
      }

      const searchParams = new URLSearchParams(window.location.search)
      return Object.fromEntries(
        allCharts.map(chart => {
          const trackableChart = createTrackableChart(
            chart,
            chart.number === currentInsightNumber ? getOverrides(searchParams) : undefined,
          )
          return [trackableChart.number, trackableChart]
        }),
      )
    },
    [getOverrides],
  )
  return {getInitialChartState}
}
