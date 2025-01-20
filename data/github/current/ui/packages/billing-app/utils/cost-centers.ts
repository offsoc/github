import {BillingTarget} from '../enums'
import {CostCenterType} from '../enums/cost-centers'
import type {CustomerSelection} from '../types/usage'

export const getCostCenterType = (billingTarget?: BillingTarget) => {
  if (billingTarget === BillingTarget.Azure) return CostCenterType.AzureSubscription
  if (billingTarget === BillingTarget.Zuora) return CostCenterType.ZuoraSubscription

  return CostCenterType.NoCostCenter
}

export const getSelectedCustomerDisplayTest = (customer: CustomerSelection): string => {
  if (!customer || customer.displayText === 'Metered usage (w/o cost centers)') {
    return 'Metered usage'
  }
  return customer.displayText
}
