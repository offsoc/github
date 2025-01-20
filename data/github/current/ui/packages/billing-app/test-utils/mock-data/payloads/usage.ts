import {GITHUB_INC_CUSTOMER} from '../customers'
import {MOCK_PRODUCTS} from '../products-pricing'
import {CUSTOMER_SELECTIONS, GROUP_SELECTIONS, PERIOD_SELECTIONS, USAGE_REPORT_SELECTIONS} from '../usage'
import type {OverviewPagePayload} from '../../../routes/OverviewPage'
import type {UsagePagePayload} from '../../../routes/UsagePage'

export function getOverviewRoutePayload(): OverviewPagePayload {
  return {
    customer: GITHUB_INC_CUSTOMER,
    customer_selections: CUSTOMER_SELECTIONS,
    period_selections: PERIOD_SELECTIONS,
    admin_roles: [],
    enabled_products: MOCK_PRODUCTS,
    multi_tenant: false,
    budget_alert_details: [
      {
        text: "You've used 100% of your enterprise budget.",
        variant: 'danger',
        dismissible: false,
        dismiss_link: '',
        budget_id: 'id',
      },
    ],
    showPaymentDueTile: false,
    paymentDueTileData: {
      latestBillAmount: 0,
      nextPaymentDate: '',
      autoPay: true,
      overdue: false,
      hasBill: false,
      meteredViaAzure: false,
    },
    showLatestInvoiceTile: false,
    latestInvoiceTileData: {
      latestInvoiceBalance: 0,
      invoiceDueDate: '',
      invoiceNumber: '',
      overdue: false,
      meteredViaAzure: true,
    },
    showVolumeLicenseSpendTile: false,
    volumeLicenseSpendTileData: {
      IsSeparateDisplayCard: false,
      gheAndGhas: {period: 'per year', spend: 34.0},
      ghe: {period: 'per year', spend: 20.5},
      ghas: {period: 'per month', spend: 15.3},
      IsInvoiced: false,
    },
    enableOrgRepoUsageRefactor: false,
    useUsageChartDataEndpoint: false,
    showUsaSalesTaxDisclaimer: false,
  }
}

export function getOverviewRoutePayloadWithEmptyAlert(): OverviewPagePayload {
  return {
    ...getOverviewRoutePayload(),
    budget_alert_details: [],
  }
}

export function getOverviewRoutePayloadWithMultipleAlerts(): OverviewPagePayload {
  return {
    ...getOverviewRoutePayload(),
    budget_alert_details: [
      {
        text: "You've used 100% of your enterprise budget.",
        variant: 'danger',
        dismissible: false,
        dismiss_link: '',
        budget_id: 'id',
      },
      {
        text: "You've used 75% of your enterprise budget.",
        variant: 'danger',
        dismissible: false,
        dismiss_link: '',
        budget_id: 'another-id',
      },
    ],
  }
}

export function getUsageRoutePayload(): UsagePagePayload {
  return {
    customer: GITHUB_INC_CUSTOMER,
    // TODO: These should be pulled from constants once selections are moved from Ruby to TS
    customer_selections: CUSTOMER_SELECTIONS,
    period_selections: PERIOD_SELECTIONS,
    group_selections: GROUP_SELECTIONS,
    budget_alert_details: [],
    usage_report_selections: USAGE_REPORT_SELECTIONS,
    billing_platform_enabled_products: ['actions'],
    vnext_migration_date: '',
    show_billing_vnext_beta_usage_banner: false,
    disable_usage_reports: false,
    use_usage_chart_data_endpoint: false,
    use_usage_table_data_endpoint: false,
    is_multi_tenant: false,
    is_single_tenant: false,
  }
}

// TODO: Make these options of the above helper
export function getUsageRoutePayloadWithBudgetAlert(): UsagePagePayload {
  return {
    ...getUsageRoutePayload(),
    budget_alert_details: [
      {
        text: "You've used 75% of your enterprise budget.",
        variant: 'warning',
        dismissible: false,
        dismiss_link: '',
        budget_id: 'test-budget-id',
      },
    ],
  }
}

export function getUsageRoutePayloadWithTwoBudgetAlerts(): UsagePagePayload {
  return {
    ...getUsageRoutePayload(),
    budget_alert_details: [
      {
        text: "You've used 75% of your enterprise budget.",
        variant: 'warning',
        dismissible: false,
        dismiss_link: '',
        budget_id: 'test-budget-id',
      },
      {
        text: "You've used 100% of your enterprise budget.",
        variant: 'danger',
        dismissible: false,
        dismiss_link: '',
        budget_id: 'test-budget-id-1',
      },
    ],
  }
}
