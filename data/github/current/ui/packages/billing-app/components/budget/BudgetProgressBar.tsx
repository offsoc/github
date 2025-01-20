import {ProgressBar} from '@primer/react'

type Props = {
  budgetTargetAmount: number
  budgetCurrentAmount: number
}

export default function BudgetProgressBar({budgetCurrentAmount, budgetTargetAmount}: Props) {
  const isOverBudget = budgetCurrentAmount > budgetTargetAmount

  // if budgetTargetAmount is 0, we want to show the progress bar as full (100%)
  const percentage = budgetTargetAmount === 0 ? 1 : budgetCurrentAmount / budgetTargetAmount
  const progress = Math.min(percentage * 100, 100)

  let bg: string
  if (isOverBudget) {
    bg = 'danger.emphasis'
  } else if (budgetTargetAmount === 0 || percentage >= 0.9) {
    bg = 'attention.emphasis'
  } else {
    bg = 'accent.emphasis'
  }

  return (
    <ProgressBar
      progress={progress}
      bg={bg}
      barSize="small"
      aria-label="Budget utilization"
      data-testid="budget-progressbar"
    />
  )
}
