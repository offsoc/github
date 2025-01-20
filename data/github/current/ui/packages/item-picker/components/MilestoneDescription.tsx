import {Box} from '@primer/react'
import {LABELS} from '../constants/labels'
import {IS_BROWSER} from '@github-ui/ssr-utils'
import {RelativeTimeDescription} from './RelativeTimeDescription'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export type MilestoneDescriptionProps = {
  closed: boolean
  closedAt?: string | null
  dueOn?: string | null
  progressPercentage: number
  showProgressPercentage?: boolean
}

export const MilestoneDescription = ({
  closed,
  closedAt,
  dueOn,
  progressPercentage,
  showProgressPercentage = false,
}: MilestoneDescriptionProps) => {
  const date = closed ? closedAt : dueOn

  if (!date || !isValidDate(date)) return LABELS.milestones.noDueDate

  const givenDate = new Date(date)
  const currentDate = new Date()

  const isPreviousDate = dueOn ? new Date(date) < new Date() : false
  const isPastDate = isPreviousDate && !isToday(givenDate, currentDate)

  return (
    <Box sx={{color: isPastDate && !closed ? 'danger.fg' : 'fg.subtle'}}>
      {IS_BROWSER ? (
        <>
          {getMilestoneDescriptionLabel({isPastDate, closed})}
          &nbsp;
          {!isPastDate && !closed ? (
            dueOnDateDescription(date)
          ) : (
            <RelativeTimeDescription closed={closed} givenDate={givenDate} currentDate={currentDate} />
          )}
          {progressPercentage && showProgressPercentage ? LABELS.milestones.progressPercentage(progressPercentage) : ''}
        </>
      ) : (
        <LoadingSkeleton variant="rounded" height="sm" width="50%" />
      )}
    </Box>
  )
}

// gets prefix label for milestone description
const getMilestoneDescriptionLabel = ({
  isPastDate,
  closed,
}: {
  isPastDate: boolean
  closed: boolean
  dueOn?: string | null
}) => {
  if (closed) return LABELS.milestones.milestoneClosed
  if (isPastDate) return LABELS.milestones.pastDue
  return LABELS.milestones.milestoneDue
}

const dueOnDateDescription = (date: string) => {
  return new Date(date).toLocaleDateString('en-us', {
    month: 'long',
    year: 'numeric',
    day: 'numeric',
  })
}

// check if a date is valid
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// check if a date is today
const isToday = (givenDate: Date, currentDate: Date): boolean => {
  return (
    givenDate.getFullYear() === currentDate.getFullYear() &&
    givenDate.getMonth() === currentDate.getMonth() &&
    givenDate.getUTCDate() === currentDate.getUTCDate()
  )
}
