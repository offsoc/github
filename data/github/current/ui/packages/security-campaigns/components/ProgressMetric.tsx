import DataCard from '@github-ui/data-card'
import {Box, Text} from '@primer/react'
import pluralize from 'pluralize'
import {ProgressMetricLoading} from './ProgressMetricLoading'
import {calculateDaysLeft} from '../utils/calculate-days-left'

export interface ProgressMetricProps {
  openCount: number | undefined
  closedCount: number | undefined
  isSuccess: boolean
  endsAt: Date
  createdAt: Date
}

const percentFormatter = new Intl.NumberFormat('en-US', {style: 'percent'})

export function ProgressMetric({openCount = 0, closedCount = 0, isSuccess, endsAt, createdAt}: ProgressMetricProps) {
  const totalCount = openCount + closedCount
  const fractionAlertsClosed = totalCount === 0 ? 0 : closedCount / totalCount

  const formattedPercentAlertsClosed = percentFormatter.format(fractionAlertsClosed)

  const daysLeft = calculateDaysLeft(endsAt)
  const isCreatedToday = createdAt.toDateString() === new Date().toDateString()
  const isCompleted = fractionAlertsClosed === 1
  const isOverdue = daysLeft < 0

  const progressText = () => {
    if (isCompleted) {
      return 'Campaign has been completed'
    }
    if (isOverdue) {
      return `Campaign overdue by ${Math.abs(daysLeft)} ${pluralize('day', Math.abs(daysLeft))}`
    }
    if (!isCreatedToday) {
      return `Campaign started ${Math.abs(calculateDaysLeft(createdAt))} ${pluralize(
        'day',
        Math.abs(calculateDaysLeft(createdAt)),
      )} ago`
    }
    return 'Campaign started today'
  }

  if (!isSuccess) {
    return <ProgressMetricLoading />
  }

  return (
    <DataCard cardTitle="Campaign progress">
      <Box sx={{display: 'flex', color: 'fg.muted'}}>
        <Text sx={{flexGrow: 1}}>
          {formattedPercentAlertsClosed} ({closedCount} {pluralize('alert', closedCount)})
        </Text>
        <span>
          {openCount} {pluralize('alert', openCount)} left
        </span>
      </Box>
      <DataCard.ProgressBar
        data={[
          {
            progress: fractionAlertsClosed * 100,
            color: isOverdue && !isCompleted ? 'red ' : 'purple',
          },
        ]}
        aria-label={`Progress: ${formattedPercentAlertsClosed} of ${pluralize('alert', closedCount)} closed`}
      />
      <DataCard.Description>{progressText()}</DataCard.Description>
    </DataCard>
  )
}
