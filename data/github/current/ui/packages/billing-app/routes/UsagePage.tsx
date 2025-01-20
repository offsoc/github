import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useSearchParams} from '@github-ui/use-navigate'
import {Box, Link} from '@primer/react'
import first from 'lodash-es/first'
import {useState, Suspense, lazy, useEffect} from 'react'

import {Layout} from '../components'
import {UsageReportBanner} from '../components/usage/UsageReportBanner'
import BudgetBanner from '../components/budget/BudgetBanner'
import {reverse} from '../utils/array'
import {
  UsageCustomerSelectPanel,
  UsageFilters,
  UsageTable,
  UsageChartSkeleton,
  GetUsageReportDialog,
} from '../components/usage'
import {DEFAULT_GROUP_TYPE} from '../constants'
import {UsagePeriod} from '../enums'
import {useNetUsageData} from '../hooks/usage'

import type {BudgetAlertDetails} from '../types/budgets'
import type {Customer} from '../types/common'
import type {CustomerSelection, Filters, GroupSelection, PeriodSelection, UsageReportSelection} from '../types/usage'

const UsageChart = lazy(() => import('../components/usage/UsageChart'))

export interface UsagePagePayload {
  customer: Customer
  customer_selections: CustomerSelection[]
  period_selections: PeriodSelection[]
  group_selections: GroupSelection[]
  budget_alert_details: BudgetAlertDetails[]
  usage_report_selections: UsageReportSelection[]
  billing_platform_enabled_products: string[]
  current_user_email?: string
  vnext_migration_date: string
  show_billing_vnext_beta_usage_banner: boolean
  disable_usage_reports: boolean
  use_usage_chart_data_endpoint: boolean
  use_usage_table_data_endpoint: boolean
  is_multi_tenant: boolean
  is_single_tenant: boolean
}

export function UsagePage() {
  const payload = useRoutePayload<UsagePagePayload>()
  const {
    customer,
    customer_selections,
    group_selections: groupSelections,
    period_selections: periodSelections,
    budget_alert_details: budgetAlertDetails,
    usage_report_selections: usageReportSelections,
    current_user_email: currentUserEmail,
    billing_platform_enabled_products: billingPlatformEnabledProducts,
    show_billing_vnext_beta_usage_banner: showBillingVNextBetaUsageBanner,
    vnext_migration_date: vnextMigrationDate,
    disable_usage_reports: disableUsageReports,
    use_usage_chart_data_endpoint: useUsageChartDataEndpoint,
    use_usage_table_data_endpoint: useUsageTableDataEndpoint,
    is_multi_tenant: isMultiTenant,
    is_single_tenant: isSingleTenant,
  } = payload

  // The default selected customer is the last customer in the customerSelections array.
  // The reverse method is used to reverse the order of the array so that the default selected customer
  // is shown as the first item in the customer selection dropdown.
  const customerSelections = reverse(customer_selections)
  const [searchParams] = useSearchParams()

  const setUsageFilters = () => {
    const inputGroup = searchParams.get('group')
    const inputPeriod = searchParams.get('period')
    const inputQuery = searchParams.get('query')
    const inputCustomer = searchParams.get('customer')

    return {
      customer: inputCustomer
        ? (customerSelections.find((obj: CustomerSelection) => obj.id === inputCustomer) as CustomerSelection) ??
          (first(customerSelections) as CustomerSelection)
        : (first(customerSelections) as CustomerSelection),
      group: groupSelections.find(
        (obj: GroupSelection) => obj.type === (inputGroup ? parseInt(inputGroup) : DEFAULT_GROUP_TYPE),
      ),
      period: periodSelections.find(
        (obj: PeriodSelection) => obj.type === (inputPeriod ? parseInt(inputPeriod) : UsagePeriod.DEFAULT),
      ),
      product: undefined,
      searchQuery: inputQuery ?? '',
    }
  }

  const [filters, setFilters] = useState<Filters>(setUsageFilters)
  const {netUsage, otherUsage, requestState: requestState} = useNetUsageData({filters})

  // The pricing page is disabled for multi-tenant and single-tenant environments.
  const shouldShowPricingLink = !isMultiTenant && !isSingleTenant

  const shouldShowUsageReportDialog = currentUserEmail && billingPlatformEnabledProducts.length > 0
  const shouldShowUsageReportBanner =
    showBillingVNextBetaUsageBanner && customer.isVNextBeta && shouldShowUsageReportDialog

  const cost_center_management_page = `/enterprises/${customer.displayId}/billing/cost_centers`

  useEffect(() => {
    // update the URL query parameters as the user selects a new period
    const period = filters.period?.type ?? UsagePeriod.DEFAULT
    const group = filters.group?.type ?? DEFAULT_GROUP_TYPE
    const selectedCustomer = filters.customer

    if (filters.searchQuery) {
      history.replaceState(
        null,
        '',
        `?period=${period}&group=${group}&customer=${selectedCustomer.id}&query=${filters.searchQuery}`,
      )
    } else {
      history.replaceState(null, '', `?period=${period}&group=${group}&customer=${selectedCustomer.id}`)
    }
  }, [filters])

  return (
    <Layout>
      {/* if vNext beta customer, show dismissable banner about updated usage report.
      TODO: remove banner after 30 days on or after 07/15/24 */}
      {shouldShowUsageReportBanner && <UsageReportBanner />}
      {budgetAlertDetails.length > 0 &&
        budgetAlertDetails.map(budgetAlertDetail => (
          <BudgetBanner key={budgetAlertDetail.budget_id} budgetAlertDetail={budgetAlertDetail} />
        ))}
      <header className="Subhead">
        <Box sx={{display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: ['column', 'row']}}>
          <div>
            <Box sx={{mb: 2.5}}>
              <UsageCustomerSelectPanel
                menuItems={customerSelections}
                filtersSavedState={filters}
                setFilters={setFilters}
                manageCostCentersLink={cost_center_management_page}
                useUsageChartDataEndpoint={useUsageChartDataEndpoint}
              />
            </Box>
            <span className="Subhead-description">
              Includes amounts spent for organizations and repositories across all services.{' '}
              {shouldShowPricingLink && (
                <>
                  <Link inline href="/pricing">
                    View current and past pricing information
                  </Link>
                  .
                </>
              )}
            </span>
          </div>
          {shouldShowUsageReportDialog && (
            <GetUsageReportDialog
              currentUserEmail={currentUserEmail}
              usageReportSelections={usageReportSelections}
              billingPlatformEnabledProducts={billingPlatformEnabledProducts}
              disableUsageReports={disableUsageReports}
              vnextMigrationDate={vnextMigrationDate}
            />
          )}
        </Box>
      </header>
      <div>
        <UsageFilters
          customer={customer}
          filters={filters}
          setFilters={setFilters}
          groupSelections={groupSelections}
          periodSelections={periodSelections}
          useUsageChartDataEndpoint={useUsageChartDataEndpoint}
          showSearch
        />
        <Suspense fallback={<UsageChartSkeleton />}>
          <UsageChart
            filters={filters}
            requestState={requestState}
            usage={netUsage}
            otherUsage={otherUsage}
            useUsageChartDataEndpoint={useUsageChartDataEndpoint}
          />
        </Suspense>
        <UsageTable
          filters={filters}
          usage={netUsage}
          requestState={requestState}
          useUsageTableDataEndpoint={useUsageTableDataEndpoint}
        />
      </div>
    </Layout>
  )
}
