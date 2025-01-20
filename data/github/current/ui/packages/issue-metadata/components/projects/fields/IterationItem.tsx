import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import {Box, Text} from '@primer/react'
import {parseISO} from 'date-fns'

type IterationItemProps = {
  startDate: string
  durationInDays: number
  titleHTML: string
}

export function IterationItem({startDate, durationInDays, titleHTML}: IterationItemProps) {
  const now = new Date()
  const iterationStartDate = parseISO(startDate)
  const endDate = getIterationEndDate(iterationStartDate, durationInDays)
  const isCurrent = iterationStartDate <= now && now <= endDate
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', columnGap: 1, rowGap: 0, flexWrap: 'wrap'}}>
      <Box sx={{display: 'flex', fontSize: 0, justifyContent: 'space-between'}}>
        <SafeHTMLText html={titleHTML as SafeHTMLString} />
      </Box>
      <>&#8226; </>
      <Text sx={{color: 'fg.muted', fontSize: 0}}>
        {`${formatDate(iterationStartDate)} - ${formatDate(endDate)}`} {isCurrent && <>&#8226; </>}
      </Text>
      {isCurrent && <Text sx={{color: 'accent.fg', fontSize: 0, fontWeight: '500'}}>Current</Text>}
    </Box>
  )
}

// The date that an iteration ends. The end date is computed by adding
// the duration (number of days) to the start date, and then subtracting 1.
// We subtract 1 because the end date is inclusive, so we don't actually want
// to include the full duration in the range.
// For example a for an iterationStartDate of Jan 1, and a duration of 2 days,
// the end date should be Jan 2, _not_ Jan 3.
function getIterationEndDate(iterationStartDate: Date, durationInDays: number) {
  return new Date(iterationStartDate.getTime() + (durationInDays - 1) * 24 * 60 * 60 * 1000)
}
