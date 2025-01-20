import type {BudgetLimitTypes} from '../enums/budgets'

export interface Budget {
  targetType: string
  targetAmount: number
  budgetLimitType: BudgetLimitTypes
  currentAmount: number
  targetId: string
  targetName: string
  pricingTargetId?: string
  alertEnabled: boolean
  uuid: string
}

export type EditBudget = Budget & {
  alertEnabled: boolean
  alertRecipientUserIds: string[]
  pricingTargetId: string
  pricingTargetType: string
}

export interface BudgetAlertRecipient {
  id: string
  login: string
  name: string | null
  avatarUrl: string
}

export interface GetBudgetResponse {
  budget: EditBudget
  slug: string
}

export interface UpsertBudgetRequest {
  targetAmount: number
  targetType: string
  targetId: string
  pricingTargetType: string
  pricingTargetId: string
  budgetLimitType: string
  alertEnabled: boolean
  alertRecipientUserIds: string[]
}

export type BudgetVariant = 'danger' | 'warning'

export interface BudgetAlertActionDetails {
  text: string
  url_text: string
  url: string
}

export interface BudgetAlertDetails {
  text: string
  variant: BudgetVariant
  dismissible: boolean
  dismiss_link: string
  budget_id: string
}

export type BudgetPicker = 'repo' | 'org' | 'enterprise'
