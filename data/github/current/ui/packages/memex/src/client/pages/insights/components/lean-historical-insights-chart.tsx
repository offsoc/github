import {ChartCard} from '@github-ui/chart-card'
import {GraphIcon} from '@primer/octicons-react'
import {Box, Heading, Octicon} from '@primer/react'
import {memo} from 'react'

import type {MemexChartConfiguration} from '../../../api/charts/contracts/api'
import {highChartTypes, isStacked, shouldApplyPointPlacement} from '../../../api/charts/contracts/api'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {
  getLeanInsightsColorCoding,
  useLeanHistoricalChartSeries,
  useLeanHistoricalChartSeriesChartCard,
} from '../../../state-providers/charts/use-lean-historical-chart-series'
import {ChartByType} from './chart-by-type'

export const LeanHistoricalInsightsChart = memo<{
  configuration: MemexChartConfiguration
  endDate?: string
  filteredItems: Array<MemexItemModel> | null
  filterValue: string
  isLoading: boolean
  startDate?: string
}>(function LeanHistoricalInsightsChart({configuration, endDate, filteredItems, isLoading, startDate}) {
  const {series} = useLeanHistoricalChartSeries({
    configuration,
    filteredItems,
    startDate,
    endDate,
  })

  const {memex_chart_cards_insights} = useEnabledFeatures()

  const {series: chartCardSeries, xCoordinates} = useLeanHistoricalChartSeriesChartCard({
    configuration,
    filteredItems,
    startDate,
    endDate,
  })

  const chartType = configuration.type
  return memex_chart_cards_insights ? (
    chartCardSeries.length ? (
      <ChartCard padding="spacious" size="xl">
        <ChartCard.Chart
          series={chartCardSeries as Array<Highcharts.SeriesOptionsType>}
          xAxisTitle="Date"
          xAxisOptions={{
            title: {
              text: null,
            },
            categories: xCoordinates,
            tickAmount: 28,
          }}
          yAxisTitle="items"
          yAxisOptions={{
            title: {
              text: null,
            },
            maxPadding: 0,
            allowDecimals: false,
          }}
          plotOptions={{
            series: {
              stacking: isStacked(chartType) ? 'normal' : undefined,
              marker: {
                enabled: false,
              },
              pointPlacement: shouldApplyPointPlacement(configuration.type) ? 'on' : undefined,
            },
          }}
          overrideOptionsNotRecommended={{
            legend: {
              reversed: true,
              align: 'right',
              layout: 'horizontal',
              verticalAlign: 'bottom',
            },
            tooltip: {
              valuePrefix: '&nbsp;',
            },
          }}
          type={highChartTypes[chartType]}
        />
      </ChartCard>
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
    <ChartByType
      chartType={chartType}
      isLoading={isLoading}
      series={series}
      colorCoding={getLeanInsightsColorCoding()}
    />
  )
})
