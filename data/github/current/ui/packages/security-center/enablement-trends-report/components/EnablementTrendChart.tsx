import 'chartjs-adapter-date-fns'

import DataCard from '@github-ui/data-card'
import {useColorPalette} from '@github-ui/primer-primitives-deprecated/hooks/use-color-palette'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Box, Spinner, Text, useTheme} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
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
import {useCallback, useMemo, useState} from 'react'
import {Line} from 'react-chartjs-2'

import {CustomTooltip} from '../../common/components/custom-tooltip'
import {TrendIndicator} from '../../common/components/trend-indicator'
import useChartColorPalette from '../../common/hooks/use-chart-color-palette'
import {paddingPlugin} from '../../common/utils/ChartJS/PaddingPlugin'
import {humanReadableDate} from '../../common/utils/date-formatter'
import {
  asDataState,
  type DataState,
  isErrorState,
  isLoadingState,
  isNoDataState,
} from '../hooks/use-enablement-trend-data'

Chart.register(LineController, LineElement, LinearScale, PointElement, Tooltip, Legend, TimeScale, Filler)

export type Dataset = {
  label: string
  data: Array<{
    x: string
    y: number
  }>
}

export interface EnablementTrendChartProps {
  state: 'loading' | 'error' | 'no-data' | 'ready'
  description: string
  datasets: Dataset[]
  trendValue: number
}

export function useAriaLabel(datasets: Dataset[]): string {
  return useMemo(() => {
    if (datasets.length === 0) {
      return 'Empty chart. There are no enabled features in this period.'
    }
    const label = []
    label.push('Line chart describing feature enablement trends over time.')
    label.push(`It consists of ${datasets.length} time series.`)

    if (datasets[0]?.data.length) {
      const startDate = new Date(datasets[0].data[0]!.x)
      const startDateStr = humanReadableDate(startDate, {includeYear: true})
      const endDate = new Date(datasets[0].data.at(-1)!.x)
      const endDateStr = humanReadableDate(endDate, {includeYear: true})
      label.push(`The x-axis shows dates from ${startDateStr} to ${endDateStr}.`)
    }

    // There's currently only a max of 2 supported features on a chart, so the 'and' concat is grammatically appropriate.
    const features = datasets.map(d => d.label)
    label.push(
      `The y-axis shows the percentage of repositories enabled with the ` +
        `${features.join(' and ')} ${features.length > 1 ? 'features' : 'feature'}.`,
    )

    return label.join(' ')
  }, [datasets])
}

export function EnablementTrendChart({
  state,
  description,
  datasets,
  trendValue,
}: EnablementTrendChartProps): JSX.Element {
  const colorPalette = useColorPalette()
  const chartColorPalette = useChartColorPalette(colorPalette)
  const [tooltipContext, setTooltipContext] = useState<{chart: Chart; tooltip: TooltipModel<'line'>} | null>(null)

  const {theme} = useTheme()
  const font = useMemo(() => {
    return {
      family: theme?.fonts.normal as string | undefined,
      size: parseInt(theme?.fontSizes[0]),
    }
  }, [theme])

  const datasetStyles = useMemo(() => {
    return [
      {
        lineColor: chartColorPalette.blue!.border,
        lineDash: [3, 3],
        lineDashOffset: -5.5,
        lineWidth: 2,
        backgroundColor: chartColorPalette.blue!.body,
      },
      {
        lineColor: chartColorPalette.green!.border,
        lineDash: undefined,
        lineDashOffset: undefined,
        lineWidth: 2,
        backgroundColor: chartColorPalette.green!.body,
      },
    ]
  }, [chartColorPalette])

  const chartOptions: ChartOptions<'line'> = useMemo(() => {
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
          labels: {
            color: colorPalette.fg.default,
            font,
            boxHeight: 0,
            boxWidth: 20,
            generateLabels: (chart: Chart): LegendItem[] => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart)
              return labels.map(label => {
                label.lineDash = datasetStyles[label.datasetIndex]?.lineDash
                label.lineDashOffset = datasetStyles[label.datasetIndex]?.lineDashOffset
                label.fillStyle = datasetStyles[label.datasetIndex]?.backgroundColor
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
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
          },
          grid: {
            color: gridColor,
            borderDash: gridBorderDash,
            tickBorderDash: gridBorderDash,
            borderColor: gridColor,
            z: 1,
          },
          title: {
            display: true,
            text: `Repositories enabled (%)`,
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
  }, [datasetStyles, colorPalette, font])

  const chartData = useMemo(() => {
    return {
      datasets: datasets.map((dataset, index) => {
        return {
          label: dataset.label,
          data: dataset.data,
          fill: false,
          borderDash: datasetStyles[index]?.lineDash,
          borderColor: datasetStyles[index]?.lineColor,
          pointBackgroundColor: datasetStyles[index]?.lineColor,
        }
      }),
    }
  }, [datasets, datasetStyles])

  const title = useMemo(() => {
    const lastValues = datasets.map(dataset => dataset.data[dataset.data.length - 1]?.y || 0)
    const maxValueOnLastDate = Math.max(...lastValues)
    return `${maxValueOnLastDate}% enabled`
  }, [datasets])

  const formattedEndDate = useMemo(() => {
    const data = datasets[0]?.data
    const lastDate = data?.at(-1)?.x
    if (!lastDate) return ''

    return humanReadableDate(new Date(lastDate), {includeYear: true})
  }, [datasets])

  const tooltipItemValueTransform = useCallback((item: TooltipItem<'line'>): string => {
    return `${item.formattedValue}%`
  }, [])

  const blankslateParentStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  }

  const chartAriaLabel = useAriaLabel(datasets)
  const dataState: DataState<Dataset[]> = asDataState(state, datasets)

  function renderBody(): JSX.Element {
    if (isLoadingState(dataState)) {
      return (
        <Box sx={blankslateParentStyle} data-testid="loading-indicator">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              mb: 2,
              mt: 3,
              backgroundColor: colorPalette.neutral.subtle,
              borderRadius: '6px',
            }}
          >
            <Spinner />
          </Box>
        </Box>
      )
    }

    if (isErrorState(dataState)) {
      return (
        <Box
          sx={blankslateParentStyle}
          role="region"
          aria-label={'Empty chart. Adoption trends could not be loaded right now.'}
          data-testid="error-indicator"
        >
          <Blankslate>
            <Blankslate.Visual>
              <AlertIcon size="medium" />
            </Blankslate.Visual>
            <Blankslate.Description>Adoption data could not be loaded right now.</Blankslate.Description>
          </Blankslate>
        </Box>
      )
    }

    if (isNoDataState(dataState)) {
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
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Box sx={{display: 'flex', justifyContent: 'left', alignItems: 'baseline', gap: '1em'}}>
            <Text sx={{fontSize: '24px', fontWeight: 400}}>{title}</Text>
            <TrendIndicator value={trendValue} flipColor={true} loading={false} error={false} />
            <Text sx={{color: 'fg.muted', fontSize: '12px'}}>{`as of ${formattedEndDate}`}</Text>
          </Box>
        </Box>
        <DataCard.Description>{description}</DataCard.Description>
        <Box sx={{height: 346}}>
          <Line aria-label={chartAriaLabel} data={chartData} options={chartOptions} plugins={[paddingPlugin]} />
          {tooltipContext && (
            <CustomTooltip<'line'> tooltipContext={tooltipContext} itemValueTransform={tooltipItemValueTransform} />
          )}
        </Box>
      </>
    )
  }

  return (
    <DataCard sx={{mb: 4, height: 454, width: '100%'}} data-testid="enablement-trend-chart">
      {!isLoadingState(dataState) && <span data-hpc hidden />}
      {renderBody()}
    </DataCard>
  )
}
