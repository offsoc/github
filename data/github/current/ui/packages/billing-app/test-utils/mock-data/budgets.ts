import {BudgetLimitTypes} from '../../enums/budgets'

import type {Budget} from '../../types/budgets'

export const MOCK_BUDGETS: Budget[] = [
  {
    targetType: 'Org',
    targetAmount: 10.0,
    budgetLimitType: BudgetLimitTypes.AlertingOnly,
    currentAmount: 9.0,
    targetId: '1',
    targetName: 'github-inc',
    uuid: 'test-uuid',
    alertEnabled: true,
  },
]
