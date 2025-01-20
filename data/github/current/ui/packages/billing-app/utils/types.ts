import type {ProductUsageLineItem, RepoUsageLineItem, UsageLineItem} from '../types/usage'

export const isProductUsageLineItem = (lineItem: UsageLineItem): lineItem is ProductUsageLineItem => {
  return (lineItem as ProductUsageLineItem).sku !== undefined
}

export const isRepoUsageLineItem = (lineItem: UsageLineItem): lineItem is RepoUsageLineItem => {
  return (lineItem as RepoUsageLineItem).org !== undefined
}
