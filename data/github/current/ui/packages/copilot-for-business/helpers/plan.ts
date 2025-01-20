import {COPILOT_BUSINESS_LICENSE_COST, COPILOT_ENTERPRISE_LICENSE_COST} from '../constants'

export function planCost(planText: 'Business' | 'Enterprise') {
  return planText === 'Business' ? COPILOT_BUSINESS_LICENSE_COST : COPILOT_ENTERPRISE_LICENSE_COST
}
