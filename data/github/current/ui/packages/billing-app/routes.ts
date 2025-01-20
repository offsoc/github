import {createBaseRoute} from './routes/utils'

/**
 * Billing Base Routes
 * These should not be used as standalone routes. They are extended by the enterprise, org, and user routes.
 */
export const {baseRoute: BASE_ROUTE} = createBaseRoute('')

export const BILLING_BASE_ROUTE = BASE_ROUTE.childRoute('/billing')
export const PEOPLE_BASE_ROUTE = BASE_ROUTE.childRoute('/people')
export const SETTINGS_BASE_ROUTE = BASE_ROUTE.childRoute('/settings')
export const ENTERPRISE_LICENSING_BASE_ROUTE = BASE_ROUTE.childRoute('/enterprise_licensing')

// Usage
export const OVERVIEW_ROUTE = BILLING_BASE_ROUTE
export const USAGE_ROUTE = BILLING_BASE_ROUTE.childRoute('/usage')
export const NET_USAGE_ROUTE = BILLING_BASE_ROUTE.childRoute('/net_usage')
export const REPO_USAGE_ROUTE = USAGE_ROUTE.childRoute('/repo')
export const TOTAL_USAGE_ROUTE = USAGE_ROUTE.childRoute('/total')
export const USAGE_CHART_DATA_ROUTE = BILLING_BASE_ROUTE.childRoute('/usage_chart')
export const USAGE_TABLE_DATA_ROUTE = BILLING_BASE_ROUTE.childRoute('/usage_table')

// Budgets
export const BUDGETS_ROUTE = BILLING_BASE_ROUTE.childRoute('/budgets')
export const NEW_BUDGET_ROUTE = BUDGETS_ROUTE.childRoute('/new')
export const EDIT_BUDGET_ROUTE = BUDGETS_ROUTE.childRoute('/:budgetUUID/edit')
export const UPSERT_BUDGET_ROUTE = BUDGETS_ROUTE.childRoute('/:budgetUUID')

// Cost Centers
export const COST_CENTERS_ROUTE = BILLING_BASE_ROUTE.childRoute('/cost_centers')
export const VIEW_COST_CENTER_ROUTE = COST_CENTERS_ROUTE.childRoute('/:costCenterUUID')
export const NEW_COST_CENTER_ROUTE = COST_CENTERS_ROUTE.childRoute('/new')
export const CREATE_COST_CENTER_ROUTE = COST_CENTERS_ROUTE
export const EDIT_COST_CENTER_ROUTE = COST_CENTERS_ROUTE.childRoute('/:costCenterUUID/edit')
export const UPSERT_COST_CENTER_ROUTE = VIEW_COST_CENTER_ROUTE
export const DELETE_COST_CENTER_ROUTE = VIEW_COST_CENTER_ROUTE

// Discounts
export const DISCOUNTS_ROUTE = BILLING_BASE_ROUTE.childRoute('/discounts')

// Invoices
export const INVOICES_ROUTE = BILLING_BASE_ROUTE.childRoute('/invoices')

// Azure Emissions
export const AZURE_EMISSIONS_ROUTE = BILLING_BASE_ROUTE.childRoute('/azure_emissions')

// Usage report routes
export const USAGE_REPORT_ROUTE = BILLING_BASE_ROUTE.childRoute('/usage_report')

// Billing settings
export const BILLING_SETTINGS_ROUTE = SETTINGS_BASE_ROUTE.childRoute('/billing')
export const ONE_TIME_PAYMENT_ROUTE = BILLING_SETTINGS_ROUTE.childRoute('/one_time_payment')

// Payment history
export const PAYMENT_HISTORY_ROUTE = BILLING_BASE_ROUTE.childRoute('/payment_history')

// Past invoices
export const PAST_INVOICES_ROUTE = BILLING_BASE_ROUTE.childRoute('/past_invoices')
export const SHOW_INVOICE_ROUTE = BILLING_SETTINGS_ROUTE.childRoute('/invoices/:invoiceNumber')
export const PAY_INVOICE_ROUTE = BILLING_SETTINGS_ROUTE.childRoute('/invoices/:invoiceNumber/payment_method')

/**
 * Enterprise Routes
 */
export const {baseRoute: ENTERPRISE_BASE_ROUTE} = createBaseRoute('/enterprises/:business')

// Enterprise Usage
export const ENTERPRISE_OVERVIEW_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(BILLING_BASE_ROUTE.fullPath)
export const ENTERPRISE_USAGE_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(USAGE_ROUTE.fullPath)
export const ENTERPRISE_REPO_USAGE_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(REPO_USAGE_ROUTE.fullPath)
export const ENTERPRISE_TOTAL_USAGE_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(TOTAL_USAGE_ROUTE.fullPath)

// Enterprise Budgets
export const ENTERPRISE_BUDGETS_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(BUDGETS_ROUTE.fullPath)
export const ENTERPRISE_NEW_BUDGET_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(NEW_BUDGET_ROUTE.fullPath)
export const ENTERPRISE_EDIT_BUDGET_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(EDIT_BUDGET_ROUTE.fullPath)
export const ENTERPRISE_UPSERT_BUDGET_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(UPSERT_BUDGET_ROUTE.fullPath)

// Enterprise Cost Centers
export const ENTERPRISE_COST_CENTERS_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(COST_CENTERS_ROUTE.fullPath)
export const ENTERPRISE_VIEW_COST_CENTER_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(VIEW_COST_CENTER_ROUTE.fullPath)
export const ENTERPRISE_NEW_COST_CENTER_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(NEW_COST_CENTER_ROUTE.fullPath)
export const ENTERPRISE_CREATE_COST_CENTER_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(CREATE_COST_CENTER_ROUTE.fullPath)
export const ENTERPRISE_EDIT_COST_CENTER_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(EDIT_COST_CENTER_ROUTE.fullPath)
export const ENTERPRISE_UPSERT_COST_CENTER_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(UPSERT_COST_CENTER_ROUTE.fullPath)
export const ENTERPRISE_DELETE_COST_CENTER_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(DELETE_COST_CENTER_ROUTE.fullPath)

// People
export const ENTERPRISE_PEOPLE_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(PEOPLE_BASE_ROUTE.fullPath)

// Enterprise Usage Report
export const ENTERPRISE_USAGE_REPORT_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(USAGE_REPORT_ROUTE.fullPath)

// One time payment routes for customers with auto pay disabled
export const ENTERPRISE_ONE_TIME_PAYMENT_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(ONE_TIME_PAYMENT_ROUTE.fullPath)

// Enterprise Licenses
export const ENTERPRISE_LICENSING_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(ENTERPRISE_LICENSING_BASE_ROUTE.fullPath)

// Enterprise payment history
export const ENTERPRISE_PAYMENT_HISTORY_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(PAYMENT_HISTORY_ROUTE.fullPath)

// Enterprise show invoices route
export const ENTERPRISE_SHOW_INVOICE_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(SHOW_INVOICE_ROUTE.fullPath)

// Enterprise pay invoice route
export const ENTERPRISE_PAY_INVOICE_ROUTE = ENTERPRISE_BASE_ROUTE.childRoute(PAY_INVOICE_ROUTE.fullPath)

/**
 * Organization Routes
 */
export const {baseRoute: ORGANIZATION_BASE_ROUTE} = createBaseRoute('/organizations/:organization/settings')

// Organization Usage
export const ORGANIZATION_OVERVIEW_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(BILLING_BASE_ROUTE.fullPath)
export const ORGANIZATION_USAGE_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(USAGE_ROUTE.fullPath)
export const ORGANIZATION_REPO_USAGE_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(REPO_USAGE_ROUTE.fullPath)
export const ORGANIZATION_TOTAL_USAGE_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(TOTAL_USAGE_ROUTE.fullPath)

// Organization Budgets
export const ORGANIZATION_BUDGETS_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(BUDGETS_ROUTE.fullPath)
export const ORGANIZATION_NEW_BUDGET_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(NEW_BUDGET_ROUTE.fullPath)
export const ORGANIZATION_EDIT_BUDGET_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(EDIT_BUDGET_ROUTE.fullPath)
export const ORGANIZATION_UPSERT_BUDGET_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(UPSERT_BUDGET_ROUTE.fullPath)

// Organization Cost Centers
export const ORGANIZATION_COST_CENTERS_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(COST_CENTERS_ROUTE.fullPath)
export const ORGANIZATION_VIEW_COST_CENTER_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(VIEW_COST_CENTER_ROUTE.fullPath)
export const ORGANIZATION_NEW_COST_CENTER_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(NEW_COST_CENTER_ROUTE.fullPath)
export const ORGANIZATION_CREATE_COST_CENTER_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(
  CREATE_COST_CENTER_ROUTE.fullPath,
)
export const ORGANIZATION_EDIT_COST_CENTER_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(EDIT_COST_CENTER_ROUTE.fullPath)
export const ORGANIZATION_UPSERT_COST_CENTER_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(
  UPSERT_COST_CENTER_ROUTE.fullPath,
)
export const ORGANIZATION_DELETE_COST_CENTER_ROUTE = ORGANIZATION_BASE_ROUTE.childRoute(
  DELETE_COST_CENTER_ROUTE.fullPath,
)

/**
 * User Routes
 */
export const {baseRoute: USER_BASE_ROUTE} = createBaseRoute('/settings')

// User Usage
export const USER_OVERVIEW_ROUTE = USER_BASE_ROUTE.childRoute(BILLING_BASE_ROUTE.fullPath)
export const USER_USAGE_ROUTE = USER_BASE_ROUTE.childRoute(USAGE_ROUTE.fullPath)
export const USER_REPO_USAGE_ROUTE = USER_BASE_ROUTE.childRoute(REPO_USAGE_ROUTE.fullPath)
export const USER_TOTAL_USAGE_ROUTE = USER_BASE_ROUTE.childRoute(TOTAL_USAGE_ROUTE.fullPath)

// User Budgets
export const USER_BUDGETS_ROUTE = USER_BASE_ROUTE.childRoute(BUDGETS_ROUTE.fullPath)
export const USER_NEW_BUDGET_ROUTE = USER_BASE_ROUTE.childRoute(NEW_BUDGET_ROUTE.fullPath)
export const USER_EDIT_BUDGET_ROUTE = USER_BASE_ROUTE.childRoute(EDIT_BUDGET_ROUTE.fullPath)
export const USER_UPSERT_BUDGET_ROUTE = USER_BASE_ROUTE.childRoute(UPSERT_BUDGET_ROUTE.fullPath)

// User Cost Centers
export const USER_COST_CENTERS_ROUTE = USER_BASE_ROUTE.childRoute(COST_CENTERS_ROUTE.fullPath)
export const USER_VIEW_COST_CENTER_ROUTE = USER_BASE_ROUTE.childRoute(VIEW_COST_CENTER_ROUTE.fullPath)
export const USER_NEW_COST_CENTER_ROUTE = USER_BASE_ROUTE.childRoute(NEW_COST_CENTER_ROUTE.fullPath)
export const USER_CREATE_COST_CENTER_ROUTE = USER_BASE_ROUTE.childRoute(CREATE_COST_CENTER_ROUTE.fullPath)
export const USER_EDIT_COST_CENTER_ROUTE = USER_BASE_ROUTE.childRoute(EDIT_COST_CENTER_ROUTE.fullPath)
export const USER_UPSERT_COST_CENTER_ROUTE = USER_BASE_ROUTE.childRoute(UPSERT_COST_CENTER_ROUTE.fullPath)
export const USER_DELETE_COST_CENTER_ROUTE = USER_BASE_ROUTE.childRoute(DELETE_COST_CENTER_ROUTE.fullPath)

/**
 * Stafftools Enterprise Routes
 */
export const {baseRoute: STAFFTOOLS_ENTERPRISE_BASE_ROUTE} = createBaseRoute('/stafftools/enterprises/:business')

// Stafftools

// Stafftools overage
export const STAFFTOOLS_ENTERPRISE_OVERVIEW_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  BILLING_BASE_ROUTE.childRoute('/overview').fullPath,
)

// Stafftools Usage
export const STAFFTOOLS_ENTERPRISE_USAGE_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(USAGE_ROUTE.fullPath)
export const STAFFTOOLS_ENTERPRISE_REPO_USAGE_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  REPO_USAGE_ROUTE.fullPath,
)
export const STAFFTOOLS_ENTERPRISE_NET_USAGE_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  NET_USAGE_ROUTE.fullPath,
)

export const STAFFTOOLS_ENTERPRISE_USAGE_TABLE_DATA_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  USAGE_TABLE_DATA_ROUTE.fullPath,
)

// Stafftools Discounts
export const STAFFTOOLS_ENTERPRISE_DISCOUNTS_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  DISCOUNTS_ROUTE.fullPath,
)

// Stafftools Invoices
export const STAFFTOOLS_ENTERPRISE_INVOICES_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(INVOICES_ROUTE.fullPath)

// Stafftools cost centers
export const STAFFTOOLS_ENTERPRISE_COST_CENTERS_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  COST_CENTERS_ROUTE.fullPath,
)
export const STAFFTOOLS_ENTERPRISE_VIEW_COST_CENTER_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  VIEW_COST_CENTER_ROUTE.fullPath,
)

// Stafftools Budgets
export const STAFFTOOLS_ENTERPRISE_BUDGETS_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(BUDGETS_ROUTE.fullPath)
export const STAFFTOOLS_ENTERPRISE_EDIT_BUDGET_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  EDIT_BUDGET_ROUTE.fullPath,
)
export const STAFFTOOLS_ENTERPRISE_UPSERT_BUDGET_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  UPSERT_BUDGET_ROUTE.fullPath,
)

// Stafftools Azure Emissions
export const STAFFTOOLS_ENTERPRISE_AZURE_EMISSIONS_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  AZURE_EMISSIONS_ROUTE.fullPath,
)

// Stafftools Usage Report
export const STAFFTOOLS_ENTERPRISE_USAGE_REPORT_ROUTE = STAFFTOOLS_ENTERPRISE_BASE_ROUTE.childRoute(
  USAGE_REPORT_ROUTE.fullPath,
)

/**
 * Stafftools User Routes
 */
export const {baseRoute: STAFFTOOLS_USER_BASE_ROUTE} = createBaseRoute('/stafftools/users/:user')

/**
 * Stafftools Generic Billing Routes
 */
export const {baseRoute: STAFFTOOLS_BILLING_BASE_ROUTE} = createBaseRoute('/stafftools/billing')

export const STAFFTOOLS_BILLING_JOBS_ROUTE = STAFFTOOLS_BILLING_BASE_ROUTE.childRoute('/billing_jobs')
export const STAFFTOOLS_BUSINESS_ORGANIZATION_BILLING_JOBS_ROUTE = STAFFTOOLS_BILLING_JOBS_ROUTE.childRoute(
  '/business_organization_billing_job',
)

// Products
export const STAFFTOOLS_PRODUCTS_ROUTE = STAFFTOOLS_BILLING_BASE_ROUTE.childRoute('/products')
export const STAFFTOOLS_NEW_PRODUCT_ROUTE = STAFFTOOLS_PRODUCTS_ROUTE.childRoute('/new')
export const STAFFTOOLS_PRODUCT_SHOW_ROUTE = STAFFTOOLS_PRODUCTS_ROUTE.childRoute('/:product_id')
export const STAFFTOOLS_EDIT_PRODUCT_ROUTE = STAFFTOOLS_PRODUCT_SHOW_ROUTE.childRoute('/edit')

export const STAFFTOOLS_PRODUCT_PRICINGS_ROUTE = STAFFTOOLS_PRODUCT_SHOW_ROUTE.childRoute('/pricings')
export const STAFFTOOLS_PRODUCT_NEW_PRICING_ROUTE = STAFFTOOLS_PRODUCT_PRICINGS_ROUTE.childRoute('/new')
export const STAFFTOOLS_PRODUCT_PRICINGS_SHOW_ROUTE = STAFFTOOLS_PRODUCT_PRICINGS_ROUTE.childRoute('/:pricing_id')
export const STAFFTOOLS_PRODUCT_EDIT_PRICING_ROUTE = STAFFTOOLS_PRODUCT_PRICINGS_SHOW_ROUTE.childRoute('/edit')

// Pricings
export const STAFFTOOLS_PRICINGS_ROUTE = STAFFTOOLS_BILLING_BASE_ROUTE.childRoute('/pricings')

/**
 * Base Route Map
 * When creating a new base route, make sure to add it to the map of routes below
 */
export const BASE_ROUTES = {
  ENTERPRISE_BASE_ROUTE,
  ORGANIZATION_BASE_ROUTE,
  USER_BASE_ROUTE,
  STAFFTOOLS_ENTERPRISE_BASE_ROUTE,
  STAFFTOOLS_USER_BASE_ROUTE,
} as const

/**
 * Route Map
 * When creating a new route, make sure to add it to the map of routes below
 */
export const ROUTES_MAP = {
  /**
   * Enterprise Routes
   */
  // Usage
  ENTERPRISE_OVERVIEW_ROUTE,
  ENTERPRISE_USAGE_ROUTE,
  ENTERPRISE_REPO_USAGE_ROUTE,
  ENTERPRISE_TOTAL_USAGE_ROUTE,
  // Budgets
  ENTERPRISE_BUDGETS_ROUTE,
  ENTERPRISE_NEW_BUDGET_ROUTE,
  ENTERPRISE_EDIT_BUDGET_ROUTE,
  ENTERPRISE_UPSERT_BUDGET_ROUTE,
  // Cost Centers
  ENTERPRISE_COST_CENTERS_ROUTE,
  ENTERPRISE_VIEW_COST_CENTER_ROUTE,
  ENTERPRISE_NEW_COST_CENTER_ROUTE,
  ENTERPRISE_CREATE_COST_CENTER_ROUTE,
  ENTERPRISE_EDIT_COST_CENTER_ROUTE,
  ENTERPRISE_UPSERT_COST_CENTER_ROUTE,
  ENTERPRISE_DELETE_COST_CENTER_ROUTE,
  // People
  ENTERPRISE_PEOPLE_ROUTE,
  // Usage Report
  ENTERPRISE_USAGE_REPORT_ROUTE,
  // One time payment route (e.g. india RBI payments)
  ENTERPRISE_ONE_TIME_PAYMENT_ROUTE,
  // Enterprise licenses
  ENTERPRISE_LICENSING_ROUTE,
  // Enterprise payment history
  ENTERPRISE_PAYMENT_HISTORY_ROUTE,
  // Enterprise show invoices route
  ENTERPRISE_SHOW_INVOICE_ROUTE,
  // Enterprise pay invoice route
  ENTERPRISE_PAY_INVOICE_ROUTE,

  /**
   * Organization Routes
   */
  // Usage
  ORGANIZATION_OVERVIEW_ROUTE,
  ORGANIZATION_USAGE_ROUTE,
  ORGANIZATION_REPO_USAGE_ROUTE,
  ORGANIZATION_TOTAL_USAGE_ROUTE,
  // Budgets
  ORGANIZATION_BUDGETS_ROUTE,
  ORGANIZATION_NEW_BUDGET_ROUTE,
  ORGANIZATION_EDIT_BUDGET_ROUTE,
  ORGANIZATION_UPSERT_BUDGET_ROUTE,
  // Cost Centers
  ORGANIZATION_COST_CENTERS_ROUTE,
  ORGANIZATION_VIEW_COST_CENTER_ROUTE,
  ORGANIZATION_NEW_COST_CENTER_ROUTE,
  ORGANIZATION_CREATE_COST_CENTER_ROUTE,
  ORGANIZATION_EDIT_COST_CENTER_ROUTE,
  ORGANIZATION_UPSERT_COST_CENTER_ROUTE,
  ORGANIZATION_DELETE_COST_CENTER_ROUTE,

  /**
   * User Routes
   */
  // Usage
  USER_OVERVIEW_ROUTE,
  USER_USAGE_ROUTE,
  USER_REPO_USAGE_ROUTE,
  USER_TOTAL_USAGE_ROUTE,
  // Budgets
  USER_BUDGETS_ROUTE,
  USER_NEW_BUDGET_ROUTE,
  USER_EDIT_BUDGET_ROUTE,
  USER_UPSERT_BUDGET_ROUTE,
  // Cost Centers
  USER_COST_CENTERS_ROUTE,
  USER_VIEW_COST_CENTER_ROUTE,
  USER_NEW_COST_CENTER_ROUTE,
  USER_CREATE_COST_CENTER_ROUTE,
  USER_EDIT_COST_CENTER_ROUTE,
  USER_UPSERT_COST_CENTER_ROUTE,
  USER_DELETE_COST_CENTER_ROUTE,

  /**
   * Stafftools Routes
   */
  // Overview
  STAFFTOOLS_ENTERPRISE_OVERVIEW_ROUTE,
  // Usage
  STAFFTOOLS_ENTERPRISE_USAGE_ROUTE,
  STAFFTOOLS_ENTERPRISE_REPO_USAGE_ROUTE,
  STAFFTOOLS_ENTERPRISE_NET_USAGE_ROUTE,
  STAFFTOOLS_ENTERPRISE_USAGE_TABLE_DATA_ROUTE,
  // Cost Centers
  STAFFTOOLS_ENTERPRISE_COST_CENTERS_ROUTE,
  STAFFTOOLS_ENTERPRISE_VIEW_COST_CENTER_ROUTE,
  // Budgets
  STAFFTOOLS_ENTERPRISE_BUDGETS_ROUTE,
  STAFFTOOLS_ENTERPRISE_EDIT_BUDGET_ROUTE,
  STAFFTOOLS_ENTERPRISE_UPSERT_BUDGET_ROUTE,
  // Discounts
  STAFFTOOLS_ENTERPRISE_DISCOUNTS_ROUTE,
  // Invoices
  STAFFTOOLS_ENTERPRISE_INVOICES_ROUTE,
  // Jobs
  STAFFTOOLS_BILLING_JOBS_ROUTE,
  STAFFTOOLS_BUSINESS_ORGANIZATION_BILLING_JOBS_ROUTE,
  // Products
  STAFFTOOLS_PRODUCTS_ROUTE,
  STAFFTOOLS_NEW_PRODUCT_ROUTE,
  STAFFTOOLS_PRODUCT_SHOW_ROUTE,
  STAFFTOOLS_EDIT_PRODUCT_ROUTE,
  // Pricings
  STAFFTOOLS_PRICINGS_ROUTE,
  STAFFTOOLS_PRODUCT_PRICINGS_ROUTE,
  STAFFTOOLS_PRODUCT_NEW_PRICING_ROUTE,
  STAFFTOOLS_PRODUCT_PRICINGS_SHOW_ROUTE,
  STAFFTOOLS_PRODUCT_EDIT_PRICING_ROUTE,
  // Usage Report
  STAFFTOOLS_ENTERPRISE_USAGE_REPORT_ROUTE,
} as const

/**
 * Reverse query a route to find its template string based on a given real path
 * @param pathToMatch A "client side" path, i.e.: "/projects/1"
 * @returns An object with the match information or null if no match was found
 */
export const findRouteBestMatchByPath = (pathToMatch: string) =>
  Object.values(ROUTES_MAP).find(route => route.matchFullPathOrChildPaths(pathToMatch)) ?? null

/**
 * Reverse query a route to find its corresponding base route template string based on a given real path
 * @param pathToMatch A "client side" path, i.e.: "/projects/1"
 * @returns A base route object with the match information or null if no match was found
 */
export const matchBaseRouteByPath = (pathToMatch: string) =>
  Object.values(BASE_ROUTES).find(route => route.matchFullPathOrChildPaths(pathToMatch)) ?? null
