import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Heading, LinkButton, Octicon, Text} from '@primer/react'
import {InfoIcon} from '@primer/octicons-react'
import first from 'lodash-es/first'
import {useState, useContext, Suspense, lazy} from 'react'
import {reverse} from '../utils/array'
import {Fonts} from '../utils/style'
import {PageContext} from '../App'
import useBudgetsPage from '../hooks/budget/use-budgets-page'
import {useNetUsageData} from '../hooks/usage'
import useRoute from '../hooks/use-route'
import {Layout, WelcomeBanner} from '../components'
import {BudgetsTable, BudgetBanner} from '../components/budget'
import {
  UsageChartSkeleton,
  DiscountUsageCard,
  TotalUsageCard,
  UsageCustomerSelectPanel,
  UsageFilters,
  ProductUsageContainer,
  OrgRepoUsageContainer,
} from '../components/usage'
import {VolumeLicensesCard} from '../components/licensing'
import {BILLING_MANAGER, ENTERPRISE_OWNER, ENTERPRISE_ORG_OWNER} from '../constants'
import {UsagePeriod} from '../enums'
import {BUDGETS_ROUTE} from '../routes'
import {pageHeadingStyle} from '../utils'
import PaymentDueCard from '../components/payment_due/PaymentDueCard'

import type {BudgetAlertDetails} from '../types/budgets'
import type {AdminRole, Customer} from '../types/common'
import type {EnabledProduct} from '../types/products'
import type {CustomerSelection, Filters, PeriodSelection} from '../types/usage'
import type {PaymentDueCardProps} from '../components/payment_due/PaymentDueCard'
import type {VolumeLicensesCardProps} from '../components/licensing/VolumeLicensesCard'
import {isOnTrial} from '../utils/business'
import LatestInvoiceCard from '../components/invoices/LatestInvoiceCard'
import type {LatestInvoiceCardProps} from '../components/invoices/LatestInvoiceCard'

const UsageChart = lazy(() => import('../components/usage/UsageChart'))

const overviewCardsStyle = {
  display: 'grid',
  gridTemplateColumns: ['1', '1', '1', '1', 'repeat(2, 1fr)'],
  gridGap: 3,
  mb: 1,
}

export interface OverviewPagePayload {
  admin_roles: AdminRole[]
  budget_alert_details: BudgetAlertDetails[]
  customer: Customer
  customer_selections: CustomerSelection[]
  enabled_products: EnabledProduct[]
  period_selections: PeriodSelection[]
  multi_tenant: boolean
  showPaymentDueTile: boolean
  paymentDueTileData: PaymentDueCardProps
  showLatestInvoiceTile: boolean
  latestInvoiceTileData: LatestInvoiceCardProps
  showVolumeLicenseSpendTile: boolean
  volumeLicenseSpendTileData: VolumeLicensesCardProps
  enableOrgRepoUsageRefactor: boolean
  useUsageChartDataEndpoint: boolean
  showUsaSalesTaxDisclaimer: boolean
}

export function OverviewPage() {
  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute
  const isEnterpriseRoute = useContext(PageContext).isEnterpriseRoute
  const isOrganizationRoute = useContext(PageContext).isOrganizationRoute

  const payload = useRoutePayload<OverviewPagePayload>()
  const {
    admin_roles: adminRoles,
    budget_alert_details: budgetAlertDetails,
    customer,
    customer_selections,
    enabled_products: enabledProducts,
    period_selections: periodSelections,
    multi_tenant: multiTenant,
    showPaymentDueTile,
    paymentDueTileData,
    showLatestInvoiceTile: showLatestInvoiceTile,
    latestInvoiceTileData,
    showVolumeLicenseSpendTile,
    volumeLicenseSpendTileData,
    enableOrgRepoUsageRefactor,
    useUsageChartDataEndpoint,
    showUsaSalesTaxDisclaimer,
  } = payload

  // The default selected customer is the last customer in the customerSelections array.
  // The reverse method is used to reverse the order of the array so that the default selected customer
  // is shown as the first item in the customer selection dropdown.
  const customerSelections = reverse(customer_selections)
  const {customerId} = customer
  const [filters, setFilters] = useState<Filters>({
    customer: first(customerSelections) as CustomerSelection,
    group: undefined,
    period: periodSelections.find((obj: PeriodSelection) => obj.type === UsagePeriod.DEFAULT),
    product: undefined,
    searchQuery: '',
  })

  const {netUsage, requestState: requestState} = useNetUsageData({filters})

  // Un-commenting this line will tell the budgets table to pull from cost center customers when selected,
  // but right now all cost centers are scoped under the enterprise. Leaving in place per @mattkorwel
  // const {budgets, deleteBudgetFromPage} = useBudgetsPage({slug, customerId: filters.customer.id})
  const {budgets, deleteBudgetFromPage} = useBudgetsPage({customerId})

  const {path: budgetsPath} = useRoute(BUDGETS_ROUTE)

  const hasBudgetWritePermissions = adminRoles.includes(BILLING_MANAGER) || adminRoles.includes(ENTERPRISE_OWNER)
  // TODO: Filter based on the product
  const hasAccessToAllUsage = adminRoles.includes(ENTERPRISE_OWNER) || adminRoles.includes(BILLING_MANAGER)
  const isOnlyOrgAdmin = !hasAccessToAllUsage && adminRoles.includes(ENTERPRISE_ORG_OWNER)
  const canViewDiscountUsage =
    adminRoles.includes(ENTERPRISE_OWNER) || adminRoles.includes(BILLING_MANAGER) || isOrganizationRoute
  const cost_center_management_page = `/enterprises/${customer.displayId}/billing/cost_centers`
  const trialCustomer = isOnTrial(customer.plan)

  return (
    <Layout data-hpc>
      {!isStafftoolsRoute && !customer.isVNextNative && <WelcomeBanner multiTenant={multiTenant} />}
      {budgetAlertDetails.length > 0 &&
        budgetAlertDetails.map(budgetAlertDetail => (
          <BudgetBanner key={budgetAlertDetail.budget_id} budgetAlertDetail={budgetAlertDetail} />
        ))}
      <header className="Subhead">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          Overview
        </Heading>
      </header>

      <Box
        sx={{
          ...overviewCardsStyle,
          gridTemplateColumns:
            showPaymentDueTile || showLatestInvoiceTile
              ? ['1', '1', '1', '1', 'repeat(3, 1fr)']
              : overviewCardsStyle.gridTemplateColumns,
        }}
      >
        <TotalUsageCard customerSelections={customerSelections} isOrganization={isOrganizationRoute} />
        {canViewDiscountUsage && (
          <DiscountUsageCard enabledProducts={enabledProducts} isOrganization={isOrganizationRoute} />
        )}
        {showPaymentDueTile && <PaymentDueCard {...paymentDueTileData} />}
        {showLatestInvoiceTile && <LatestInvoiceCard {...latestInvoiceTileData} />}
      </Box>
      <Box sx={{mb: 4}}>
        {showUsaSalesTaxDisclaimer && (
          <Box sx={{display: 'flex'}} data-testid="usa-sales-tax-disclaimer-fineprint">
            <Octicon sx={{color: 'fg.muted', pr: 1}} icon={InfoIcon} size={16} />
            <Text as="p" sx={{color: 'fg.muted', fontSize: Fonts.FontSizeSmall}}>
              Sales tax is not included in the amounts shown above.
            </Text>
          </Box>
        )}
      </Box>

      {showVolumeLicenseSpendTile && (
        <Box sx={{mb: 4}}>
          <VolumeLicensesCard {...volumeLicenseSpendTileData} />
        </Box>
      )}
      <Box sx={{mb: 3}}>
        <UsageCustomerSelectPanel
          menuItems={customerSelections}
          filtersSavedState={filters}
          setFilters={setFilters}
          manageCostCentersLink={cost_center_management_page}
          useUsageChartDataEndpoint={useUsageChartDataEndpoint}
        />
      </Box>

      <Box sx={{mb: 3}}>
        <Suspense fallback={<UsageChartSkeleton />}>
          <UsageChart
            filters={filters}
            requestState={requestState}
            usage={netUsage}
            showTitle={false}
            useUsageChartDataEndpoint={useUsageChartDataEndpoint}
          >
            <UsageFilters
              customer={customer}
              filters={filters}
              setFilters={setFilters}
              periodSelections={periodSelections}
              showSearch={false}
              sx={{mb: 0}}
              useUsageChartDataEndpoint={useUsageChartDataEndpoint}
            />
          </UsageChart>
        </Suspense>
      </Box>

      <OrgRepoUsageContainer filters={filters} enableOrgRepoUsageRefactor={enableOrgRepoUsageRefactor} />

      <ProductUsageContainer
        customer={customer}
        enabledProducts={enabledProducts}
        filters={filters}
        isOnlyOrgAdmin={isOnlyOrgAdmin}
      />

      {/* // Trial customers cannot create budgets */}
      {!trialCustomer && isEnterpriseRoute && (
        <div>
          <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
            <Heading as="h2" sx={{fontSize: 3}} data-testid="budgets-section">
              Budgets
            </Heading>
            {hasBudgetWritePermissions && (
              <LinkButton
                href={budgetsPath}
                sx={{color: 'btn.text', ml: 'auto', ':hover': {textDecoration: 'none'}}}
                underline={false}
              >
                Manage budgets
              </LinkButton>
            )}
          </Box>
          <BudgetsTable
            budgets={budgets}
            adminRoles={adminRoles}
            deleteBudget={deleteBudgetFromPage}
            enabledProducts={enabledProducts}
          />
        </div>
      )}
    </Layout>
  )
}
