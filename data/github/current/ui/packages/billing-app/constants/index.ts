export * from './products'

export const GROUP_BY_NONE_TYPE = 0
export const GROUP_BY_PRODUCT_TYPE = 1
export const GROUP_BY_SKU_TYPE = 2
export const GROUP_BY_ORG_TYPE = 3
export const GROUP_BY_REPO_TYPE = 4
export const GROUP_BY_COSTCENTER_TYPE = 5
export const DEFAULT_GROUP_TYPE = GROUP_BY_NONE_TYPE

export const BUDGET_PRODUCT_ACTIONS = 'GitHub Actions'

export const BUDGET_SCOPE_CUSTOMER = 'CustomerResource'
export const BUDGET_SCOPE_ENTERPRISE = 'Enterprise'
export const BUDGET_SCOPE_ORGANIZATION = 'Org'
export const BUDGET_SCOPE_REPOSITORY = 'Repo'
export const BUDGET_SCOPE_COST_CENTER = 'CostCenterResource'

// convert these to strings
export const PRICING_TARGET_TYPE_NONE = 0
export const PRICING_TARGET_TYPE_PRODUCT = 1
export const PRICING_TARGET_TYPE_SKU = 2

type budgetMaps = {
  [key: string]: number
}

export const BUDGET_PRODUCTS: budgetMaps = {
  [BUDGET_PRODUCT_ACTIONS]: 1,
}

export const ENTERPRISE_OWNER = 'owner'
export const BILLING_MANAGER = 'billing_manager'
export const ENTERPRISE_ORG_OWNER = 'enterprise_org_owner'

export const COLORS = ['green', 'blue', 'purple', 'red', 'brown']

export const ENTERPRISE_TRIAL_PLAN = 'enterprise_trial'

export const ERRORS = {
  QUERY_USAGE_ERROR: 'Unable to query usage',
  QUERY_BUDGETS_ERROR: 'Unable to query budgets',
  QUERY_DISCOUNTS_ERROR: 'Unable to query discounts',
  QUERY_INVOICES_ERROR: 'Unable to query invoices',
  QUERY_AZURE_EMISSIONS_ERROR: 'Unable to query azure emissions',
  QUERY_PRICINGS_ERROR: 'Unable to query pricings',
  CREATE_PRODUCT_ERROR: 'There was an error adding the product',
  UPDATE_PRODUCT_ERROR: 'There was an error updating the product',
  PRODUCT_ENVIRONMENT_ERROR: 'Please confirm you want to change this environment.',
  REQUIRED_FIELD_ERROR: 'Please complete required fields to continue.',
  CREATE_SKU_PRICING_ERROR: 'There was a problem adding the SKU pricing',
  UPDATE_SKU_PRICING_ERROR: 'There was a problem updating the SKU pricing',
}

export const URLS = {
  STAFFTOOLS_PRODUCTS: '/stafftools/billing/products',
  STAFFTOOLS_NEW_PRODUCT: '/stafftools/billing/products/new',
  STAFFTOOLS_BILLING_JOBS: '/stafftools/billing/billing_jobs',
  STAFFTOOLS_BUSINESS_ORGANIZATION_BILLNG_JOB: '/stafftools/billing/billing_jobs/business_organization_billing_job',
}

export const USAGE_REPORT_HOURLY_PERIOD = 0
export const USAGE_REPORT_LEGACY_REPORT = 5

// Static UUID used to identify the public repo discount state.
// https://github.com/github/billing-platform/blob/main/docs/discounts/discounts.md#public-repo-discounts
export const PUBLIC_REPO_DISCOUNT_UUID = '9cdf0dca-1b19-11ee-be56-0242ac120002'
