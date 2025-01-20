import type {Products} from '../constants'
import type {UsageGrouping, UsagePeriod} from '../enums'

export interface Filters {
  customer: CustomerSelection
  group: GroupSelection | undefined
  period: PeriodSelection | undefined
  product: Products | undefined
  searchQuery: string
}

export interface CustomerSelection {
  id: string
  displayText: string
}

export interface GroupSelection {
  type: UsageGrouping
  displayText: string
}

export interface PeriodSelection {
  type: UsagePeriod
  displayText: string
}

export interface Usage {
  product: string
  sku: string
  quantity: number
  fullQuantity: number
  billableAmount: number
  unitType: string
}

export interface UsageLineItem {
  appliedCostPerQuantity: number
  billedAmount: number
  discountAmount?: number
  quantity: number
  fullQuantity: number
  usageAt: string
  totalAmount?: number
}

export interface ProductUsageLineItem extends UsageLineItem {
  friendlySkuName: string
  product: string
  sku: string
  unitType: string
}

export interface DiscountUsageLineItem {
  discountAmount: number
  quantity: number
  product: string
  sku: string
  usageAt: string
  unitType: string
}

export interface NetUsageLineItem extends UsageLineItem {
  appliedCostPerQuantity: number
  product: string
  sku: string
  friendlySkuName: string
  quantity: number
  fullQuantity: number
  grossAmount: number
  discountAmount: number
  netAmount: number
  usageAt: string
  unitType: string
}

export interface RepoUsageLineItem extends UsageLineItem {
  product: string
  repo: {
    name: string
  }
  org: {
    name: string
    avatarSrc: string
  }
}

export interface OtherUsageLineItem {
  billedAmount: number
  usageAt: string
}

export type UsageCardVariant = 'org' | 'repo'

export interface UsageReportSelection {
  type: number
  displayText: string
  dateText: string
}

export interface UsageReportRequest {
  period: number
}

export interface UsageChartDataPoint {
  x: number
  y: number
  custom: {
    discountAmount?: number | 'N/A'
    grossAmount: number
    totalAmount?: number | 'N/A'
  }
}

export interface UsageChartData {
  data: UsageChartDataPoint[]
}
