import {Label} from '@primer/react'

const labelStyle = {
  marginLeft: 2,
}

type Props = {
  budgetTargetAmount: number
  budgetCurrentAmount: number
}

export default function BudgetLabel({budgetCurrentAmount, budgetTargetAmount}: Props) {
  const isOverBudget = budgetCurrentAmount > budgetTargetAmount

  // if budgetTargetAmount is 0, we want to show the progress bar as full (100%)
  const percentage = budgetTargetAmount === 0 ? 1.0 : budgetCurrentAmount / budgetTargetAmount

  if (percentage < 0.9 && !isOverBudget) {
    return null
  }

  const variant = isOverBudget ? 'danger' : 'attention'
  const label = isOverBudget ? 'Over budget' : `${Math.floor(percentage * 100)}%`

  return (
    <Label variant={variant} sx={labelStyle} data-testid="budget-label">
      {label}
    </Label>
  )
}
