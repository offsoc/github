import DataCard from '@github-ui/data-card'
import {Box, RelativeTime} from '@primer/react'
import pluralize from 'pluralize'
import {calculateDaysLeft} from '../utils/calculate-days-left'

export interface StatusMetricProps {
  endsAt: Date
  isCompleted: boolean
}

export function StatusMetric({endsAt, isCompleted}: StatusMetricProps) {
  const daysLeft = calculateDaysLeft(endsAt)
  const isOverdue = daysLeft < 0

  const descriptionText = () => {
    if (isCompleted && isOverdue) {
      return 'Campaign ended on'
    }
    if (isOverdue) {
      return 'Due date was'
    }
    return 'Due date is'
  }

  return (
    <DataCard cardTitle="Status" sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div>
        {!isOverdue && !isCompleted && (
          <DataCard.Counter count={Math.abs(daysLeft)} metric={`${pluralize('day', Math.abs(daysLeft))} left`} />
        )}
        {isOverdue && !isCompleted && <Box sx={{fontSize: '24px', fontWeight: 400, lineHeight: '24px'}}>Overdue</Box>}
        {isCompleted && <Box sx={{fontSize: '24px', fontWeight: 400, lineHeight: '24px'}}>Completed</Box>}
      </div>
      <DataCard.Description>
        {descriptionText()} <RelativeTime date={endsAt} format="datetime" />
      </DataCard.Description>
    </DataCard>
  )
}
