import Highcharts, {type Options} from 'highcharts'
import highchartsAccessibility from 'highcharts/modules/accessibility'
import highchartsExportData from 'highcharts/modules/export-data'
import highchartsExporting from 'highcharts/modules/exporting'
import highchartsOfflineExporting from 'highcharts/modules/offline-exporting'
import HighchartsReact from 'highcharts-react-official'
import merge from 'lodash-es/merge'
import defaultOptions, {yAxisConfig} from './chart-theme'
import ChartCardContext from './context'
import {useContext, useEffect} from 'react'
import type {Size} from '../shared'

// Init Highcharts modules
highchartsAccessibility(Highcharts)
highchartsExportData(Highcharts)
highchartsExporting(Highcharts)
highchartsOfflineExporting(Highcharts)

Highcharts.setOptions({
  lang: {
    decimalPoint: '.',
    thousandsSep: ',',
  },
})

export const chartHeights: {[size in Size]: string} = {
  xl: '432px',
  large: '320px',
  medium: '256px',
  small: '128px',
  sparkline: '128px',
}

export interface ChartProps {
  colors?: string[]
  overrideOptionsNotRecommended?: Highcharts.Options
  plotOptions?: Highcharts.PlotOptions
  series: Highcharts.SeriesOptionsType[]
  type: string
  xAxisTitle: string
  xAxisOptions?: Highcharts.XAxisOptions
  yAxisTitle?: string
  yAxisOptions?: Highcharts.YAxisOptions | Highcharts.YAxisOptions[]
  tooltipOptions?: Highcharts.TooltipOptions
  useUTC?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasPropertyWithValue(obj: Record<string, any>, key: string, value: string) {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }
  if (obj[key] === value) {
    return true
  } else {
    for (const prop in obj) {
      if (obj[prop] !== undefined) {
        return hasPropertyWithValue(obj[prop], key, value)
      }
    }
  }
  return false
}

export function Chart({
  colors,
  overrideOptionsNotRecommended,
  plotOptions,
  series,
  type = 'line',
  xAxisTitle,
  xAxisOptions,
  yAxisTitle,
  yAxisOptions = {},
  tooltipOptions = {},
  useUTC = true,
}: ChartProps) {
  const {title, description, size, chartRef} = useContext(ChartCardContext)
  const legendVisible = series.length > 1 && size !== 'sparkline'
  const legendIsVertical = series.length > 3

  const yAxisOptionsArray = Array.isArray(yAxisOptions) ? yAxisOptions : [yAxisOptions]

  const hasStacking = plotOptions && hasPropertyWithValue(plotOptions, 'stacking', 'normal')
  const options: Options = merge(
    {},
    defaultOptions,
    {
      ...(legendIsVertical
        ? {
            accessibility: {
              keyboardNavigation: {
                order: ['series', 'legend'],
              },
            },
          }
        : {}),
      chart: {
        type,
        height: typeof size === 'number' ? size : chartHeights[size],
      },
      time: {
        useUTC,
      },
      colors,
      exporting: {
        chartOptions: {
          title: {
            text: title,
          },
          caption: {
            text: description,
          },
        },
        filename: title,
      },
      lang: {
        accessibility: {
          chartContainerLabel: `${title}. Interactive chart.`,
          navigator: {
            groupLabel: `${title} Axis zoom`,
          },
        },
      },
      legend: {
        enabled: legendVisible,
        ...(legendIsVertical ? {align: 'right', layout: 'vertical', verticalAlign: 'middle'} : {}),
      },
      plotOptions: merge(
        {},
        defaultOptions.plotOptions,
        {
          series: {
            marker: {
              enabled: size !== 'sparkline',
            },
            enableMouseTracking: size !== 'sparkline',
          },
        },
        plotOptions,
      ),
      series,
      tooltip: merge(
        {},
        {
          enabled: size !== 'sparkline',
          shared: hasStacking,
        },
        tooltipOptions,
      ),
      xAxis: merge(
        {},
        {
          visible: size !== 'sparkline',
          gridLineWidth: size !== 'sparkline' ? 1 : 0,
          title: {
            text: size !== 'sparkline' ? xAxisTitle : undefined,
          },
        },
        xAxisOptions,
      ),
      yAxis: yAxisOptionsArray.map(yAxisConsumerOption => {
        if (!yAxisConsumerOption) return
        return merge(
          {},
          yAxisConfig,
          {
            visible: size !== 'sparkline',
            gridLineWidth: size !== 'sparkline' ? 1 : 0,
            title: {
              text: size !== 'sparkline' ? yAxisTitle : undefined,
            },
          },
          yAxisConsumerOption,
        )
      }),
    },
    overrideOptionsNotRecommended,
  )

  // Apply a linear gradient fill to areaspline series
  if (options.series && options.colors) {
    let colorIndex = 0
    const colorfulSeries: typeof options.series = []
    for (const singleSeries of options.series) {
      if (singleSeries.type === 'areaspline') {
        let color
        if (singleSeries.color) {
          color = singleSeries.color
        } else {
          color = options.colors[colorIndex] as string
          colorIndex++
        }

        singleSeries.fillColor = {
          linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
          stops: [
            [0, `color-mix(in srgb, ${color} 25%, transparent)`],
            [1, `color-mix(in srgb, ${color} 1%, transparent)`],
          ],
        }
        colorfulSeries.push(singleSeries)

        // After available colors run out, cycle through again
        if (colorIndex > options.colors.length - 1) {
          colorIndex = 0
        }
      } else {
        colorfulSeries.push(singleSeries)
      }
    }
    options.series = colorfulSeries
  }

  // Regardless of https://api.highcharts.com/highcharts/accessibility.landmarkVerbosity setting,
  // highcharts/highcharts’ ts/Accessibility/Components/ContainerComponent.ts _really_ wants to set `role`:
  // https://github.com/highcharts/highcharts/blob/178b6375cec3824cb12db124de8d3e760a802bb0/ts/Accessibility/Components/ContainerComponent.ts#L153-L155
  // But neither of its values—`region` or `group`—are what _we_ want. This effect lets us use `application` instead:
  useEffect(() => {
    setTimeout(() => chartRef.current?.container.current?.setAttribute('role', 'application'), 0)
  }, [chartRef])
  // Notes:
  //
  // - `chartRef.current.container.current` is _not_ the element with class `highcharts-container`. It’s the _parent_ of that element, aka https://api.highcharts.com/highcharts/chart.renderTo. This is because of how `highcharts-react` names its refs.
  //
  // - I tried many alternatives, e.g. setting `this.renderTo`’s role, or setting `this.container.parentNode`’s role, in https://api.highcharts.com/highcharts/chart.events.load or https://api.highcharts.com/highcharts/chart.events.redraw, and using highcharts-react’s `containerProps` or `callback`: https://github.com/highcharts/highcharts-react?tab=readme-ov-file#options-details. I also tried variations of _this_ approach, e.g. using `react-dom`’s `flushSync` (instead of `setTimeout`). None of that works.

  return <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
}
Chart.displayName = 'ChartCard.Chart'
