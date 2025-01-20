import 'chartjs-adapter-date-fns'

import DataCard from '@github-ui/data-card'
import {useColorPalette} from '@github-ui/primer-primitives-deprecated/hooks/use-color-palette'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Box, Spinner, useTheme} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import {
  Chart,
  type ChartOptions,
  Filler,
  Legend,
  type LegendItem,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  type TooltipItem,
  type TooltipModel,
} from 'chart.js'
import {parseISO} from 'date-fns'
import {enUS} from 'date-fns/locale'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {Line} from 'react-chartjs-2'
import {useSearchParams} from 'react-router-dom'

import {CustomTooltip} from '../../../common/components/custom-tooltip'
import useChartColorPalette from '../../../common/hooks/use-chart-color-palette'
import {paddingPlugin} from '../../../common/utils/ChartJS/PaddingPlugin'
import GroupMenu, {type GroupKey} from './GroupMenu'
import {useAlertTrendsQuery} from './use-alert-trends-query'
import {useAriaLabel} from './use-aria-label'

Chart.register(LineController, LineElement, LinearScale, PointElement, Tooltip, Legend, TimeScale, Filler)

function useFont(): {family?: string; size: number} {
  const {theme} = useTheme()
  return useMemo(() => {
    return {
      family: theme?.fonts.normal as string | undefined,
      size: parseInt(theme?.fontSizes[0]),
    }
  }, [theme])
}

const DEFAULT_GROUP_KEY: GroupKey = 'status'

interface AlertTrendsCardProps {
  query: string
  startDate: string
  endDate: string
  allowAutofixFeatures: boolean
}

export default function AlertTrendsCard(props: AlertTrendsCardProps): JSX.Element {
  const [searchParams] = useSearchParams()

  // track selected grouping
  const [groupKey, setGroupKey] = useState<GroupKey>(() => {
    return (searchParams.get('trends[groupBy]') as GroupKey | null) ?? DEFAULT_GROUP_KEY
  })

  // keep browser URL in sync with selected trend grouping
  useEffect(() => {
    const url = new URL(window.location.href, window.location.origin)
    const nextParams = url.searchParams

    if (groupKey === DEFAULT_GROUP_KEY) {
      nextParams.delete('trends[groupBy]')
    } else {
      nextParams.set('trends[groupBy]', groupKey)
    }

    history.pushState(null, '', `${url.pathname}${url.search}`)
  }, [groupKey])

  const dataQuery = useAlertTrendsQuery({...props, groupKey})

  const font = useFont()
  const colorPalette = useColorPalette()
  const chartColorPalette = useChartColorPalette(colorPalette)
  const [tooltipContext, setTooltipContext] = useState<{chart: Chart; tooltip: TooltipModel<'line'>} | null>(null)

  const chartStyles = useMemo(() => {
    const groupByStatusStyles = [
      {
        // Unresolved and merged
        colors: chartColorPalette.yellow,
        lineDash: [2, 2],
        legendDash: [2, 2],
      },
      {
        // Fixed with autofix
        colors: chartColorPalette.purple,
        lineDash: [6, 6],
        legendDash: [4, 4],
      },
      {
        // Fixed without autofix
        colors: chartColorPalette.blue,
        // solid line; no dash config
      },
      {
        // Dismissed as false positive
        colors: chartColorPalette.green,
        lineDash: [6, 4, 2, 4],
        legendDash: [3, 1, 1, 1],
      },
      {
        // Dismissed as risk accepted
        colors: chartColorPalette.orange,
        lineDash: [6, 2, 6, 10],
        legendDash: [4, 4],
      },
    ]

    const groupBySeverityStyles = [
      {
        // Critical
        colors: chartColorPalette.pink,
        lineDash: [3, 3],
        legendDash: [2, 2],
      },
      {
        // High
        colors: chartColorPalette.orange,
        lineDash: [10, 10],
        legendDash: [4, 4],
      },
      {
        // Medium
        colors: chartColorPalette.yellow,
        // solid line; no dash config
      },
      {
        // Low
        colors: chartColorPalette.gray,
        lineDash: [20, 10],
        legendDash: [4, 4],
      },
    ]

    if (groupKey === 'severity') {
      return groupBySeverityStyles
    }

    return groupByStatusStyles
  }, [chartColorPalette, groupKey])

  const options: ChartOptions<'line'> = useMemo(() => {
    const gridColor = colorPalette.border.default
    const gridBorderDash = [2, 2]

    return {
      maintainAspectRatio: false,
      borderWidth: 2,
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
      },
      pointRadius: 0,
      pointHoverRadius: 4,
      adapters: {
        date: {
          locale: enUS,
        },
      },
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'start' as const,
          reverse: true,
          labels: {
            color: colorPalette.fg.default,
            font,
            boxWidth: 7,
            usePointStyle: true,
            generateLabels: (chart: Chart): LegendItem[] => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart)
              return labels.map(label => {
                label.lineDash = chartStyles[label.datasetIndex]?.legendDash
                return label
              })
            },
          },
        },
        tooltip: {
          enabled: false, // Disable the on-canvas tooltip
          external: setTooltipContext,
        },
      },
      scales: {
        x: {
          type: 'time' as const,
          ticks: {
            source: 'data' as const,
            font,
            padding: 10,
          },
          grid: {
            color: gridColor,
            borderDash: gridBorderDash,
            borderColor: gridColor,
            drawTicks: false,
            z: 1,
          },
          title: {
            display: false,
            text: 'Date',
          },
          time: {
            tooltipFormat: 'MMM d, yyyy',
            unit: 'day' as const,
            displayFormats: {
              day: 'MMM d',
            },
            parser: (v: unknown): number => {
              return parseISO(v as string).getTime()
            },
          },
        },
        y: {
          beginAtZero: true,
          stacked: true,
          ticks: {
            precision: 0,
            font,
          },
          grid: {
            color: gridColor,
            borderDash: gridBorderDash,
            tickBorderDash: gridBorderDash,
            borderColor: gridColor,
            z: 1,
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
            color: colorPalette.fg.muted,
          },
        },
      },
    }
  }, [colorPalette, font, chartStyles])

  const data = useMemo(() => {
    if (!dataQuery.isSuccess) {
      return {datasets: []}
    }

    const dataCount = dataQuery.data.length
    return {
      datasets: dataQuery.data
        .map((series, index) => {
          let label = series.label
          let hidden = false

          if (!props.allowAutofixFeatures) {
            if (series.label === 'Fixed with autofix') {
              hidden = true
            }
            if (series.label === 'Fixed without autofix') {
              label = 'Fixed'
            }
          }

          return {
            ...series,
            label,
            hidden,
            borderColor: chartStyles[index]?.colors?.border,
            borderDash: chartStyles[index]?.lineDash,
            backgroundColor: chartStyles[index]?.colors?.body,
            fill: true,
            // Invert the draw order of the dataset
            // This combined with `reverse` on the legend plugin means the datasets
            // will be ordered left-to-right (legend) and top-to-bottom (chart).
            order: dataCount - index,
          }
        })
        .filter(dataset => {
          // Normally, the chart.js `hidden` property only affects the initial render state
          // of the dataset, same as if the user manually clicked to toggle visibility.
          // We're co-opting that property to actually remove the dataset from view.
          return !dataset.hidden
        }),
    }
  }, [dataQuery, chartStyles, props.allowAutofixFeatures])

  const tooltipItemSort = useCallback((a: TooltipItem<'line'>, b: TooltipItem<'line'>) => {
    return a.datasetIndex - b.datasetIndex
  }, [])

  const chartAriaLabel = useAriaLabel(groupKey, dataQuery.data)

  const blankslateParentStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 346,
    justifyContent: 'center',
  }

  function renderBody(): JSX.Element {
    if (dataQuery.isPending) {
      return (
        <Box sx={blankslateParentStyle} data-testid="loading-indicator">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              mb: 2,
              backgroundColor: colorPalette.neutral.subtle,
              borderRadius: '6px',
            }}
          >
            <Spinner />
          </Box>
        </Box>
      )
    }

    if (dataQuery.isError) {
      return (
        <Box
          sx={blankslateParentStyle}
          role="region"
          aria-label={'Empty chart. Alert trends could not be loaded right now.'}
          data-testid="error-indicator"
        >
          <Blankslate>
            <Blankslate.Visual>
              <AlertIcon size="medium" />
            </Blankslate.Visual>
            <Blankslate.Description>Alert trends could not be loaded right now.</Blankslate.Description>
          </Blankslate>
        </Box>
      )
    }

    const totalAlertCount = dataQuery.data.reduce((accOuter, series) => {
      const seriesSum = series.data.reduce((acc, dataPoint) => acc + dataPoint.y, 0)
      return accOuter + seriesSum
    }, 0)

    if (totalAlertCount === 0) {
      return (
        <Box sx={blankslateParentStyle} role="region" aria-label={chartAriaLabel} data-testid="no-data-indicator">
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
      <>
        <Box sx={{height: 346}} data-testid="chart-container">
          <Line aria-label={chartAriaLabel} data={data} options={options} plugins={[paddingPlugin]} />
          {tooltipContext && (
            <CustomTooltip<'line'> tooltipContext={tooltipContext} itemSort={tooltipItemSort} showTotal={true} />
          )}
        </Box>
      </>
    )
  }

  return (
    <DataCard
      sx={{width: '100%'}}
      cardTitle="Alerts in pull requests"
      action={<GroupMenu groupKey={groupKey} onGroupKeyChanged={setGroupKey} />}
    >
      {!dataQuery.isPending && <span data-hpc hidden />}
      {renderBody()}
    </DataCard>
  )
}
