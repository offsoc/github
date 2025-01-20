import {ChartCard} from '@github-ui/chart-card'
import {GraphIcon} from '@primer/octicons-react'
import {Box, Heading, Octicon} from '@primer/react'
import {memo} from 'react'

import type {MemexChartConfiguration} from '../../../api/charts/contracts/api'
import {highChartTypes, isStacked, shouldApplyPointPlacement} from '../../../api/charts/contracts/api'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useChartSeries, useChartSeriesCardCharts} from '../../../state-providers/charts/use-chart-series'
import {ChartByType} from './chart-by-type'

export const CurrentInsightsChart = memo<{
  configuration: MemexChartConfiguration
  filteredItems: Array<MemexItemModel> | null
  filterValue: string
  isLoading: boolean
}>(function CurrentInsightsChart({configuration, filteredItems, isLoading}) {
  const {series} = useChartSeries(configuration, filteredItems)
  const {series: chartCardSeries, axis, xCoordinates} = useChartSeriesCardCharts(configuration, filteredItems)
  const {memex_chart_cards_insights} = useEnabledFeatures()
  const {xAxis, yAxis} = axis

  return memex_chart_cards_insights ? (
    chartCardSeries.length ? (
      <>
        <ChartCard padding="spacious" size="xl">
          <ChartCard.Chart
            series={chartCardSeries as Array<Highcharts.SeriesOptionsType>}
            xAxisTitle={xAxis.name}
            xAxisOptions={{
              title: {
                text: null,
              },
              categories: xCoordinates,
            }}
            yAxisTitle={yAxis.name}
            yAxisOptions={{
              title: {
                text: null,
              },
              maxPadding: 0,
              allowDecimals: false,
            }}
            plotOptions={{
              series: {
                stacking: isStacked(configuration.type) ? 'normal' : undefined,
                marker: {
                  enabled: false,
                },
                pointPlacement: shouldApplyPointPlacement(configuration.type) ? 'on' : undefined,
              },
            }}
            overrideOptionsNotRecommended={{
              legend: {
                reversed: true,
                verticalAlign: 'bottom',
                align: 'right',
                layout: 'horizontal',
                enabled: true,
              },
              tooltip: {
                valuePrefix: '&nbsp;',
              },
            }}
            type={highChartTypes[configuration.type]}
          />
        </ChartCard>
      </>
    ) : (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
          borderWidth: 1,
          borderRadius: 2,
          borderStyle: 'solid',
          borderColor: 'border.default',
          minHeight: '200px',
        }}
      >
        <Octicon icon={GraphIcon} size="medium" sx={{fill: 'fg.muted'}} />
        <Heading as="h3" sx={{fontSize: 3}}>
          No data available
        </Heading>
        <Box as="p" sx={{color: 'fg.muted'}}>
          No results were returned.
        </Box>
      </Box>
    )
  ) : (
    <ChartByType chartType={configuration.type} isLoading={isLoading} series={series} />
  )
})
