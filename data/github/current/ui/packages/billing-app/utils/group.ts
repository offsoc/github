import {isProductUsageLineItem, isRepoUsageLineItem} from './types'

import {UsageGrouping} from '../enums'
import type {UsageLineItem} from '../types/usage'
import type {UsagePeriod} from '../enums'
import {formatUsageDateForPeriod} from './date'

export const groupLineItems = (
  lineItems: UsageLineItem[],
  groupBy: UsageGrouping,
  period?: UsagePeriod,
): UsageLineItem[] => {
  const groupedData: Map<string, UsageLineItem> = new Map()

  for (const item of lineItems) {
    let date
    if (period) date = formatUsageDateForPeriod(item.usageAt, period)

    // We want to create a unique key to group data by given the group type. If group type is all,
    // we want to use date as the key to group line items of the time period increment. If it is product/sku,
    // we want to group products/SKUs for the time period increment.
    let groupingKey = date ? `${date}-` : ''

    if (isRepoUsageLineItem(item)) {
      if (groupBy === UsageGrouping.ORG) groupingKey += `${item.org.name}`
      else if (groupBy === UsageGrouping.REPO) groupingKey += `${item.org.name}-${item.repo.name}`
    } else if (isProductUsageLineItem(item)) {
      if (groupBy === UsageGrouping.PRODUCT) groupingKey += `${item.product}`
      else if (groupBy === UsageGrouping.SKU) groupingKey += `${item.product}-${item.sku}`
    }

    // we already have a value for the grouping, update the grouped quantity instead
    const element = groupedData.get(groupingKey)
    if (element) {
      element.billedAmount += item.billedAmount
      element.discountAmount =
        typeof element.discountAmount === 'number' || typeof item.totalAmount === 'number'
          ? (element.discountAmount ?? 0) + (item.discountAmount ?? 0)
          : undefined
      element.quantity += item.quantity
      element.fullQuantity += item.fullQuantity
      element.totalAmount =
        typeof element.totalAmount === 'number' || typeof item.totalAmount === 'number'
          ? (element.totalAmount ?? 0) + (item.totalAmount ?? 0)
          : undefined
      groupedData.set(groupingKey, element)
    } else {
      groupedData.set(groupingKey, {...item})
    }
  }

  return Array.from(groupedData.values())
}

export function sortByUsageAtDesc(l1: UsageLineItem, l2: UsageLineItem): number {
  return new Date(l1.usageAt) >= new Date(l2.usageAt) ? 1 : -1
}
