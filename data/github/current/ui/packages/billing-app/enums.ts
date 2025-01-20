import {
  GROUP_BY_COSTCENTER_TYPE,
  GROUP_BY_NONE_TYPE,
  GROUP_BY_ORG_TYPE,
  GROUP_BY_PRODUCT_TYPE,
  GROUP_BY_REPO_TYPE,
  GROUP_BY_SKU_TYPE,
} from './constants'

export enum BillingTarget {
  NoBillingTarget = 0,
  Zuora,
  Azure,
}

export enum CustomerType {
  Business = 'Business',
  Organization = 'Organization',
  User = 'User',
}

export enum RequestState {
  INIT = 'init',
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
}

export enum UsageGrouping {
  NONE = GROUP_BY_NONE_TYPE,
  ORG = GROUP_BY_ORG_TYPE,
  PRODUCT = GROUP_BY_PRODUCT_TYPE,
  REPO = GROUP_BY_REPO_TYPE,
  SKU = GROUP_BY_SKU_TYPE,
  COSTCENTER = GROUP_BY_COSTCENTER_TYPE,
}

export enum UsagePeriod {
  THIS_HOUR = 1,
  TODAY = 2,
  THIS_MONTH = 3,
  THIS_YEAR = 4,
  LAST_MONTH = 5,
  LAST_YEAR = 6,
  DEFAULT = THIS_MONTH,
}

export enum UsageCardVariant {
  REPO = 'repo',
  ORG = 'org',
}

export enum DiscountTarget {
  NoDiscountTarget = 'NoDiscountTarget',
  SKU = 'SkuDiscount',
  Product = 'ProductDiscount',
  Repository = 'RepoDiscount',
  Organization = 'OrgDiscount',
  Enterprise = 'EnterpriseDiscount',
}

export enum DiscountType {
  NoDiscountType = 'none',
  FixedAmount = 'fixed-amount',
  Percentage = 'percentage',
}

export enum DiscountTargetType {
  ENTERPRISE = 'enterprise',
  ORGANIZATION = 'org',
  REPOSITORY = 'repo',
  SKU_ACTIONS_MINUTES = 'actions_minutes',
  SKU_ACTIONS_STORAGE = 'actions_storage',
  SKU_CFB_SEATS = 'copilot',
  SKU_GHAS_SEATS = 'ghas_seats',
  SKU_GHEC_SEATS = 'ghec_seats',
  SKU_LFS_BANDWIDTH = 'lfs_bandwidth',
  SKU_LFS_STORAGE = 'lfs_storage',
  SKU_PACKAGES_BANDWIDTH = 'packages_bandwidth',
  SKU_PACKAGES_STORAGE = 'packages_storage',
  PUBLIC_REPO = 'public_repo',
  UNSUPPORTED = 'unsupported',
}
