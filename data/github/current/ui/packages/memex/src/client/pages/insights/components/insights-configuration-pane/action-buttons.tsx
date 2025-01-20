import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button} from '@primer/react'
import {useCallback} from 'react'

import {useNavigate, useSearchParams} from '../../../../router'
import {useProjectRouteParams} from '../../../../router/use-project-route-params'
import {PROJECT_INSIGHTS_NUMBER_ROUTE} from '../../../../routes'
import {
  getDirtyChartState,
  getParamsForConfigResetToServerState,
  getParamsForFullResetToServerState,
  isDefaultChart,
} from '../../../../state-providers/charts/chart-helpers'
import {useChartActions} from '../../../../state-providers/charts/use-chart-actions'
import {type ChartState, useCharts} from '../../../../state-providers/charts/use-charts'
import {Resources} from '../../../../strings'
import {useInsightsConfigurationPane} from '../../hooks/use-insights-configuration-pane'

export function ActionButtons({chart, showUpsellDialog}: {chart: ChartState; showUpsellDialog: () => void}) {
  const {canCreateChart} = useCharts()
  const {
    updateLocalChartConfiguration,
    updateChartConfiguration,
    createChartConfiguration,
    resetLocalChangesForChartNumber,
  } = useChartActions()
  const {closePane} = useInsightsConfigurationPane()
  const navigate = useNavigate()
  const chartDirtyState = getDirtyChartState(chart)
  const [searchParams, setSearchParams] = useSearchParams()
  const projectRouteParams = useProjectRouteParams()
  const handleSaveChanges = useCallback(async () => {
    function resetParams() {
      const nextParams = getParamsForFullResetToServerState(new URLSearchParams(searchParams))
      if (nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, {replace: true})
      }
    }

    if (isDefaultChart(chart)) {
      if (canCreateChart()) {
        await createChartConfiguration.perform({
          chart: {
            configuration: chart.localVersion.configuration,
          },
        })
        resetLocalChangesForChartNumber(chart.number)
        resetParams()
        if (createChartConfiguration.status.current.status === 'succeeded') {
          navigate(
            PROJECT_INSIGHTS_NUMBER_ROUTE.generatePath({
              ...projectRouteParams,
              insightNumber: createChartConfiguration.status.current.data.chart.number,
            }),
          )
        }
      } else {
        showUpsellDialog()
      }
    } else {
      await updateChartConfiguration.perform({
        chartNumber: chart.number,
        chart: {
          configuration: chart.localVersion.configuration,
        },
      })
      resetParams()
    }

    closePane()
  }, [
    chart,
    closePane,
    searchParams,
    setSearchParams,
    canCreateChart,
    createChartConfiguration,
    resetLocalChangesForChartNumber,
    navigate,
    showUpsellDialog,
    updateChartConfiguration,
    projectRouteParams,
  ])

  const handleDiscardChanges = useCallback(() => {
    updateLocalChartConfiguration(chart.number, {
      ...chart.serverVersion.configuration,
      filter: chart.localVersion.configuration.filter,
    })

    const nextParams = getParamsForConfigResetToServerState(new URLSearchParams(searchParams))

    if (searchParams.toString() !== nextParams.toString()) {
      setSearchParams(nextParams)
    }
    closePane()
  }, [
    chart.localVersion.configuration.filter,
    chart.number,
    chart.serverVersion.configuration,
    closePane,
    searchParams,
    setSearchParams,
    updateLocalChartConfiguration,
  ])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
      }}
    >
      <Button
        onClick={handleDiscardChanges}
        disabled={!chartDirtyState.isDirty}
        {...testIdProps('insights-discard-changes')}
      >
        {Resources.discardChanges}
      </Button>
      <Button
        variant="primary"
        onClick={handleSaveChanges}
        disabled={!chartDirtyState.isDirty}
        {...testIdProps('insights-save-changes')}
      >
        {isDefaultChart(chart) ? Resources.saveToNewChart : Resources.saveChanges}
      </Button>
    </Box>
  )
}
