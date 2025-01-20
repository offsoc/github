import {isProductUsageLineItem, isRepoUsageLineItem} from './types'

import type {Budget} from '../types/budgets'
import {BudgetType} from '../enums/budgets'
import {HighWatermarkProducts} from '../constants'
import {UsageGrouping} from '../enums'
import type {UsageLineItem} from '../types/usage'
import {formatMoneyDisplay} from './money'

export const findMatchingBudget = (row: UsageLineItem, budgets: Budget[], groupType: UsageGrouping): Budget | void => {
  const budget = budgets.find(b => {
    switch (groupType) {
      case UsageGrouping.ORG:
        // TODO: Verify org target type is correct
        return b.targetType === BudgetType.ORG && isRepoUsageLineItem(row) && row.org.name === b.targetName
      case UsageGrouping.REPO:
        return (
          b.targetType === BudgetType.REPO &&
          isRepoUsageLineItem(row) &&
          b.targetName === `${row.org.name}/${row.repo.name}`
        )
    }
  })

  return budget
}

export const formatQuantityDisplay = (lineItem: UsageLineItem, digits = 2): string => {
  const value = getQuantity(lineItem)
  if (!isProductUsageLineItem(lineItem)) return value.toString()

  let unit = ''
  switch (lineItem.unitType) {
    case 'Seconds':
      unit = ' sec'
      break
    case 'Minutes':
      unit = ' min'
      break
    case 'Hours':
      unit = ' hr'
      break
    case 'Bytes':
      unit = ' B'
      break
    case 'Megabytes':
      unit = ' MB'
      break
    case 'Gigabytes':
      unit = ' GB'
      break
    case 'ByteHours':
      unit = ' B/h'
      break
    case 'MegabyteHours':
      unit = ' MB/h'
      break
    case 'GigabyteHours':
      unit = ' GB/h'
      break
    case 'GigabyteMonths':
      unit = ' GB/month'
      break
    case 'UserMonths':
      if (value === 1) unit = ' Seat'
      else unit = ' Seats'
      break
    default:
      unit = ''
      break
  }
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
  })

  return formatter.format(value) + unit
}

const getQuantity = (usage: UsageLineItem): number => {
  if (isProductUsageLineItem(usage) && usage.product in HighWatermarkProducts) {
    return usage.fullQuantity > 0 ? usage.fullQuantity : usage.quantity
  } else {
    return usage.quantity
  }
}

export const getBilledAmount = (totalAmount: number | null | undefined, groupType: UsageGrouping) => {
  if (groupType === UsageGrouping.REPO || groupType === UsageGrouping.ORG) {
    return 'N/A'
  }
  if (typeof totalAmount === 'number') {
    return formatMoneyDisplay(totalAmount)
  } else return 'N/A'
}
