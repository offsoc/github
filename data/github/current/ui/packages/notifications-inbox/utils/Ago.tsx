import type {SxProp} from '@primer/react'
import {Link, Text, Truncate} from '@primer/react'

const millisecond = 1
const second = millisecond * 1000
const minute = second * 60
const hour = minute * 60
const day = hour * 24
const month = day * 30
const timeIntervals = [
  {unit: 'month', ms: month},
  {unit: 'day', ms: day},
  {unit: 'hour', ms: hour},
  {unit: 'minute', ms: minute},
  {unit: 'second', ms: second},
]
const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: undefined,
  timeZoneName: 'short',
})
const longDateFormatter = new Intl.DateTimeFormat(undefined, {year: 'numeric', month: 'short', day: 'numeric'})
const shortDateFormatter = new Intl.DateTimeFormat(undefined, {month: 'short', day: 'numeric'})

type AgoProps = {
  timestamp: Date
  linkUrl?: string | undefined
  usePreposition?: boolean
} & SxProp

export function agoString(timestamp: Date, usePreposition = true) {
  let timeString = ''
  const now = new Date()
  const difference = now.getTime() - timestamp.getTime()
  const interval = timeIntervals.find(i => i.ms < difference)

  // If the difference is greater than a month, just show the date
  if (interval && interval.unit !== 'month') {
    const ago = Math.floor(difference / interval.ms)
    if (interval.unit === 'day' && ago === 1) {
      timeString = `yesterday`
    } else {
      timeString = `${ago} ${interval.unit}${ago > 1 ? 's' : ''} ago`
    }
  } else {
    const formatter = timestamp.getFullYear() === now.getFullYear() ? shortDateFormatter : longDateFormatter
    timeString = `${usePreposition ? 'on ' : ''}${formatter.format(timestamp)}`
  }

  return timeString
}

// Primer Pattern Request: https://github.com/github/primer/issues/955
export function Ago({timestamp, usePreposition = true, linkUrl, sx}: AgoProps) {
  const timeString = agoString(timestamp, usePreposition)
  const fullDateString = fullDateFormatter.format(timestamp)

  if (!linkUrl) {
    return (
      <Truncate inline title={fullDateString}>
        <Text title={fullDateString} sx={sx}>
          {timeString}
        </Text>
      </Truncate>
    )
  }

  return (
    <Link
      sx={{
        color: 'fg.muted',
        ...sx,
      }}
      href={linkUrl}
      target="_blank"
    >
      <Truncate inline title={fullDateString}>
        <Text
          title={fullDateString}
          sx={{
            '&:hover, &:focus': {
              color: 'accent.fg',
              textDecoration: 'underline',
            },
          }}
        >
          {timeString}
        </Text>
      </Truncate>
    </Link>
  )
}
