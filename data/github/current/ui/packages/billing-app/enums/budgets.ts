import {
  BUDGET_SCOPE_COST_CENTER,
  BUDGET_SCOPE_ENTERPRISE,
  BUDGET_SCOPE_ORGANIZATION,
  BUDGET_SCOPE_REPOSITORY,
} from '../constants'

export enum BudgetType {
  // @ts-expect-error see https://github.com/microsoft/TypeScript/issues/58424 enums require statically analyzable syntax
  COST_CENTER = BUDGET_SCOPE_COST_CENTER,
  // @ts-expect-error see https://github.com/microsoft/TypeScript/issues/58424 enums require statically analyzable syntax
  ENTERPRISE = BUDGET_SCOPE_ENTERPRISE,
  // @ts-expect-error see https://github.com/microsoft/TypeScript/issues/58424 enums require statically analyzable syntax
  ORG = BUDGET_SCOPE_ORGANIZATION,
  // @ts-expect-error see https://github.com/microsoft/TypeScript/issues/58424 enums require statically analyzable syntax
  REPO = BUDGET_SCOPE_REPOSITORY,
}

export const enum BudgetLimitTypes {
  AlertingOnly = 'AlertingOnly',
  PreventFurtherUsage = 'PreventFurtherUsage',
}
