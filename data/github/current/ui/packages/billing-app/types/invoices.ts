export interface GenerateInvoiceRequest {
  customerId: string
  month: number
  year: number
}

export interface UsageTotal {
  gross: number
  net: number
  discount: number
  quantity: number
}

export interface ProductTotals {
  [name: string]: ProductTotal
}

export interface SkuTotals {
  [sku: string]: SkuTotal
}

export interface SkuTotal {
  sku: string
  usageTotal: UsageTotal
  billingItems: BillingItem[]
}

export interface BillingItem {
  usageEntityId: string
  sku: string
  product: string
  quantity: number
  billedAmount: number
  appliedCostPerQuantity: number
  usageAt: number
  friendlySkuName: string
  repoId: number
  orgId: number
}

export interface ProductTotal {
  product: string
  usageTotal: UsageTotal
  SkuTotals: SkuTotals
}

export interface Invoice {
  customerId: string
  year: number
  month: number
  usageTotal: UsageTotal
  ProductTotals: ProductTotals
}
