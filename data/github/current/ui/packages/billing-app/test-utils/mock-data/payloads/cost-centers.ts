import {GITHUB_INC_CUSTOMER} from '..'
import {BillingTarget, CustomerType} from '../../../enums'
import {mockCostCenter} from '../cost-centers'

export const getCostCentersRoutePayload = () => {
  return {
    adminRoles: [],
    activeCostCenters: [mockCostCenter],
    archivedCostCenters: [],
  }
}

export const getCostCenterRoutePayload = () => {
  return {
    costCenter: mockCostCenter,
    customer: GITHUB_INC_CUSTOMER,
    encodedAzureSubscriptionUri: '',
    subscriptions: [],
  }
}

export const getEditCostCenterPayload = () => {
  const mockCustomer = {
    billingTarget: BillingTarget.Zuora,
    customerId: '123',
    displayId: '123',
    name: 'test',
    customerType: CustomerType.Business,
  }

  return {adminRoles: [], costCenter: mockCostCenter, customer: mockCustomer, uri: '', subscriptions: []}
}
