import type {ColorCodingConfig, Series} from '@github-ui/insights-charts'

import type {MemexChartType} from '../../../api/charts/contracts/api'
import {assertNever} from '../../../helpers/assert-never'
import {BarChart} from './chart-web-components/bar-chart'
import {ColumnChart} from './chart-web-components/column-chart'
import {LineChart} from './chart-web-components/line-chart'
import {StackedAreaChart} from './chart-web-components/stacked-area-chart'

interface ChartByTypeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  chartType: MemexChartType
  isLoading: boolean
  series: Series
  colorCoding?: ColorCodingConfig
}

export function ChartByType({chartType, isLoading, series, colorCoding, ...props}: ChartByTypeProps) {
  switch (chartType) {
    case 'stacked-area': {
      return <StackedAreaChart {...props} series={series} loading={isLoading} colorCoding={colorCoding} />
    }
    case 'line': {
      return <LineChart {...props} series={series} loading={isLoading} colorCoding={colorCoding} />
    }

    case 'column':
    case 'stacked-column': {
      return (
        <ColumnChart
          {...props}
          series={series}
          loading={isLoading}
          colorCoding={colorCoding}
          chartStacked={chartType === 'stacked-column'}
        />
      )
    }

    case 'bar':
    case 'stacked-bar': {
      return (
        <BarChart
          {...props}
          series={series}
          loading={isLoading}
          colorCoding={colorCoding}
          chartStacked={chartType === 'stacked-bar'}
        />
      )
    }
    default:
      assertNever(chartType)
  }
}
