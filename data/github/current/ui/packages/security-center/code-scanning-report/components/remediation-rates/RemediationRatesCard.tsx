import DataCard from '@github-ui/data-card'
import {useColorPalette} from '@github-ui/primer-primitives-deprecated/hooks/use-color-palette'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Spinner, useTheme} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  type ChartData,
  type ChartOptions,
  Filler,
  Legend,
  LinearScale,
  PointElement,
  Tooltip,
  type TooltipItem,
  type TooltipModel,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import {useMemo, useState} from 'react'
import {Bar} from 'react-chartjs-2'

import {CustomTooltip} from '../../../common/components/custom-tooltip'
import {paddingPlugin} from '../../../common/utils/ChartJS/PaddingPlugin'
import useRemediationRatesQuery, {type UseRemediationRatesQueryParams} from './use-remediation-rates-query'

Chart.register(
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

function useFont(): {family?: string; size: number} {
  const {theme} = useTheme()
  return useMemo(() => {
    return {
      family: theme?.fonts.normal as string | undefined,
      size: parseInt(theme?.fontSizes[0]),
    }
  }, [theme])
}

interface RemediationRatesCardProps extends UseRemediationRatesQueryParams {}

export default function RemediationRatesCard(props: RemediationRatesCardProps): JSX.Element {
  const dataQuery = useRemediationRatesQuery(props)

  const font = useFont()
  const palette = useColorPalette()
  const [tooltipContext, setTooltipContext] = useState<{chart: Chart; tooltip: TooltipModel<'bar'>} | null>(null)

  const options: ChartOptions<'bar'> = useMemo(() => {
    const gridBorderDash = [2, 2]
    const gridColor = palette.border.default
    const fontColor = palette.fg.muted

    return {
      // horizontal bar chart
      indexAxis: 'y',
      // allow chart to resize and fill available space
      maintainAspectRatio: false,
      responsive: true,
      // control bar relative size to chart
      barPercentage: 0.6,
      // bar styling
      elements: {
        bar: {
          borderRadius: 2,
        },
      },
      plugins: {
        // no legend; category labels are sufficient
        legend: {
          display: false,
        },
        // disable the built-in tooltip, we use our own
        tooltip: {
          enabled: false,
          external: setTooltipContext,
        },
        // default options do not support having a solid border with dashed grid
        // we import a plugin to draw a new border along the y axis
        annotation: {
          annotations: {
            zeroLine: {
              type: 'line',
              xMin: 0,
              xMax: 0,
              borderColor: gridColor,
              borderWidth: 1,
            },
          },
        },
      },
      scales: {
        // config for x-axis
        x: {
          min: 0,
          max: 100,
          grid: {
            color: gridColor,
            borderColor: gridColor,
            borderDash: gridBorderDash,
            drawTicks: false,
          },
          ticks: {
            font,
            color: fontColor,
            stepSize: 25,
            callback(value, _index, _ticks): string {
              return `${value}%`
            },
          },
          title: {
            display: true,
            color: fontColor,
            text: 'Alert remediation rate',
          },
        },
        // config for y-axis
        y: {
          grid: {
            display: false,
          },
          ticks: {
            font,
            color: fontColor,
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'y',
        intersect: false,
      },
    }
  }, [font, palette])

  type DataPoint = {y: string; x: number | null}
  const data: ChartData<'bar', DataPoint[]> = useMemo(() => {
    if (!dataQuery.isSuccess) {
      return {datasets: []}
    }

    return {
      // We need the values in separate datasets to be compatible with CustomTooltip later.
      // To then get the bar chart to render properly, we need to create dummy data records as placeholders.
      datasets: [
        {
          label: 'With autofix',
          data: [
            {y: 'With autofix', x: dataQuery.data.percentFixedWithAutofixSuggested},
            {y: 'Without autofix', x: null},
          ],
          backgroundColor: palette.accent.emphasis,
          skipNull: true,
        },
        {
          label: 'Without autofix',
          data: [
            {y: 'With autofix', x: null},
            {y: 'Without autofix', x: dataQuery.data.percentFixedWithNoAutofixSuggested},
          ],
          backgroundColor: palette.accent.emphasis,
          skipNull: true,
        },
      ],
    }
  }, [dataQuery, palette])

  function renderBody(): JSX.Element {
    const blankslateParentStyle = {
      display: 'flex',
      flexDirection: 'column',
      height: 118,
      my: 2,
    }

    if (dataQuery.isPending) {
      return (
        <Box sx={blankslateParentStyle} data-testid="loading-indicator">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              backgroundColor: palette.neutral.subtle,
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
        <Box sx={blankslateParentStyle} data-testid="error-indicator">
          <Blankslate>
            <Blankslate.Visual>
              <AlertIcon size="medium" />
            </Blankslate.Visual>
            <Blankslate.Description>Data could not be loaded right now.</Blankslate.Description>
          </Blankslate>
        </Box>
      )
    }

    const chartAriaLabel = [
      `Bar chart describing alert remediation rates. It consists of 2 data points.`,
      `Alerts that have an autofix suggestion are fixed at a rate of ${dataQuery.data?.percentFixedWithAutofixSuggested}%.`,
      `Alerts with no autofix suggestion are fixed at a rate of ${dataQuery.data?.percentFixedWithNoAutofixSuggested}%.`,
    ].join(' ')

    return (
      <Box data-testid="chart-container" sx={{mt: -2}}>
        <Bar aria-label={chartAriaLabel} data={data} options={options} plugins={[paddingPlugin]} />
        {tooltipContext && (
          <CustomTooltip<'bar'>
            tooltipContext={tooltipContext}
            customTitle={() => 'Remediation rates'}
            itemValueTransform={(item: TooltipItem<'bar'>) => {
              // Each dataset only has relevant data in its `data` property at the same index.
              // We're also using a custom type, so we cast through unknown.
              // eslint-disable-next-line github/no-dataset
              const dataPoint = item.dataset.data[item.datasetIndex] as unknown as DataPoint
              return `${dataPoint.x}%`
            }}
          />
        )}
      </Box>
    )
  }

  return (
    <DataCard cardTitle="Remediation rates">
      <DataCard.Description sx={{mt: -2, mb: 0}}>
        Percentage of alerts with an available autofix suggestion that were remediated compared to those without an
        autofix suggestion
      </DataCard.Description>
      {renderBody()}
    </DataCard>
  )
}
