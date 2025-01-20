import {AlertIcon} from '@primer/octicons-react'
import {Octicon, Box} from '@primer/react'

type Props = {
  isOverBudget: boolean
}

export default function BudgetWarningIcon({isOverBudget}: Props) {
  if (isOverBudget) {
    return (
      <Box sx={{display: 'inline-block'}}>
        <Octicon icon={AlertIcon} size={16} sx={{color: 'danger.fg'}} /> &nbsp;
      </Box>
    )
  }
  return null
}
