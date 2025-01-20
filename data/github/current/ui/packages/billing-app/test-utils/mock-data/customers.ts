import {BillingTarget, CustomerType} from '../../enums'

import type {Customer} from '../../types/common'

export const GITHUB_INC_CUSTOMER: Customer = {
  billingTarget: BillingTarget.Azure,
  customerId: '1',
  customerType: CustomerType.Business,
  displayId: 'github-inc',
  name: 'GitHub, Inc',
  isVNextBeta: true,
  isVNextNative: true,
  plan: 'enterprise',
}

export const ORGANIZATION_CUSTOMER: Customer = {
  billingTarget: BillingTarget.NoBillingTarget,
  customerId: '2',
  customerType: CustomerType.Organization,
  displayId: 'test-org',
  name: 'Test Org',
  isVNextBeta: true,
  isVNextNative: true,
  plan: 'organization',
}
