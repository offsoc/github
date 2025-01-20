import 'chartjs-adapter-date-fns'

import DataCard from '@github-ui/data-card'
import {useColorPalette} from '@github-ui/primer-primitives-deprecated/hooks/use-color-palette'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Spinner, Text, useTheme} from '@primer/react'
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
import {useCallback, useEffect, useMemo, useState} from 'react'
import {Line} from 'react-chartjs-2'

import {CustomTooltip} from '../../../common/components/custom-tooltip'
import {TrendIndicator} from '../../../common/components/trend-indicator'
import useChartColorPalette from '../../../common/hooks/use-chart-color-palette'
import {useClickLogging} from '../../../common/hooks/use-click-logging'
import {paddingPlugin} from '../../../common/utils/ChartJS/PaddingPlugin'
import {humanReadableDate} from '../../../common/utils/date-formatter'
import {calculatePreviousDateRange} from '../../../common/utils/date-period'
import {calculateTrend} from '../../../common/utils/trend-data'
import type CardProps from '../../types/card-props'
import {generateAriaLabelForAlertTrends} from './aria'
import type {AlertTrend} from './fetch-types'
import type {GroupingType} from './grouping-type'
import {groupingValues} from './grouping-type'
import {useAlertTrendsData, useAlertTrendsQuery, useTotalAlertCountData} from './use-alert-trends-query'

Chart.register(LineController, LineElement, LinearScale, PointElement, Tooltip, Legend, TimeScale, Filler)

interface LabelStyle {
  fillStyle?: string
  lineDash?: number[]
  lineDashOffset?: number
}

interface LineStyle {
  data: AlertTrend[]
  fill: string
  label: string
  backgroundColor?: string
  borderColor?: string
  pointBackgroundColor?: string
  borderDash?: number[]
}

type LabelAndLineStyle = {
  label: LabelStyle
  line: LineStyle
}

type ToolLabelToStyles = Map<string, LabelAndLineStyle>

const defaultGrouping = 'severity'

type AlertsTrendsChartProps = {
  grouping?: GroupingType
  showStateToggle?: boolean
  isOpenSelected: boolean
  updateStateUrl?: boolean
  showChartTitle?: boolean
} & CardProps

export function AlertTrendsChartV2({
  startDate,
  endDate,
  grouping: initialGrouping,
  isOpenSelected,
  updateStateUrl = true,
  query = '',
  sx = {},
}: AlertsTrendsChartProps): JSX.Element {
  const [trend, setTrend] = useState(0)
  const [tooltipContext, setTooltipContext] = useState<{chart: Chart; tooltip: TooltipModel<'line'>} | null>(null)
  const [grouping, setSelectedGrouping] = useState<GroupingType>(initialGrouping ?? defaultGrouping)

  const {logClick} = useClickLogging({category: 'AlertTrendsChart'})
  const {theme} = useTheme()
  const colorPalette = useColorPalette()
  const chartColorPalette = useChartColorPalette(colorPalette)

  const font = useMemo(() => {
    return {
      family: theme?.fonts.normal as string | undefined,
      size: parseInt(theme?.fontSizes[0]),
    }
  }, [theme])

  const alertState = isOpenSelected ? 'open' : 'closed'
  const previousDateRange = calculatePreviousDateRange(startDate, endDate)
  const currentPeriodState = useAlertTrendsQuery({query, startDate, endDate, grouping, alertState})
  const previousPeriodState = useAlertTrendsQuery({
    query,
    startDate: previousDateRange.startDate,
    endDate: previousDateRange.endDate,
    grouping,
    alertState,
  })

  const alertTrends = useAlertTrendsData(currentPeriodState)
  const totalAlertCount = useTotalAlertCountData(currentPeriodState)
  const totalPreviousAlertCount = useTotalAlertCountData(previousPeriodState)
  // current data states
  const isCurrentStateSuccess = currentPeriodState.every(result => result.isSuccess)
  const isCurrentStatePending = currentPeriodState.some(result => result.isPending)
  const isCurrentStateError = currentPeriodState.some(result => result.isError)
  const isNoData = isCurrentStateSuccess && (alertTrends.size === 0 || totalAlertCount === 0)
  // previous data states
  const isPreviousStatePending = previousPeriodState.some(result => result.isPending)
  const isPreviousStateError = previousPeriodState.some(result => result.isError)

  useEffect(() => {
    if (totalAlertCount != null && totalPreviousAlertCount != null) {
      setTrend(calculateTrend(totalAlertCount, totalPreviousAlertCount))
    }
  }, [totalAlertCount, totalPreviousAlertCount])

  // Change the URL.
  useEffect(() => {
    const url = new URL(window.location.href, window.location.origin)
    const nextParams = url.searchParams

    if (updateStateUrl) {
      isOpenSelected
        ? nextParams.delete('alertTrendsChart[isOpenSelected]')
        : nextParams.set('alertTrendsChart[isOpenSelected]', 'false')
    }

    grouping === defaultGrouping
      ? nextParams.delete('alertTrendsChart[grouping]')
      : nextParams.set('alertTrendsChart[grouping]', grouping)

    history.pushState(null, '', `${url.pathname}${url.search}`)
  }, [isOpenSelected, grouping, updateStateUrl])

  const style = useMemo(() => {
    const res = new Map() as ToolLabelToStyles
    if (!isCurrentStateSuccess) return res
    if (alertTrends.size <= 0) return res

    if (grouping === 'tool') {
      // The first 3 tools in the chart (in the order in which they should appear).
      const firstPartyToolsOrder = ['CodeQL', 'Dependabot', 'Secret scanning']
      let colorOrderIdx = 0
      const colorOrder = [
        {
          label: {
            lineDash: [4, 4],
            lineDashOffset: -5.5,
            fillStyle: chartColorPalette.blue!.body,
          },
          line: {
            backgroundColor: chartColorPalette.blue!.body,
            borderColor: chartColorPalette.blue!.border,
            borderDash: [20, 20],
            fill: '-1',
            pointBackgroundColor: chartColorPalette.blue!.border,
          },
        },
        {
          label: {
            fillStyle: chartColorPalette.green!.body,
          },
          line: {
            backgroundColor: chartColorPalette.green!.body,
            borderColor: chartColorPalette.green!.border,
            fill: '-1',
            pointBackgroundColor: chartColorPalette.green!.border,
          },
        },
        {
          label: {
            fillStyle: chartColorPalette.orange!.body,
            lineDash: [4, 4],
            lineDashOffset: -5.5,
          },
          line: {
            backgroundColor: chartColorPalette.orange!.body,
            borderColor: chartColorPalette.orange!.border,
            borderDash: [10, 10],
            fill: '-1',
            pointBackgroundColor: chartColorPalette.orange!.border,
          },
        },
        {
          label: {
            fillStyle: chartColorPalette.pink!.body,
            lineDash: [2, 2],
          },
          line: {
            backgroundColor: chartColorPalette.pink!.body,
            borderColor: chartColorPalette.pink!.border,
            borderDash: [3, 3],
            fill: '-1',
            pointBackgroundColor: chartColorPalette.pink!.border,
          },
        },
        {
          label: {
            fillStyle: chartColorPalette.gray!.body,
            lineDash: [4, 4],
            lineDashOffset: -5.5,
          },
          line: {
            backgroundColor: chartColorPalette.gray!.body,
            borderColor: chartColorPalette.gray!.border,
            borderDash: [20, 10],
            fill: '-1',
            pointBackgroundColor: chartColorPalette.gray!.border,
          },
        },
        {
          label: {
            fillStyle: chartColorPalette.yellow!.body,
          },
          line: {
            backgroundColor: chartColorPalette.yellow!.body,
            borderColor: chartColorPalette.yellow!.border,
            fill: '-1',
            pointBackgroundColor: chartColorPalette.yellow!.border,
          },
        },
        {
          label: {
            fillStyle: chartColorPalette.red!.body,
            lineDash: [3, 3],
          },
          line: {
            backgroundColor: chartColorPalette.red!.body,
            borderColor: chartColorPalette.red!.border,
            borderDash: [5, 5],
            fill: '-1',
            pointBackgroundColor: chartColorPalette.red!.border,
          },
        },
      ]

      for (const tool of firstPartyToolsOrder) {
        if (colorOrderIdx >= colorOrder.length - 1) break
        if (!alertTrends.has(tool)) continue

        const colors = colorOrder[colorOrderIdx++]
        res.set(tool, {
          label: colors?.label as LabelStyle,
          line: {label: tool, data: alertTrends.get(tool), ...colors?.line} as LineStyle,
        })
      }

      // Assign colors to the third-party tools.
      if (alertTrends.size > 0) {
        for (const [tool, dataPoints] of alertTrends) {
          if (colorOrderIdx >= colorOrder.length - 1) break
          if (['CodeQL', 'Dependabot', 'Secret scanning', 'Other third-party tools'].includes(tool)) continue

          const colors = colorOrder[colorOrderIdx++]
          res.set(tool, {
            label: colors?.label as LabelStyle,
            line: {label: tool, data: dataPoints, ...colors?.line} as LineStyle,
          })
        }
      }

      if (alertTrends.has('Other third-party tools')) {
        const colors = colorOrder[colorOrderIdx]
        res.set('Other third-party tools', {
          label: colors?.label as LabelStyle,
          line: {
            label: 'Other third-party tools',
            data: alertTrends.get('Other third-party tools'),
            ...colors?.line,
          } as LineStyle,
        })
      }

      // Add `fill: 'origin'` to the first tool's line.
      if (res.size > 0) {
        const firstTool = res.values().next().value as LabelAndLineStyle
        firstTool.line.fill = 'origin'
      }
    }

    if (grouping === 'severity') {
      res.set('Low', {
        label: {
          fillStyle: chartColorPalette.gray!.body,
          lineDash: [4, 4],
          lineDashOffset: -5.5,
        },
        line: {
          backgroundColor: chartColorPalette.gray!.body,
          borderColor: chartColorPalette.gray!.border,
          borderDash: [20, 10],
          data: alertTrends.get('Low') as AlertTrend[],
          fill: 'origin',
          label: 'Low',
          pointBackgroundColor: chartColorPalette.gray!.border,
        },
      })

      res.set('Medium', {
        label: {
          fillStyle: chartColorPalette.yellow!.body,
        },
        line: {
          backgroundColor: chartColorPalette.yellow!.body,
          borderColor: chartColorPalette.yellow!.border,
          data: alertTrends.get('Medium') as AlertTrend[],
          fill: '-1',
          label: 'Medium',
          pointBackgroundColor: chartColorPalette.yellow!.border,
        },
      })

      res.set('High', {
        label: {
          fillStyle: chartColorPalette.orange!.body,
          lineDash: [4, 4],
          lineDashOffset: -5.5,
        },
        line: {
          backgroundColor: chartColorPalette.orange!.body,
          borderColor: chartColorPalette.orange!.border,
          borderDash: [10, 10],
          data: alertTrends.get('High') as AlertTrend[],
          fill: '-1',
          label: 'High',
          pointBackgroundColor: chartColorPalette.orange!.border,
        },
      })

      res.set('Critical', {
        label: {
          fillStyle: chartColorPalette.pink!.body,
          lineDash: [2, 2],
        },
        line: {
          backgroundColor: chartColorPalette.pink!.body,
          borderColor: chartColorPalette.pink!.border,
          borderDash: [3, 3],
          data: alertTrends.get('Critical') as AlertTrend[],
          fill: '-1',
          label: 'Critical',
          pointBackgroundColor: chartColorPalette.pink!.border,
        },
      })
    }

    if (grouping === 'age') {
      res.set('90+ days', {
        label: {
          lineDash: [4, 4],
          fillStyle: chartColorPalette.pink!.body,
        },
        line: {
          backgroundColor: chartColorPalette.pink!.body,
          borderColor: chartColorPalette.pink!.border,
          borderDash: [20, 10],
          data: alertTrends.get('90+ days') as AlertTrend[],
          fill: 'origin',
          label: '90+ days',
          pointBackgroundColor: chartColorPalette.pink!.border,
        },
      })

      res.set('60 - 89 days', {
        label: {
          fillStyle: chartColorPalette.orange!.body,
        },
        line: {
          backgroundColor: chartColorPalette.orange!.body,
          borderColor: chartColorPalette.orange!.border,
          data: alertTrends.get('60 - 89 days') as AlertTrend[],
          fill: '-1',
          label: '60 - 89 days',
          pointBackgroundColor: chartColorPalette.orange!.border,
        },
      })

      res.set('31 - 59 days', {
        label: {
          lineDash: [4, 4],
          lineDashOffset: -5.5,
          fillStyle: chartColorPalette.green!.body,
        },
        line: {
          backgroundColor: chartColorPalette.green!.body,
          borderColor: chartColorPalette.green!.border,
          borderDash: [10, 10],
          data: alertTrends.get('31 - 59 days') as AlertTrend[],
          fill: '-1',
          label: '31 - 59 days',
          pointBackgroundColor: chartColorPalette.green!.border,
        },
      })

      res.set('< 30 days', {
        label: {
          lineDash: [2, 2],
          fillStyle: chartColorPalette.blue!.body,
        },
        line: {
          backgroundColor: chartColorPalette.blue!.body,
          borderColor: chartColorPalette.blue!.border,
          borderDash: [3, 3],
          data: alertTrends.get('< 30 days') as AlertTrend[],
          fill: '-1',
          label: '< 30 days',
          pointBackgroundColor: chartColorPalette.blue!.border,
        },
      })
    }

    return res
  }, [alertTrends, isCurrentStateSuccess, grouping, chartColorPalette])

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
          labels: {
            color: colorPalette.fg.default,
            font,
            boxWidth: 7,
            usePointStyle: true,
            generateLabels: (chart: Chart): LegendItem[] => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart)
              return labels.map(label => {
                return {...label, lineWidth: 2, ...(style.get(label.text) as LabelAndLineStyle).label}
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
  }, [colorPalette, font, style])

  const chartData = useMemo(() => {
    return {datasets: Array.from(style.values()).map(({line}) => line)}
  }, [style])

  const blankslateParentStyle = useMemo(() => {
    return {display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}
  }, [])

  const tooltipItemSort = useCallback(
    (a: TooltipItem<'line'>, b: TooltipItem<'line'>) => {
      const sortEnum = Array.from(style.keys()).reverse()
      // eslint-disable-next-line github/no-dataset
      return sortEnum.indexOf(a.dataset.label || '') - sortEnum.indexOf(b.dataset.label || '')
    },
    [style],
  )

  const formattedEndDate = humanReadableDate(new Date(endDate), {includeYear: true})

  function groupingLabel(val: GroupingType): string {
    switch (val) {
      case 'age':
        return 'Age'
      case 'severity':
        return 'Severity'
      case 'tool':
        return 'Tool'
    }
  }

  function onChangeSelectedGrouping(newGrouping: GroupingType): void {
    logClick({action: 'select alert trends grouping', label: newGrouping})
    setSelectedGrouping(newGrouping)
  }

  function renderGroupingOptions(): JSX.Element[] {
    return groupingValues.map(groupingValue => {
      return (
        <ActionList.Item
          key={groupingValue}
          onSelect={() => onChangeSelectedGrouping(groupingValue)}
          selected={grouping === groupingValue}
        >
          {groupingLabel(groupingValue)}
        </ActionList.Item>
      )
    })
  }

  function renderGroupBy(): JSX.Element {
    return (
      <Box sx={{display: 'flex', justifyContent: 'end'}}>
        <ActionMenu>
          <ActionMenu.Button variant="invisible" data-testid="grouping-selector">
            <Text sx={{color: 'fg.subtle'}}>Group by: </Text>
            {groupingLabel(grouping)}
          </ActionMenu.Button>
          <ActionMenu.Overlay>
            <ActionList selectionVariant="single">{renderGroupingOptions()}</ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Box>
    )
  }

  function renderBody(): JSX.Element {
    if (isCurrentStatePending) {
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

    if (!groupingValues.includes(grouping)) {
      return (
        <>
          <Box
            sx={blankslateParentStyle}
            data-testid="error"
            role="region"
            aria-label={generateAriaLabelForAlertTrends([], isOpenSelected, true)}
          >
            <Blankslate>
              <Blankslate.Visual>
                <AlertIcon size="medium" />
              </Blankslate.Visual>
              <Blankslate.Description>
                Invalid grouping. Please select a valid grouping from the dropdown.
              </Blankslate.Description>
            </Blankslate>
          </Box>
        </>
      )
    }

    if (isCurrentStateError) {
      return (
        <>
          <Box
            sx={blankslateParentStyle}
            data-testid="error"
            role="region"
            aria-label={generateAriaLabelForAlertTrends([], isOpenSelected, true)}
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

    if (isNoData) {
      return (
        <>
          <Box
            sx={blankslateParentStyle}
            data-testid="no-data"
            role="region"
            aria-label={generateAriaLabelForAlertTrends([], isOpenSelected)}
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
      <>
        <Box sx={{display: 'flex', justifyContent: 'left', alignItems: 'baseline', gap: '1em'}}>
          {totalAlertCount != null && <DataCard.Counter count={totalAlertCount} sx={{mb: 3, mt: 1, ml: 1}} />}
          <TrendIndicator
            loading={isCurrentStatePending || isPreviousStatePending}
            error={isCurrentStateError || isPreviousStateError}
            value={trend}
            flipColor={!isOpenSelected}
          />
          <Text sx={{color: 'fg.muted', fontSize: '12px'}}>{`as of ${formattedEndDate}`}</Text>
        </Box>
        <Box sx={{height: 346}} data-testid="chart-container">
          <Line
            aria-label={generateAriaLabelForAlertTrends(Array.from(alertTrends.values()), isOpenSelected)}
            data={chartData}
            options={options}
            plugins={[paddingPlugin]}
          />
          {tooltipContext && (
            <CustomTooltip<'line'> tooltipContext={tooltipContext} itemSort={tooltipItemSort} showTotal={true} />
          )}
        </Box>
      </>
    )
  }

  return (
    <DataCard
      cardTitle={`${isOpenSelected ? 'Open' : 'Closed'} alerts over time`}
      action={renderGroupBy()}
      sx={{height: 454, width: '100%', ...sx}}
    >
      {!isCurrentStatePending && <span data-hpc hidden />}
      {renderBody()}
    </DataCard>
  )
}
