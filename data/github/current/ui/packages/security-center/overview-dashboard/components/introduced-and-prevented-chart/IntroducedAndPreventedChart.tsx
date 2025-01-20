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

import {CustomTooltip} from '../../../common/components/custom-tooltip'
import useChartColorPalette from '../../../common/hooks/use-chart-color-palette'
import {paddingPlugin} from '../../../common/utils/ChartJS/PaddingPlugin'
import type CardProps from '../../types/card-props'
import {generateAriaLabelForIntroducedAndPrevented} from './aria'
import {useIntroducedAndPreventedChartData} from './use-introduced-and-prevented-chart-data'

Chart.register(LineController, LineElement, LinearScale, PointElement, Tooltip, Legend, TimeScale, Filler)

type IntroducedAndPreventedChartProps = CardProps

export function IntroducedAndPreventedChart({
  startDate,
  endDate,
  query = '',
  sx = {},
}: IntroducedAndPreventedChartProps): JSX.Element {
  const [tooltipContext, setTooltipContext] = useState<{chart: Chart; tooltip: TooltipModel<'line'>} | null>(null)

  const {theme} = useTheme()
  const colorPalette = useColorPalette()
  const chartColorPalette = useChartColorPalette(colorPalette)

  const font = useMemo(() => {
    return {
      family: theme?.fonts.normal as string | undefined,
      size: parseInt(theme?.fontSizes[0]),
    }
  }, [theme])

  const dataQuery = useIntroducedAndPreventedChartData({query, startDate, endDate})

  const chartStyles = useMemo(() => {
    return [
      {
        colors: chartColorPalette.red,
      },
      {
        colors: chartColorPalette.blue,
        lineDash: [2, 2],
        legendDash: [3, 3],
      },
    ]
  }, [chartColorPalette])

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
          align: 'end' as const,
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

    return {
      datasets: dataQuery.data.map((series, index) => {
        return {
          ...series,
          borderColor: chartStyles[index]?.colors?.border,
          borderDash: chartStyles[index]?.lineDash,
          backgroundColor: chartStyles[index]?.colors?.body,
          fill: true,
        }
      }),
    }
  }, [dataQuery, chartStyles])

  const blankslateParentStyle = useMemo(() => {
    return {display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}
  }, [])

  const tooltipItemSort = useCallback((a: TooltipItem<'line'>, b: TooltipItem<'line'>) => {
    return a.datasetIndex - b.datasetIndex
  }, [])

  function renderBody(): JSX.Element {
    if (dataQuery.isPending) {
      return (
        /*
          This empty fragment is needed to match the structure of the return value when there's data to show
          so React doesn't have to re-render the entire component tree and we maintain any keyboard focus on the
          segmented control buttons.
        */
        <>
          <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}} data-testid="loading-indicator">
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'center',
                backgroundColor: colorPalette.neutral.subtle,
                mb: 2,
                mt: 3,
                borderRadius: '6px',
              }}
            >
              <Spinner />
            </Box>
          </Box>
        </>
      )
    }

    if (dataQuery.isError) {
      return (
        <>
          <Box
            sx={blankslateParentStyle}
            data-testid="error"
            role="region"
            aria-label={generateAriaLabelForIntroducedAndPrevented()}
          >
            <Blankslate>
              <Blankslate.Visual>
                <AlertIcon size="medium" />
              </Blankslate.Visual>
              <Blankslate.Description>Alert trends could not be loaded right now.</Blankslate.Description>
            </Blankslate>
          </Box>
        </>
      )
    }

    if (Object.entries(dataQuery.data).length === 0) {
      return (
        <>
          <Box
            sx={blankslateParentStyle}
            data-testid="no-data"
            role="region"
            aria-label={generateAriaLabelForIntroducedAndPrevented([])}
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
        </>
      )
    }

    return (
      <Box sx={{height: 346, marginTop: '-8px'}} data-testid="chart-container">
        <Text sx={{fontSize: '12px', fontWeight: '400', lineHeight: '18px', color: 'fg.muted'}}>
          Vulnerabilities caught in the developer workflow before being introduced to the default branch
        </Text>
        <Line
          aria-label={generateAriaLabelForIntroducedAndPrevented(dataQuery.data)}
          data={data}
          options={options}
          plugins={[paddingPlugin]}
        />
        {tooltipContext && (
          <CustomTooltip<'line'> tooltipContext={tooltipContext} itemSort={tooltipItemSort} showTotal={true} />
        )}
      </Box>
    )
  }

  return (
    <DataCard cardTitle="Introduced vs. Prevented" sx={{height: 435, width: '100%', ...sx}}>
      {!dataQuery.isPending && <span data-hpc hidden />}
      {renderBody()}
    </DataCard>
  )
}
