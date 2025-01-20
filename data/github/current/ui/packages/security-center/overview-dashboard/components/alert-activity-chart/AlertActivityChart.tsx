import 'chartjs-adapter-date-fns'

import DataCard from '@github-ui/data-card'
import {useColorPalette} from '@github-ui/primer-primitives-deprecated/hooks/use-color-palette'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
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
import {useCallback, useEffect, useMemo, useState} from 'react'
import {Chart} from 'react-chartjs-2'

import {CustomTooltip} from '../../../common/components/custom-tooltip'
import {usePaths} from '../../../common/contexts/Paths'
import {paddingPlugin} from '../../../common/utils/ChartJS/PaddingPlugin'
import {humanReadableDate} from '../../../common/utils/date-formatter'
import {fetchJson} from '../../../common/utils/fetch-json'
import type CardProps from '../../types/card-props'
import {getQueriesByFilterValue} from '../../utils/query-parser'
import {generateAriaLabelForAlertActivity} from './aria'
import type {AlertActivityChartData, FetchResponse} from './fetch-types'

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

export function AlertActivityChart({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const {theme} = useTheme()
  const palette = useColorPalette()
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isNoData, setIsNoData] = useState(false)
  const [data, setData] = useState<AlertActivityChartData[]>([])
  const [tooltipContext, setTooltipContext] = useState<{
    chart: ChartJS
    tooltip: TooltipModel<'bar'> | TooltipModel<'line'>
  } | null>(null)

  const parallelQueriesBy4Slices = useFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices')

  const dateRanges = useMemo(() => {
    return data.map(d => {
      return {
        startDate: d.date,
        endDate: d.endDate,
      }
    })
  }, [data])

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
          data: data.map(d => d.opened - d.closed),
          borderColor: palette.accent.fg,
          borderWidth: 2,
          borderDash: [10, 10],
          pointRadius: 0,
          pointStyle: 'line',
        },
        {
          label: 'Closed',
          data: data.map(d => -1 * d.closed),
          borderWidth: 2,
          borderSkipped: false as const,
          borderColor: palette.done.emphasis,
          backgroundColor: palette.done.subtle,
          barPercentage: 0.5,
        },
        {
          label: 'New',
          data: data.map(d => d.opened),
          borderWidth: 2,
          borderSkipped: false as const,
          borderColor: palette.open.emphasis,
          backgroundColor: palette.open.subtle,
          barPercentage: 0.5,
        },
      ],
    }
  }, [data, dateRanges, palette])

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

  const paths = usePaths()
  useEffect(() => {
    async function fetchData(): Promise<void> {
      setIsLoading(true)

      // Iterate over all resulting tools and fetch data for each tool
      const promises = getQueriesByFilterValue(query, 'tool', [
        'secret-scanning',
        'dependabot',
        'codeql',
        'third-party',
      ])
        .map(perToolQuery => {
          if (parallelQueriesBy4Slices) {
            return ['0', '1', '2', '3'].map(slice => {
              const url = paths.alertActivityPath({startDate, endDate, slice4: slice, query: perToolQuery})
              return fetchJson<FetchResponse>(url)
            })
          } else {
            const url = paths.alertActivityPath({startDate, endDate, query: perToolQuery})
            return [fetchJson<FetchResponse>(url)]
          }
        })
        .flat()

      // Get all responses and check if any of them are not ok
      const [res, resultsOk] = await (async (): Promise<[FetchResponse[], boolean]> => {
        try {
          return [await Promise.all(promises), true]
        } catch {
          return [[], false]
        }
      })()

      if (resultsOk) {
        // Iterate over each result and accumulate it in newData array of type AlertActivityChartData
        // Each result json will contain same array of elements
        // {date: 'Sep 25', endDate: 'Sep 28', closed: 0, opened: 0}
        // So we need to combine the dates into 1 array and sum the closed and open values

        const newData = res.map(r => r.data)

        if (resultsOk) {
          // Combine the newData sub-arrays by date key into 1 array, and add up open and closed counts by day
          const combinedData: AlertActivityChartData[] = newData
            .reduce((acc: AlertActivityChartData[], cur: AlertActivityChartData[]) => acc.concat(cur), []) // combine all sub-arrays into one
            .reduce((acc: AlertActivityChartData[], cur: AlertActivityChartData) => {
              // Accumulate into separate array, which discoveres duplicates (by date) in the combined array and adds them together
              const date = cur.date
              const existing = acc.find(d => d.date === date)
              if (existing) {
                existing.closed += cur.closed
                existing.opened += cur.opened
              } else {
                // Set up a new element, which will also contain endDate
                acc.push(cur)
              }
              return acc
            }, [])

          // Sum all closed and open values, and if the sum is 0, then set no data to true.
          const sumClosed = combinedData.reduce((acc: number, cur: AlertActivityChartData) => acc + cur.closed, 0)
          const sumOpened = combinedData.reduce((acc: number, cur: AlertActivityChartData) => acc + cur.opened, 0)
          const sum = sumClosed + sumOpened

          setIsNoData(sum === 0)
          if (sum !== 0) {
            setData(combinedData)
          }
        }
      }
      setIsError(!resultsOk)

      setIsLoading(false)
    }

    fetchData()
  }, [paths, startDate, endDate, query, parallelQueriesBy4Slices])

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
          aria-label={generateAriaLabelForAlertActivity(data, true)}
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
        <Box sx={blankslateParentStyle} role="region" aria-label={generateAriaLabelForAlertActivity(data)}>
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
          aria-label={generateAriaLabelForAlertActivity(data)}
          data={dataset}
          /* @ts-expect-error setting animation to false is supported, but types are only fixed in 4.0  https://github.com/chartjs/Chart.js/pull/10582*/
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
