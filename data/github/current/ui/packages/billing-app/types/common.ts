import type {BILLING_MANAGER, ENTERPRISE_OWNER, ENTERPRISE_ORG_OWNER} from '../constants'
import type {BillingTarget, CustomerType} from '../enums'

export type AdminRole = typeof ENTERPRISE_OWNER | typeof BILLING_MANAGER | typeof ENTERPRISE_ORG_OWNER | ''

export interface Customer {
  billingTarget: BillingTarget
  customerId: string
  customerType: CustomerType
  displayId: string
  name: string
  isVNextBeta: boolean
  isVNextNative: boolean
  plan: string
}

export interface Enterprise {
  billingTarget?: BillingTarget
  customerId: string
  name: string
  slug: string
}

export interface Item<T> {
  text: string
  id: T
  leadingVisual: () => JSX.Element
  rowLeadingVisual: () => JSX.Element
  viewOnly: boolean
}
