import 'chartjs-adapter-date-fns'

import DataCard from '@github-ui/data-card'
import {useColorPalette} from '@github-ui/primer-primitives-deprecated/hooks/use-color-palette'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Box, Spinner, useTheme} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  type LegendItem,
  LinearScale,
  PointElement,
  Tooltip,
  type TooltipItem,
  type TooltipModel,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import {enUS} from 'date-fns/locale'
import {useCallback, useMemo, useState} from 'react'
import {Chart} from 'react-chartjs-2'

import {CustomTooltip} from '../../../common/components/custom-tooltip'
import {paddingPlugin} from '../../../common/utils/ChartJS/PaddingPlugin'
import {humanReadableDate} from '../../../common/utils/date-formatter'
import type CardProps from '../../types/card-props'
import {generateAriaLabelForAlertActivity} from './aria'
import {useAlertActivityData, useAlertActivityQuery} from './use-alert-activity-query'

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  annotationPlugin,
  Tooltip,
  Legend,
  Filler,
)

export function AlertActivityChartV2({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const {theme} = useTheme()
  const palette = useColorPalette()
  const [tooltipContext, setTooltipContext] = useState<{
    chart: ChartJS
    tooltip: TooltipModel<'bar'> | TooltipModel<'line'>
  } | null>(null)

  const alertActivityState = useAlertActivityQuery({query, startDate, endDate})
  const {data: alertActivityData, sum: alertActivitySum} = useAlertActivityData(alertActivityState)
  const isSuccess = alertActivityState.every(result => result.isSuccess)
  const isLoading = alertActivityState.some(result => result.isPending)
  const isError = alertActivityState.some(result => result.isError)
  const isNoData = isSuccess && (alertActivityData.length === 0 || alertActivitySum === 0)

  const dateRanges = useMemo(() => {
    return alertActivityData.map(d => {
      return {
        startDate: d.date,
        endDate: d.endDate,
      }
    })
  }, [alertActivityData])

  const dataset = useMemo(() => {
    return {
      labels: dateRanges.map(range => {
        const dateOptions = {includeYear: false}

        const formattedDate = humanReadableDate(new Date(range.startDate), dateOptions)
        if (range.startDate === range.endDate) {
          return formattedDate
        }

        const formattedEndDate = humanReadableDate(new Date(range.endDate), dateOptions)
        return `${formattedDate} - ${formattedEndDate}`
      }),
      datasets: [
        {
          type: 'line' as const,
          fill: false,
          label: 'Net alert activity',
          data: alertActivityData.map(d => d.opened - d.closed),
          borderColor: palette.accent.fg,
          borderWidth: 2,
          borderDash: [10, 10],
          pointRadius: 0,
          pointStyle: 'line',
        },
        {
          label: 'Closed',
          data: alertActivityData.map(d => -1 * d.closed),
          borderWidth: 2,
          borderSkipped: false as const,
          borderColor: palette.done.emphasis,
          backgroundColor: palette.done.subtle,
          barPercentage: 0.5,
        },
        {
          label: 'New',
          data: alertActivityData.map(d => d.opened),
          borderWidth: 2,
          borderSkipped: false as const,
          borderColor: palette.open.emphasis,
          backgroundColor: palette.open.subtle,
          barPercentage: 0.5,
        },
      ],
    }
  }, [alertActivityData, dateRanges, palette])

  const font = useMemo(() => {
    return {
      family: theme?.fonts.normal as string | undefined,
      size: parseInt(theme?.fontSizes[0]),
    }
  }, [theme])

  const options = useMemo(() => {
    const gridBorderDash = [2, 2]
    const gridColor = palette.border.default
    const numberFormatter = Intl.NumberFormat('en-US', {
      notation: 'standard',
    })

    return {
      maintainAspectRatio: false,
      responsive: true,
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
      },
      adapters: {
        date: {
          locale: enUS,
        },
      },
      plugins: {
        annotation: {
          annotations: {
            zeroLine: {
              type: 'line',
              yMin: 0,
              yMax: 0,
              borderColor: gridColor,
              borderWidth: 1,
            },
          },
        },
        legend: {
          position: 'top' as const,
          align: 'start' as const,
          reverse: true,
          labels: {
            color: palette.fg.default,
            font,
            usePointStyle: true,
            boxWidth: 7,
            generateLabels: (chart: ChartJS): LegendItem[] => {
              const labels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart)
              return labels.map(label => {
                label.lineWidth = 2
                if (label.text === 'Net alert activity') {
                  label.lineDash = [3, 3]
                }
                return label
              })
            },
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          enabled: false, // Disable the on-canvas tooltip
          external: setTooltipContext,
        },
      },
      scales: {
        x: {
          ticks: {
            font,
            padding: 10,
          },
          stacked: true,
          grid: {
            drawOnChartArea: false,
            drawBorder: false,
            drawTicks: false,
          },
          title: {
            display: false,
            text: 'Month',
          },
        },
        y: {
          type: 'linear' as const,
          ticks: {
            font,
            beginAtZero: true,
            precision: 0,
            autoSkip: false,
            maxTicksLimit: 7,
            callback: (tickValue: string | number): string => {
              let value = tickValue
              if (typeof value === 'string') {
                value = Number(tickValue)
              }
              return numberFormatter.format(Math.abs(value))
            },
          },
          grid: {
            color: (context: {tick: {value: number}}): string | undefined => {
              if (context.tick.value === 0) {
                return 'transparent'
              }
              return gridColor
            },
            borderDash: gridBorderDash,
            borderColor: gridColor,
            tickColor: gridColor,
            tickBorderDash: (context: {tick: {value: number}}): number[] => {
              if (context.tick.value === 0) {
                return []
              }
              return gridBorderDash
            },
          },
          title: {
            display: false,
            text: 'Value',
          },
        },
      },
      ticks: {
        legend: {
          lables: {
            color: palette.fg.muted,
          },
        },
      },
    }
  }, [palette, font])

  const blankslateParentStyle = useMemo(() => {
    return {display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}
  }, [])

  const tooltipCustomTitle = useCallback(
    (_: string, items: Array<TooltipItem<'bar'> | TooltipItem<'line'>>) => {
      const range = dateRanges[items[0]!.dataIndex]!
      const dateOptions = {includeYear: true}

      const formattedDate = humanReadableDate(new Date(range.startDate), dateOptions)
      if (range.startDate === range.endDate) {
        return formattedDate
      }

      const formattedEndDate = humanReadableDate(new Date(range.endDate), dateOptions)
      return `${formattedDate} - ${formattedEndDate}`
    },
    [dateRanges],
  )

  const tooltipItemSort = useCallback(
    (a: TooltipItem<'bar'> | TooltipItem<'line'>, b: TooltipItem<'bar'> | TooltipItem<'line'>) => {
      const sortEnum = ['Open', 'Closed', 'Net alert activity']
      // eslint-disable-next-line github/no-dataset
      return sortEnum.indexOf(a.dataset.label || '') - sortEnum.indexOf(b.dataset.label || '')
    },
    [],
  )

  const numberFormatter = useMemo(() => Intl.NumberFormat('en-US', {notation: 'standard'}), [])
  const tooltipItemValueTransform = useCallback(
    (item: TooltipItem<'bar'> | TooltipItem<'line'>) => {
      // eslint-disable-next-line github/no-dataset
      const label = item.dataset.label || ''
      let value = '0'

      if (item.parsed.y) {
        if (label === 'Net alert activity') {
          value = numberFormatter.format(item.parsed.y)
        } else {
          value = numberFormatter.format(Math.abs(item.parsed.y))
        }
      }

      return value
    },
    [numberFormatter],
  )

  function renderBody(): JSX.Element {
    if (isLoading) {
      return (
        <Box
          data-testid="loading-indicator"
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexGrow: 1,
            justifyContent: 'center',
            backgroundColor: palette.neutral.subtle,
            mb: 2,
            borderRadius: '6px',
            height: '205px',
          }}
        >
          <Spinner />
        </Box>
      )
    }

    if (isError) {
      return (
        <Box
          sx={blankslateParentStyle}
          role="region"
          aria-label={generateAriaLabelForAlertActivity(alertActivityData, true)}
          data-testid="error"
        >
          <Blankslate>
            <Blankslate.Visual>
              <AlertIcon size="medium" />
            </Blankslate.Visual>
            <Blankslate.Description>Alert activity could not be loaded right now.</Blankslate.Description>
          </Blankslate>
        </Box>
      )
    }

    if (isNoData) {
      return (
        <Box
          sx={blankslateParentStyle}
          role="region"
          aria-label={generateAriaLabelForAlertActivity(alertActivityData)}
          data-testid="no-data"
        >
          <Blankslate>
            <Blankslate.Visual>
              <ShieldCheckIcon size="medium" />
            </Blankslate.Visual>
            <Blankslate.Description>
              Try modifying your filters to see the security impact on your organization.
            </Blankslate.Description>
          </Blankslate>
        </Box>
      )
    }

    return (
      <Box sx={{height: 214}}>
        <Chart
          data-testid="chart-component"
          aria-label={generateAriaLabelForAlertActivity(alertActivityData)}
          data={dataset}
          /*
            setting animation to false is supported, but types are only fixed in 4.0
            https://github.com/chartjs/Chart.js/pull/10582
          */
          /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
          /* @ts-ignore */
          options={options}
          plugins={[paddingPlugin]}
          type="bar"
        />
        {tooltipContext && (
          <CustomTooltip
            tooltipContext={tooltipContext}
            customTitle={tooltipCustomTitle}
            itemSort={tooltipItemSort}
            itemValueTransform={tooltipItemValueTransform}
          />
        )}
      </Box>
    )
  }

  return (
    <DataCard cardTitle="Alert activity" sx={{height: 265, width: '100%', ...sx}}>
      {renderBody()}
    </DataCard>
  )
}
