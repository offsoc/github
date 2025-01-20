import type {RouteRegistration} from '@github-ui/react-core/app-routing-types'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import {App} from './App'

import {
  ENTERPRISE_BUDGETS_ROUTE,
  ENTERPRISE_COST_CENTERS_ROUTE,
  ENTERPRISE_EDIT_BUDGET_ROUTE,
  ENTERPRISE_EDIT_COST_CENTER_ROUTE,
  ENTERPRISE_NEW_BUDGET_ROUTE,
  ENTERPRISE_NEW_COST_CENTER_ROUTE,
  ENTERPRISE_OVERVIEW_ROUTE,
  ENTERPRISE_USAGE_ROUTE,
  ORGANIZATION_BUDGETS_ROUTE,
  ORGANIZATION_COST_CENTERS_ROUTE,
  ORGANIZATION_EDIT_BUDGET_ROUTE,
  ORGANIZATION_EDIT_COST_CENTER_ROUTE,
  ORGANIZATION_NEW_BUDGET_ROUTE,
  ORGANIZATION_NEW_COST_CENTER_ROUTE,
  ORGANIZATION_OVERVIEW_ROUTE,
  ORGANIZATION_USAGE_ROUTE,
  STAFFTOOLS_BILLING_JOBS_ROUTE,
  STAFFTOOLS_BUSINESS_ORGANIZATION_BILLING_JOBS_ROUTE,
  STAFFTOOLS_EDIT_PRODUCT_ROUTE,
  STAFFTOOLS_ENTERPRISE_DISCOUNTS_ROUTE,
  STAFFTOOLS_ENTERPRISE_INVOICES_ROUTE,
  STAFFTOOLS_ENTERPRISE_OVERVIEW_ROUTE,
  STAFFTOOLS_ENTERPRISE_COST_CENTERS_ROUTE,
  STAFFTOOLS_ENTERPRISE_BUDGETS_ROUTE,
  STAFFTOOLS_ENTERPRISE_EDIT_BUDGET_ROUTE,
  STAFFTOOLS_ENTERPRISE_USAGE_ROUTE,
  STAFFTOOLS_ENTERPRISE_AZURE_EMISSIONS_ROUTE,
  STAFFTOOLS_NEW_PRODUCT_ROUTE,
  STAFFTOOLS_PRODUCTS_ROUTE,
  STAFFTOOLS_PRODUCT_EDIT_PRICING_ROUTE,
  STAFFTOOLS_PRODUCT_NEW_PRICING_ROUTE,
  STAFFTOOLS_PRODUCT_SHOW_ROUTE,
  USER_BUDGETS_ROUTE,
  USER_COST_CENTERS_ROUTE,
  USER_EDIT_BUDGET_ROUTE,
  USER_EDIT_COST_CENTER_ROUTE,
  USER_NEW_BUDGET_ROUTE,
  USER_NEW_COST_CENTER_ROUTE,
  USER_OVERVIEW_ROUTE,
  USER_USAGE_ROUTE,
  ENTERPRISE_VIEW_COST_CENTER_ROUTE,
  STAFFTOOLS_ENTERPRISE_VIEW_COST_CENTER_ROUTE,
} from './routes'

import {
  BudgetEditPage,
  BudgetNewPage,
  BudgetsPage,
  CostCenterEditPage,
  CostCenterNewPage,
  CostCentersPage,
  CostCenterPage,
  OverviewPage,
  UsagePage,
} from './routes/'

import {
  AzureEmissionPage,
  BillingJobsPage,
  BusinessOrganizationBillingJobPage,
  DiscountsPage,
  InvoicesPage,
  PricingEditPage,
  PricingNewPage,
  ProductDetailsPage,
  ProductEditPage,
  ProductNewPage,
  ProductsPage,
} from './routes/stafftools'

const enterprisePages = [
  // Usage
  jsonRoute({path: ENTERPRISE_OVERVIEW_ROUTE.fullPath, Component: OverviewPage}),
  jsonRoute({path: ENTERPRISE_USAGE_ROUTE.fullPath, Component: UsagePage}),
  // Budgets
  jsonRoute({path: ENTERPRISE_BUDGETS_ROUTE.fullPath, Component: BudgetsPage}),
  jsonRoute({path: ENTERPRISE_NEW_BUDGET_ROUTE.fullPath, Component: BudgetNewPage}),
  jsonRoute({path: ENTERPRISE_EDIT_BUDGET_ROUTE.fullPath, Component: BudgetEditPage}),
  // Cost Centers
  jsonRoute({path: ENTERPRISE_COST_CENTERS_ROUTE.fullPath, Component: CostCentersPage}),
  jsonRoute({path: ENTERPRISE_VIEW_COST_CENTER_ROUTE.fullPath, Component: CostCenterPage}),
  jsonRoute({path: ENTERPRISE_NEW_COST_CENTER_ROUTE.fullPath, Component: CostCenterNewPage}),
  jsonRoute({path: ENTERPRISE_EDIT_COST_CENTER_ROUTE.fullPath, Component: CostCenterEditPage}),
  // Stafftools
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_USAGE_ROUTE.fullPath, Component: UsagePage}),
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_DISCOUNTS_ROUTE.fullPath, Component: DiscountsPage}),
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_INVOICES_ROUTE.fullPath, Component: InvoicesPage}),
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_OVERVIEW_ROUTE.fullPath, Component: OverviewPage}),
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_COST_CENTERS_ROUTE.fullPath, Component: CostCentersPage}),
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_BUDGETS_ROUTE.fullPath, Component: BudgetsPage}),
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_EDIT_BUDGET_ROUTE.fullPath, Component: BudgetEditPage}),
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_VIEW_COST_CENTER_ROUTE.fullPath, Component: CostCenterPage}),
  jsonRoute({path: STAFFTOOLS_ENTERPRISE_AZURE_EMISSIONS_ROUTE.fullPath, Component: AzureEmissionPage}),
]

const organizationPages = [
  // Usage
  jsonRoute({path: ORGANIZATION_OVERVIEW_ROUTE.fullPath, Component: OverviewPage}),
  jsonRoute({path: ORGANIZATION_USAGE_ROUTE.fullPath, Component: UsagePage}),
  // Budgets
  jsonRoute({path: ORGANIZATION_BUDGETS_ROUTE.fullPath, Component: BudgetsPage}),
  jsonRoute({path: ORGANIZATION_NEW_BUDGET_ROUTE.fullPath, Component: BudgetNewPage}),
  jsonRoute({path: ORGANIZATION_EDIT_BUDGET_ROUTE.fullPath, Component: BudgetEditPage}),
  // Cost Centers
  jsonRoute({path: ORGANIZATION_COST_CENTERS_ROUTE.fullPath, Component: CostCentersPage}),
  jsonRoute({path: ORGANIZATION_NEW_COST_CENTER_ROUTE.fullPath, Component: CostCenterNewPage}),
  jsonRoute({path: ORGANIZATION_EDIT_COST_CENTER_ROUTE.fullPath, Component: CostCenterEditPage}),
  // Stafftools
]

const userPages: Array<RouteRegistration<unknown, unknown>> = [
  // Usage
  jsonRoute({path: USER_OVERVIEW_ROUTE.fullPath, Component: OverviewPage}),
  jsonRoute({path: USER_USAGE_ROUTE.fullPath, Component: UsagePage}),
  // Budgets
  jsonRoute({path: USER_BUDGETS_ROUTE.fullPath, Component: BudgetsPage}),
  jsonRoute({path: USER_NEW_BUDGET_ROUTE.fullPath, Component: BudgetNewPage}),
  jsonRoute({path: USER_EDIT_BUDGET_ROUTE.fullPath, Component: BudgetEditPage}),
  // Cost Centers
  jsonRoute({path: USER_COST_CENTERS_ROUTE.fullPath, Component: CostCentersPage}),
  jsonRoute({path: USER_NEW_COST_CENTER_ROUTE.fullPath, Component: CostCenterNewPage}),
  jsonRoute({path: USER_EDIT_COST_CENTER_ROUTE.fullPath, Component: CostCenterEditPage}),
  // Stafftools
]

const productsPages = [
  // Products
  jsonRoute({path: STAFFTOOLS_PRODUCTS_ROUTE.fullPath, Component: ProductsPage}),
  jsonRoute({path: STAFFTOOLS_PRODUCT_SHOW_ROUTE.fullPath, Component: ProductDetailsPage}),
  jsonRoute({path: STAFFTOOLS_NEW_PRODUCT_ROUTE.fullPath, Component: ProductNewPage}),
  jsonRoute({path: STAFFTOOLS_EDIT_PRODUCT_ROUTE.fullPath, Component: ProductEditPage}),
  // Pricings
  jsonRoute({path: STAFFTOOLS_PRODUCT_NEW_PRICING_ROUTE.fullPath, Component: PricingNewPage}),
  jsonRoute({path: STAFFTOOLS_PRODUCT_EDIT_PRICING_ROUTE.fullPath, Component: PricingEditPage}),
]

const jobsPages = [
  jsonRoute({path: STAFFTOOLS_BILLING_JOBS_ROUTE.fullPath, Component: BillingJobsPage}),
  jsonRoute({
    path: STAFFTOOLS_BUSINESS_ORGANIZATION_BILLING_JOBS_ROUTE.fullPath,
    Component: BusinessOrganizationBillingJobPage,
  }),
]

registerReactAppFactory('billing-app', () => ({
  App,
  routes: [...enterprisePages, ...organizationPages, ...userPages, ...productsPages, ...jobsPages],
}))
