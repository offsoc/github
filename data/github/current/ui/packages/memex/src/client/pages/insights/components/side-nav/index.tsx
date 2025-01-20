import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'
import {Box, Button, NavList} from '@primer/react'
import {memo, useCallback, useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {partition} from '../../../../../utils/partition'
import type {MemexChartConfiguration} from '../../../../api/charts/contracts/api'
import {InsightsChartNavigation} from '../../../../api/stats/contracts'
import {chartLayoutsMap} from '../../../../components/insights/chart-layouts'
import {usePostStats} from '../../../../hooks/common/use-post-stats'
import {useNavigate} from '../../../../router'
import {useProjectRouteParams} from '../../../../router/use-project-route-params'
import {PROJECT_INSIGHTS_NUMBER_ROUTE} from '../../../../routes'
import {getDirtyChartState, isDefaultChart} from '../../../../state-providers/charts/chart-helpers'
import {useChartActions} from '../../../../state-providers/charts/use-chart-actions'
import {type ChartState, useCharts} from '../../../../state-providers/charts/use-charts'
import {InsightsResources} from '../../../../strings'
import {useInsightsUpsellDialog} from '../insights-upsell-dialog'
import {ChartLink} from './chart-link'
import {InsightsChartOptions} from './insights-chart-options'

const AddChartButton = memo(function AddChartButton() {
  const {getCreateChartRequest, canCreateChart} = useCharts()
  const {createChartConfiguration} = useChartActions()
  const navigate = useNavigate()
  const {showDialog, InsightsUpsellDialog} = useInsightsUpsellDialog()
  const projectRouteParams = useProjectRouteParams()

  return (
    <>
      <InsightsUpsellDialog />
      <Button
        {...testIdProps('add-chart-button')}
        onClick={useCallback(async () => {
          const createChartRequest = getCreateChartRequest()
          if (canCreateChart()) {
            await createChartConfiguration.perform(createChartRequest)
            if (createChartConfiguration.status.current.status === 'succeeded') {
              const newChart = createChartConfiguration.status.current.data
              navigate(
                PROJECT_INSIGHTS_NUMBER_ROUTE.generatePath({
                  ...projectRouteParams,
                  insightNumber: newChart.chart.number,
                }),
              )
            }
          } else {
            showDialog()
          }
        }, [getCreateChartRequest, canCreateChart, createChartConfiguration, navigate, showDialog, projectRouteParams])}
        sx={{ml: 2, mt: 2}}
        leadingVisual={PlusIcon}
      >
        {InsightsResources.sideNavNewChartButton}
      </Button>
    </>
  )
})

function sortChartsByName(chartA: ChartState, chartB: ChartState) {
  return chartA.name.localeCompare(chartB.name)
}

interface ChartItemTrailingVisualProps {
  chartConfiguration: ChartState
  isActiveChart: boolean
}

const ChartItemTrailingVisual: React.FC<ChartItemTrailingVisualProps> = ({chartConfiguration, isActiveChart}) => {
  return (
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      {isActiveChart ? <InsightsChartOptions chart={chartConfiguration} /> : null}
    </Box>
  )
}

export const InsightsSideNav = () => {
  const params = useParams()
  const {chartConfigurations, getChartLinkTo} = useCharts()
  const {postStats} = usePostStats()
  const insightNumber = params.insightNumber ? Number(params.insightNumber) : 0
  const {defaultCharts, myCharts} = useMemo(() => {
    const [defaultChartConfigs, customChartConfigs] = partition(Object.values(chartConfigurations), isDefaultChart)

    return {
      defaultCharts: defaultChartConfigs.sort(sortChartsByName),
      myCharts: customChartConfigs.sort(sortChartsByName),
    }
  }, [chartConfigurations])

  const postChartNavigationStats = useCallback(
    (chartNumber: number, configuration: MemexChartConfiguration) => {
      postStats({
        name: InsightsChartNavigation,
        context: JSON.stringify({chartNumber, ...configuration}),
      })
    },
    [postStats],
  )

  return (
    <>
      <NavList sx={{'& > ul': {pt: 0}}} {...testIdProps('insights-side-nav')}>
        <NavList.Group title={InsightsResources.sideNavDefaultCharts}>
          {defaultCharts.map(chartConfiguration => {
            const isActiveChart = insightNumber === 0
            const chartDirtyState = getDirtyChartState(chartConfiguration)
            const Icon = chartLayoutsMap[chartConfiguration.localVersion.configuration.type].icon

            return (
              <ChartLink
                {...testIdProps('default-chart-navigation-item')}
                key={chartConfiguration.number}
                isDirty={chartDirtyState.isDirty}
                to={getChartLinkTo(chartConfiguration.number).url}
                isActive={isActiveChart}
                leadingVisual={<Icon />}
                trailingVisual={
                  <ChartItemTrailingVisual chartConfiguration={chartConfiguration} isActiveChart={isActiveChart} />
                }
                // no navigation when already active
                onClick={e => {
                  if (isActiveChart) {
                    e.preventDefault()
                  } else {
                    postChartNavigationStats(chartConfiguration.number, chartConfiguration.localVersion.configuration)
                  }
                }}
              >
                {chartConfiguration.name}
              </ChartLink>
            )
          })}
        </NavList.Group>

        <NavList.Group title={InsightsResources.sideNavCustomCharts}>
          {myCharts.map(chartConfiguration => {
            const isActiveChart = insightNumber === chartConfiguration.number
            const chartDirtyState = getDirtyChartState(chartConfiguration)
            const Icon = chartLayoutsMap[chartConfiguration.localVersion.configuration.type].icon

            return (
              <ChartLink
                {...testIdProps('my-chart-navigation-item')}
                key={chartConfiguration.number}
                to={getChartLinkTo(chartConfiguration.number).url}
                isActive={isActiveChart}
                isDirty={chartDirtyState.isDirty}
                leadingVisual={<Icon />}
                trailingVisual={
                  <ChartItemTrailingVisual chartConfiguration={chartConfiguration} isActiveChart={isActiveChart} />
                }
                // no navigation when already active
                onClick={e => {
                  if (isActiveChart) {
                    e.preventDefault()
                  } else {
                    postChartNavigationStats(chartConfiguration.number, chartConfiguration.localVersion.configuration)
                  }
                }}
              >
                {chartConfiguration.name}
              </ChartLink>
            )
          })}
        </NavList.Group>
      </NavList>
      <div>
        <AddChartButton />
      </div>
    </>
  )
}
