import type {EnterpriseCloudSummaryProps} from '../components/EnterpriseCloudSummary'
import type {PendingCycleChange} from '../types/pending-cycle-change'

export function getEnterpriseOverviewProps() {
  return {
    ghe: getEnterpriseCloudSummaryProps(),
    ...getNavigationContextProviderProps(),
  }
}

export function getNavigationContextProviderProps() {
  return {
    enterpriseContactUrl: '/enterprise-contact-url',
    isStafftools: false,
    slug: 'my-test-enterprise',
  }
}

export function getPaymentMethod() {
  return {
    card_type: 'Visa',
    credit_card: true,
    last_four: '1234',
    paypal: false,
  }
}

export function getPendingPlanChange(): PendingCycleChange {
  return {
    changeType: 'change',
    effectiveDate: new Date(2024, 6, 1),
    isChangingDuration: false,
    isChangingSeats: true,
    newPrice: '$99.99',
    newSeatCount: 5,
    planDisplayName: 'Premium',
    planDuration: 'month',
  }
}

export function getTrialInfo() {
  return {
    expirationDate: new Date('2024-05-31T00:00:00.000-07:00'),
    isActive: true,
    trialLicensesAllowed: 50,
  }
}

export function getEnterpriseCloudSummaryProps(): EnterpriseCloudSummaryProps {
  return {
    billingTermEndDate: new Date('2024-06-30T00:00:00.000-07:00'),
    canViewMembers: true,
    currentPayment: '$4,200.00',
    enterpriseLicensesConsumed: 10,
    enterpriseLicensesPurchased: 100,
    isMonthly: true,
    isSelfServe: true,
    isSelfServeBlocked: false,
    isVolumeLicensed: false,
    isVssEnabled: true,
    paymentMethod: getPaymentMethod(),
    trialInfo: getTrialInfo(),
    unitCost: 2100,
    vssLicensesConsumed: 0,
    vssLicensesPurchasedWithOverage: 0,
  }
}
