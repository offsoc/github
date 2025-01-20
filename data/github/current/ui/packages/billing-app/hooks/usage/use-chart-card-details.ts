import last from 'lodash-es/last'
import range from 'lodash-es/range'
import React from 'react'

import type {Products} from '../../constants'
import {DEFAULT_GROUP_TYPE, HighWatermarkProducts} from '../../constants'
import {UsageGrouping, UsagePeriod} from '../../enums'
import {groupLineItems, sortByUsageAtDesc} from '../../utils/group'
import {formatMoneyDisplay} from '../../utils/money'
import {isProductUsageLineItem, isRepoUsageLineItem} from '../../utils/types'

import type {
  Filters,
  PeriodSelection,
  ProductUsageLineItem,
  RepoUsageLineItem,
  OtherUsageLineItem,
  UsageLineItem,
} from '../../types/usage'

const colors = [
  'var(--data-green-color-emphasis, var(--data-green-color))',
  'var(--data-blue-color-emphasis, var(--data-blue-color))',
  'var(--data-orange-color-emphasis, var(--data-orange-color))',
  'var(--data-pink-color-emphasis, var(--data-pink-color))',
  'var(--data-yellow-color-emphasis, var(--data-yellow-color))',
  'var(--data-red-color-emphasis, var(--data-red-color))',
  'var(--data-purple-color-emphasis, var(--data-purple-color))',
  'var(--data-auburn-color-emphasis, var(--data-auburn-color))',
  'var(--data-teal-color-emphasis, var(--data-teal-color))',
]

/*
  This is the clientside representation of usage by timestamp, where the timestamp has been
  multiplied by 1000 to be represented by a javascript Date object correctly.
  Custom values for each point are used to display additional information in the tooltip.
  https://arc.net/l/quote/axqswddy

  [
    x: timestamp
    y: value (additions or deletions)
    custom: {
      discountAmount?: Amount of a discount, if applicable
      grossAmount: Amount of the usage in dollars
      totalAmount?: Amount of the usage after discount, if applicable
      formattedDiscountAmount: Discount amount string that will appear on the tooltip
      formattedGrossAmount: Gross amount string that will appear on the tooltip
      formattedTotalAmount: Total amount string that will appear on the tooltip
    }
  ]
*/
type ChartPoint = {
  x: number
  y: number
  custom: {
    discountAmount?: number | 'N/A'
    grossAmount: number
    totalAmount?: number | 'N/A'
    formattedDiscountAmount: string
    formattedGrossAmount: string
    formattedTotalAmount: string
  }
}

interface ChartDataset {
  data: ChartPoint[]
  name: string
  type: string
  lineWidth: number
  color?: string
  product?: Products
}

interface UsageChartData {
  datasets: ChartDataset[]
  startDate: number
}

function convertToChartCardPoint(
  lineItem: UsageLineItem,
  groupType: UsageGrouping,
  period: PeriodSelection | undefined,
): ChartPoint {
  if (groupType === UsageGrouping.ORG || groupType === UsageGrouping.REPO) {
    return {
      x: formatDate(lineItem.usageAt, period),
      y: formatMoneyAmount(lineItem.billedAmount),
      custom: {
        grossAmount: lineItem.billedAmount,
        formattedDiscountAmount: 'N/A',
        formattedGrossAmount: formatGrossAmount(lineItem.billedAmount),
        formattedTotalAmount: 'N/A',
      },
    }
  } else {
    return {
      x: formatDate(lineItem.usageAt, period),
      y: formatMoneyAmount(lineItem.billedAmount),
      custom: {
        discountAmount: lineItem.discountAmount ?? 'N/A',
        grossAmount: lineItem.billedAmount,
        totalAmount: lineItem.totalAmount ?? 'N/A',
        formattedDiscountAmount: formatDiscountAmount(lineItem.discountAmount ?? 'N/A'),
        formattedGrossAmount: formatGrossAmount(lineItem.billedAmount),
        formattedTotalAmount: formatTotalAmount(lineItem.totalAmount ?? 'N/A'),
      },
    }
  }
}

type ProductGroupKey = 'product' | 'friendlySkuName'
type RepoGroupKey = 'org' | 'repo'
type GroupKey = ProductGroupKey | RepoGroupKey

const isValidProductGrouping = (key: string, obj: ProductUsageLineItem): key is ProductGroupKey => {
  return key in obj
}
const isValidRepoGrouping = (key: string, obj: RepoUsageLineItem): key is RepoGroupKey => {
  return key in obj
}

function getChartDatasets(
  lineItems: UsageLineItem[],
  groupType: UsageGrouping,
  groupBy: GroupKey,
  period: PeriodSelection | undefined,
): ChartDataset[] {
  const datasetMap = lineItems.reduce<Record<string, ChartDataset>>((acc, lineItem) => {
    const point = convertToChartCardPoint(lineItem, groupType, period)

    let groupKey = ''
    if (isProductUsageLineItem(lineItem) && isValidProductGrouping(groupBy, lineItem)) {
      groupKey = lineItem[groupBy]
    } else if (isRepoUsageLineItem(lineItem) && isValidRepoGrouping(groupBy, lineItem)) {
      groupKey = groupBy === 'repo' ? `${lineItem.org.name}/${lineItem[groupBy].name}` : lineItem[groupBy].name
    }

    if (!acc[groupKey]) {
      const color = colors[Object.keys(acc).length % colors.length]

      acc[groupKey] = {
        color,
        data: [],
        name: `${groupKey}`,
        type: 'areaspline',
        lineWidth: 2,
        product: isProductUsageLineItem(lineItem) ? (lineItem.product as Products) : undefined,
      }
    }
    acc[groupKey]?.data.push(point)

    return acc
  }, {})

  return Object.values(datasetMap)
}

function buildOtherUsageDataset(otherUsage: OtherUsageLineItem[], period: PeriodSelection | undefined): ChartDataset {
  const otherDataPoints: ChartPoint[] = otherUsage.map(otherUsageLineItem => {
    return {
      x: formatDate(otherUsageLineItem.usageAt, period),
      y: formatMoneyAmount(otherUsageLineItem.billedAmount),
      custom: {
        grossAmount: otherUsageLineItem.billedAmount,
        formattedDiscountAmount: 'N/A',
        formattedGrossAmount: formatGrossAmount(otherUsageLineItem.billedAmount),
        formattedTotalAmount: 'N/A',
      },
    }
  })

  return {
    color: 'var(--data-gray-color-emphasis, var(--data-gray-color))',
    data: otherDataPoints,
    name: `All other`,
    type: 'areaspline',
    lineWidth: 2,
  }
}

function getSummedDataset(
  lineItems: UsageLineItem[],
  groupType: UsageGrouping,
  period: PeriodSelection | undefined,
): ChartDataset[] {
  const allUsages = lineItems.map(lineItem => {
    return convertToChartCardPoint(lineItem, groupType, period)
  })

  const color = 'var(--data-green-color-emphasis, var(--data-green-color))'

  return [
    {
      color,
      data: allUsages,
      name: 'Usage',
      type: 'areaspline',
      lineWidth: 2,
    },
  ]
}

function getChartData(
  lineItems: UsageLineItem[],
  filters: Filters,
  otherUsage: OtherUsageLineItem[] = [],
): UsageChartData {
  const chartData: UsageChartData = {datasets: [], startDate: lineItems[0] ? Number(lineItems[0].usageAt) : 0}

  switch (filters.group?.type) {
    case UsageGrouping.ORG: {
      chartData.datasets = getChartDatasets(lineItems, filters.group?.type, 'org', filters.period)
      break
    }
    case UsageGrouping.REPO: {
      chartData.datasets = getChartDatasets(lineItems, filters.group?.type, 'repo', filters.period)
      break
    }
    case UsageGrouping.SKU: {
      chartData.datasets = getChartDatasets(lineItems, filters.group?.type, 'friendlySkuName', filters.period)
      break
    }
    case UsageGrouping.PRODUCT: {
      chartData.datasets = getChartDatasets(lineItems, filters.group?.type, 'product', filters.period)
      break
    }
    default: {
      // fallback to group all usage if no group type is provided
      chartData.datasets = getSummedDataset(lineItems, UsageGrouping.NONE, filters.period)
      break
    }
  }

  // Draw a line to represent all other usage if other usage line items exist
  if (otherUsage.length > 0) {
    chartData.datasets.push(buildOtherUsageDataset(otherUsage, filters.period))
  }

  const now = new Date()

  // Beginning value of the period
  let startValue: number
  // End value of the period
  let endValue: number
  // Function to assign the appropriate time value to a date object based on period
  let assignTime: (date: Date, desiredValue: number) => void
  // Function to get the appropriate time value from a date object
  let getTimeFromPeriod: (date: Date) => number
  // Shift the timestamp
  switch (filters.period?.type) {
    case UsagePeriod.THIS_HOUR:
      // from the first minute of the hour to the current minute
      startValue = 0
      endValue = now.getMinutes()
      assignTime = (date: Date, desiredMinute: number) => date.setMinutes(desiredMinute)
      getTimeFromPeriod = (date: Date) => date.getMinutes()
      break
    case UsagePeriod.TODAY:
      // from midnight to the current hour
      startValue = 0
      endValue = now.getUTCHours()
      assignTime = (date: Date, desiredHour: number) => {
        date.setUTCHours(desiredHour)
      }
      getTimeFromPeriod = (date: Date) => date.getUTCHours()
      break
    case UsagePeriod.THIS_YEAR: {
      // from January to the current month
      startValue = 0
      endValue = now.getUTCMonth()
      assignTime = (date: Date, desiredMonth: number) => date.setUTCMonth(desiredMonth)
      getTimeFromPeriod = (date: Date) => date.getUTCMonth()
      break
    }
    case UsagePeriod.LAST_YEAR: {
      // from January to December of the previous year
      startValue = 0
      endValue = 11
      assignTime = (date: Date, desiredMonth: number) => {
        date.setUTCFullYear(date.getUTCFullYear() - 1)
        date.setUTCMonth(desiredMonth)
      }
      getTimeFromPeriod = (date: Date) => date.getUTCMonth()
      break
    }
    case UsagePeriod.LAST_MONTH:
      // from the first to the last day of the previous month
      now.setUTCDate(0)
      startValue = 1
      endValue = now.getUTCDate()
      assignTime = (date: Date, desiredDate: number) => {
        date.setUTCMonth(date.getUTCMonth() - 1)
        date.setUTCDate(desiredDate)
      }
      getTimeFromPeriod = (date: Date) => date.getUTCDate()
      break
    case UsagePeriod.THIS_MONTH:
    default:
      // from the first day of the month to the current day
      startValue = 1
      endValue = now.getUTCDate()
      assignTime = (date: Date, desiredDate: number) => date.setUTCDate(desiredDate)
      getTimeFromPeriod = (date: Date) => date.getUTCDate()
      break
  }

  // Transform the datasets
  for (const dataset of chartData.datasets) {
    const useHighWatermark = dataset.product && Object.keys(HighWatermarkProducts).includes(dataset.product)
    const newUsageData = []

    if (dataset.data.length > 0) {
      let datasetIndex = 0
      // Iterate over the range the chart should be showing to build the full dataset
      for (const i of range(startValue, endValue + 1)) {
        const dataPoint = dataset.data[datasetIndex]
        const previousDataPoint = dataset.data[datasetIndex - 1]

        if (dataPoint) {
          const originalTimestamp = new Date(dataPoint.x)
          const newTimestamp = new Date()
          const usageTime = getTimeFromPeriod(originalTimestamp)

          if (i < usageTime) {
            // Fill in data either before the first data point or between data points
            assignTime(newTimestamp, i)
            newUsageData.push({
              x: formatDate(newTimestamp, filters.period),
              y: previousDataPoint ? formatMoneyAmount(previousDataPoint.y) : 0,
              custom: {
                grossAmount: 0,
                discountAmount: 0,
                totalAmount: 0,
                formattedDiscountAmount: 'N/A',
                formattedGrossAmount: 'N/A',
                formattedTotalAmount: 'N/A',
              },
            })
          } else if (i === usageTime) {
            if (useHighWatermark && previousDataPoint && dataPoint.y < previousDataPoint.y) {
              // Transform usage data point to reflect high watermarks
              dataPoint.y = formatMoneyAmount(previousDataPoint.y)
              dataPoint.custom.discountAmount = previousDataPoint.custom.discountAmount
              dataPoint.custom.totalAmount = previousDataPoint.custom.totalAmount
            } else if (previousDataPoint) {
              // Transform usage data point to reflect cumulative usage
              const addedMoneyAmount = formatMoneyAmount(dataPoint.y + previousDataPoint.y)
              dataPoint.y = addedMoneyAmount
            }

            assignTime(newTimestamp, i)
            dataPoint.x = formatDate(newTimestamp, filters.period)

            newUsageData.push(dataPoint)
            if (datasetIndex < dataset.data.length - 1) datasetIndex++
          } else {
            // Fill in data for the rest of the period after the last usage data point
            assignTime(newTimestamp, i)
            newUsageData.push({
              x: formatDate(newTimestamp, filters.period),
              y: formatMoneyAmount(dataPoint.y),
              custom: {
                grossAmount: 0,
                discountAmount: 0,
                totalAmount: 0,
                formattedDiscountAmount: 'N/A',
                formattedGrossAmount: 'N/A',
                formattedTotalAmount: 'N/A',
              },
            })
          }
        }
      }

      dataset.data = newUsageData
    }
  }

  // Sort the data to give render priority to lines in order from lowest to highest endpoints
  chartData.datasets.sort((a, b) => {
    return (last(a.data) as ChartPoint) >= (last(b.data) as ChartPoint) ? -1 : 1
  })

  return chartData
}

function formatMoneyAmount(amount: number | undefined) {
  // Format the number amount as a dollar amount with two decimal places
  return amount ? +amount.toFixed(2) : 0
}

function formatDate(date: string | Date, period: PeriodSelection | undefined) {
  // Set everything to the beginning of the time unit (month, day, hour, etc.)
  // This allows the chart to line up correctly with the x-axis
  switch (period?.type) {
    case UsagePeriod.THIS_HOUR:
      return new Date(date).setUTCSeconds(0, 0)
    case UsagePeriod.TODAY:
      return new Date(date).setUTCMinutes(0, 0, 0)
    case UsagePeriod.THIS_MONTH:
    case UsagePeriod.LAST_MONTH:
      return new Date(date).setUTCHours(0, 0, 0, 0)
    case UsagePeriod.THIS_YEAR:
    case UsagePeriod.LAST_YEAR:
      return new Date(new Date(date).setUTCDate(1)).setUTCHours(0, 0, 0, 0)
    default:
      return new Date(date).getTime()
  }
}

function formatGrossAmount(grossAmount: number) {
  return `${formatMoneyDisplay(grossAmount)}`
}

function formatTotalAmount(totalAmount: number | 'N/A') {
  return `${typeof totalAmount === 'number' ? formatMoneyDisplay(totalAmount) : 'N/A'}`
}

function formatDiscountAmount(discountAmount: number | 'N/A') {
  return `${typeof discountAmount === 'number' ? formatMoneyDisplay(discountAmount) : 'N/A'}`
}

interface Props {
  usage: UsageLineItem[]
  otherUsage?: OtherUsageLineItem[]
  filters: Filters
}

function useUsageChartDetails({usage, otherUsage, filters}: Props) {
  return React.useMemo(
    () => {
      const period = filters.period?.type ?? UsagePeriod.DEFAULT

      const groupedData = groupLineItems(usage, filters.group?.type ?? DEFAULT_GROUP_TYPE, period)
      const sortedData = groupedData.sort(sortByUsageAtDesc)
      const chartData = getChartData(sortedData, filters, otherUsage)

      return {data: chartData}
    },
    /*
    Adding filters or its properties as dependencies for this hook can cause errors in the usage chart.
    See https://github.com/github/gitcoin/issues/13256. Updating any filter will trigger the data to update.
    If we try to recalculate the chart details before the data is updated and defined, we will get an error.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [usage],
  )
}

export default useUsageChartDetails
