import {ENTERPRISE_TRIAL_PLAN} from '../constants'

export const isOnTrial = (plan: string) => plan === ENTERPRISE_TRIAL_PLAN
