import {Box, Heading} from '@primer/react'
import capitalize from 'lodash-es/capitalize'

import {ChartCard} from '@github-ui/chart-card'

import {ErrorComponent, LoadingComponent, NoDataComponent} from '..'

import {RequestState, UsageGrouping, UsagePeriod} from '../../enums'
import {boxStyle} from '../../utils/style'

import type {Filters, OtherUsageLineItem, UsageLineItem} from '../../types/usage'
import type {ReactNode} from 'react'
import {useChartCardDetails} from '../../hooks/usage'
import useUsageChartData from '../../hooks/usage/use-usage-chart-data'
const containerStyle = {
  ...boxStyle,
  width: '100%',
  height: '100%',
  p: 0,
  mb: 3,
}

const chartHeaderContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  pl: 3,
  pr: 3,
  pt: 3,
}

const innerContainerStyle = {
  height: '432px',
  border: 0,
}

const chartSubtitleStyle = (showTitle: boolean) => {
  if (showTitle) {
    return {
      color: 'fg.muted',
      fontSize: '14px',
      fontWeight: 'normal',
    }
  } else {
    return {
      color: 'fg.muted',
      fontSize: '16px',
      fontWeight: 'bold',
    }
  }
}

function getChartTitle(filters: Filters) {
  let title = 'Metered usage'
  let groupByType = ''

  switch (filters.group?.type) {
    case UsageGrouping.ORG: {
      groupByType = 'Organization'
      break
    }
    case UsageGrouping.REPO: {
      groupByType = 'Repository'
      break
    }
    case UsageGrouping.SKU: {
      groupByType = 'SKU'
      break
    }
    case UsageGrouping.PRODUCT: {
      groupByType = 'Product'
      break
    }
  }

  // Only attempt to add filter data to the title text if it exists and has a filter value
  if (filters.searchQuery && filters.searchQuery.includes(':')) {
    let queryPartsTitleText = ''
    // Split by spaces, unless those spaces are in quotation marks, which is common for cost center names
    const queryParts = filters.searchQuery.match(/(?:[^\s"]+|"[^"]*")+/g) || []

    for (const queryPart of queryParts) {
      const [groupByField, groupByValue] = queryPart.split(':')

      if (!groupByField || !groupByValue) continue

      if (['repo', 'org'].includes(groupByField)) {
        queryPartsTitleText += `${groupByValue} `
      } else if (['product', 'sku'].includes(groupByField)) {
        queryPartsTitleText += `${capitalize(groupByValue)} `
      } else if (['cost_center'].includes(groupByField)) {
        // Cost center names with spaces will be in quotation marks, remove those if present at beginning and end
        if (groupByValue.startsWith('"') && groupByValue.endsWith('"')) {
          queryPartsTitleText += `${groupByValue.split('').slice(1, -1).join('')} `
        } else {
          queryPartsTitleText += `${groupByValue} `
        }
      }
    }

    if (queryPartsTitleText) title = `${queryPartsTitleText} usage`
  }

  if (groupByType) title += ` grouped by ${groupByType}`

  return title
}

function getChartSubtitle(filters: Filters) {
  switch (filters.period?.type) {
    case UsagePeriod.THIS_YEAR: {
      const date = new Date()
      return date.toLocaleDateString('en-US', {timeZone: 'UTC', year: 'numeric'})
    }
    case UsagePeriod.THIS_MONTH: {
      const date = new Date()

      const month = date.toLocaleDateString('en-US', {timeZone: 'UTC', month: 'short'})
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDate()
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

      return `${month} ${firstDay} - ${month} ${lastDay}, ${date.getFullYear()}`
    }
    case UsagePeriod.TODAY: {
      const date = new Date()
      const dateString = date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
      return `${dateString} (All times in UTC)`
    }
    case UsagePeriod.THIS_HOUR: {
      const date = new Date()
      const dateString = date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
      })
      return `${dateString} UTC`
    }
    case UsagePeriod.LAST_MONTH: {
      const date = new Date()
      date.setMonth(date.getMonth() - 1)
      const month = date.toLocaleDateString('en-US', {timeZone: 'UTC', month: 'short'})
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDate()
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

      return `${month} ${firstDay} - ${month} ${lastDay}, ${date.getFullYear()}`
    }
    case UsagePeriod.LAST_YEAR: {
      const date = new Date()
      const year = date.toLocaleDateString('en-US', {timeZone: 'UTC', year: 'numeric'})
      return `${Number(year) - 1} (All times in UTC)`
    }
    default: {
      return ''
    }
  }
}

function getChartPeriod(filters: Filters) {
  switch (filters.period?.type) {
    case UsagePeriod.THIS_YEAR:
    case UsagePeriod.LAST_YEAR: {
      return 30 * 24 * 3600 * 1000 // month
    }
    case UsagePeriod.THIS_MONTH:
    case UsagePeriod.LAST_MONTH: {
      return 24 * 3600 * 1000 // day
    }
    case UsagePeriod.TODAY: {
      return 3600 * 1000 // hour
    }
    case UsagePeriod.THIS_HOUR: {
      return 60 * 1000 // 1 minute
    }
    default: {
      return 24 * 3600 * 1000 // day
    }
  }
}

function getTooltipLabel(filters: Filters) {
  switch (filters.period?.type) {
    case UsagePeriod.THIS_YEAR:
    case UsagePeriod.LAST_YEAR: {
      return 'in %b %Y' // month
    }
    case UsagePeriod.THIS_MONTH:
    case UsagePeriod.LAST_MONTH: {
      return 'on %b %e, %Y' // day
    }
    case UsagePeriod.TODAY: {
      return 'at %l%p' // hour
    }
    case UsagePeriod.THIS_HOUR: {
      return 'at %l:%M%p' // 1 minute
    }
    default: {
      return '%b %e, %Y' // day
    }
  }
}

function getXAxisLabel(filters: Filters) {
  switch (filters.period?.type) {
    case UsagePeriod.THIS_YEAR:
    case UsagePeriod.LAST_YEAR: {
      return '{value:%b}' // month
    }
    case UsagePeriod.THIS_MONTH:
    case UsagePeriod.LAST_MONTH: {
      return '{value:%b %e}' // month day
    }
    case UsagePeriod.TODAY: {
      return '{value:%l%p}' // hour AM/PM
    }
    case UsagePeriod.THIS_HOUR: {
      return '{value:%l:%M%p}' // hour:minute AM/PM
    }
    default: {
      return '{value:%b %e}' // month day
    }
  }
}

interface UsageChartProps {
  filters: Filters
  requestState: RequestState
  usage: UsageLineItem[]
  otherUsage?: OtherUsageLineItem[]
  // Used to add children alongside the usage actions component.
  children?: ReactNode
  // Whether or not to show the chart title. The subtitle is always shown. Defaults to true
  showTitle?: boolean
  useUsageChartDataEndpoint: boolean
}

export function UsageChart({
  filters,
  requestState,
  usage,
  otherUsage,
  children,
  showTitle = true,
  useUsageChartDataEndpoint,
}: UsageChartProps) {
  const {usageChartData, requestState: usageChartRequestState} = useUsageChartData({filters, useUsageChartDataEndpoint})
  const chartRequestState = useUsageChartDataEndpoint ? usageChartRequestState : requestState
  const chartCardDetails = useChartCardDetails({usage, otherUsage, filters})
  const details = useUsageChartDataEndpoint ? usageChartData : chartCardDetails.data.datasets
  const usageLength = useUsageChartDataEndpoint ? details.length : usage.length
  const chartLoaded = chartRequestState === RequestState.IDLE && usageLength > 0
  const usageChartStartDate = usageChartData[0]?.data[0]?.x ?? new Date()
  const startDate = useUsageChartDataEndpoint ? usageChartStartDate : chartCardDetails.data.startDate
  const pointFormatStr = useUsageChartDataEndpoint
    ? // eslint-disable-next-line github/unescaped-html-literal
      '<tr><td style="padding-top:var(--base-size-4)"><span style="color:{point.color}">●</span> Gross:</td><td style="text-align: right; padding-top:var(--base-size-4);"><strong>{point.custom.grossAmount:,.2f}</strong></td></tr><tr><td style="padding-top:var(--base-size-4); padding-left:16px"> Billed:</td><td style="text-align: right; padding-top:var(--base-size-4);"><strong>{point.custom.totalAmount:,.2f}</strong></td></tr><tr><td style="padding-top:var(--base-size-4); padding-left:16px"> Discount:</td><td style="text-align: right; padding-top:var(--base-size-4);"><strong>{point.custom.discountAmount:,.2f}</strong></td></tr><table>'
    : // eslint-disable-next-line github/unescaped-html-literal
      '<tr><td style="padding-top:var(--base-size-4)"><span style="color:{point.color}">●</span> Gross:</td><td style="text-align: right; padding-top:var(--base-size-4);"><strong>{point.custom.formattedGrossAmount:,.2f}</strong></td></tr><tr><td style="padding-top:var(--base-size-4); padding-left:16px"> Billed:</td><td style="text-align: right; padding-top:var(--base-size-4);"><strong>{point.custom.formattedTotalAmount:,.2f}</strong></td></tr><tr><td style="padding-top:var(--base-size-4); padding-left:16px"> Discount:</td><td style="text-align: right; padding-top:var(--base-size-4);"><strong>{point.custom.formattedDiscountAmount:,.2f}</strong></td></tr><table>'

  return (
    <div data-hpc>
      <Box sx={{pb: 2, display: ['block', 'none'], maxWidth: '100%'}}>{children}</Box>
      <Box sx={chartLoaded ? {} : containerStyle}>
        {!chartLoaded && (
          <Box sx={chartHeaderContainerStyle}>
            <div>
              {showTitle && (
                <Heading as="h3" sx={{fontSize: 2}} id="usage-chart-title" data-testid="usage-chart-title">
                  {getChartTitle(filters)}
                </Heading>
              )}
              <Heading
                as={showTitle ? 'h4' : 'h3'}
                sx={chartSubtitleStyle(showTitle)}
                id="usage-chart-subtitle"
                data-testid="usage-chart-subtitle"
                className={showTitle ? '' : 'h4'}
              >
                {getChartSubtitle(filters)}
              </Heading>
            </div>
            <Box sx={{pr: 2, display: ['none', 'block']}}>{children}</Box>
          </Box>
        )}

        <Box sx={{mb: 3}}>
          {[RequestState.INIT, RequestState.LOADING].includes(chartRequestState) && (
            <LoadingComponent sx={innerContainerStyle} testid="usage-loading-spinner" />
          )}
          {chartRequestState === RequestState.ERROR && (
            <ErrorComponent sx={innerContainerStyle} testid="usage-loading-error" text="Something went wrong" />
          )}
          {chartRequestState === RequestState.IDLE && (
            <>
              {usageLength === 0 && (
                <NoDataComponent sx={innerContainerStyle} testid="no-usage-data" text="No usage found" />
              )}
              {usageLength > 0 && (
                <>
                  <ChartCard size="xl" border={true}>
                    <ChartCard.Title sx={showTitle ? {} : chartSubtitleStyle(showTitle)}>
                      {showTitle ? getChartTitle(filters) : getChartSubtitle(filters)}
                    </ChartCard.Title>
                    {showTitle && <ChartCard.Description>{getChartSubtitle(filters)}</ChartCard.Description>}
                    <ChartCard.TrailingVisual>
                      <Box sx={{pr: 2, display: ['none', 'block']}}>{children}</Box>
                    </ChartCard.TrailingVisual>
                    <ChartCard.Chart
                      series={details.map(dataset => ({...dataset, type: 'areaspline'}))}
                      xAxisTitle={'Time'}
                      yAxisTitle={'Billing'}
                      xAxisOptions={{
                        type: 'datetime',
                        labels: {
                          format: getXAxisLabel(filters),
                        },
                        title: {
                          text: null,
                        },
                        gridLineDashStyle: 'Solid',
                      }}
                      yAxisOptions={{
                        labels: {
                          format: '${value:,.0f}',
                        },
                        gridLineDashStyle: 'Solid',
                        title: {
                          text: null,
                        },
                      }}
                      plotOptions={{
                        series: {
                          pointStart: startDate,
                          pointInterval: getChartPeriod(filters),
                          marker: {
                            enabled: false,
                          },
                        },
                      }}
                      type={'areaspline'}
                      overrideOptionsNotRecommended={{
                        legend: {
                          enabled: true,
                          margin: 16,
                          align: 'left',
                          layout: 'horizontal',
                          verticalAlign: 'top',
                          floating: false,
                          maxHeight: 64,
                        },
                        tooltip: {
                          dateTimeLabelFormats: {
                            millisecond: getTooltipLabel(filters),
                          },
                          // eslint-disable-next-line github/unescaped-html-literal
                          headerFormat: '<table><tr><th colspan="2">{series.name} {point.key}</th></tr>',
                          pointFormat: pointFormatStr,
                        },
                        accessibility: {keyboardNavigation: {order: ['legend', 'series']}},
                      }}
                    />
                  </ChartCard>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </div>
  )
}

export default UsageChart
