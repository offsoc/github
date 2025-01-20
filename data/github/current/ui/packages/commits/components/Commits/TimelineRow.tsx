import {GitCommitIcon} from '@primer/octicons-react'
import {Heading, type HeadingProps, Octicon, Timeline} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {PropsWithChildren} from 'react'

export type TimelineRowProps = {
  leadingVisual?: JSX.Element
  clipTimeline?: 'none' | 'bottom' | 'top'
  sx?: BetterSystemStyleObject
}

const itemSxMap = {
  none: {},
  bottom: {pb: 0},
  top: {pt: 0},
}

const DefaultLeadingVisual = () => {
  return <Octicon icon={GitCommitIcon} />
}

function TimelineRowComponent({
  children,
  leadingVisual,
  clipTimeline = 'none',
  sx: externalSx = {},
}: PropsWithChildren<TimelineRowProps>) {
  const itemSx = itemSxMap[clipTimeline]

  return (
    <Timeline.Item sx={{py: 1, ...itemSx, ...externalSx}}>
      <Timeline.Badge sx={{backgroundColor: 'canvas.default'}}>
        {leadingVisual ?? <DefaultLeadingVisual />}
      </Timeline.Badge>
      <Timeline.Body className="mt-0">{children}</Timeline.Body>
    </Timeline.Item>
  )
}

function TimelineRowHeading({
  title,
  as,
  ...props
}: {title: string; as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'} & Omit<HeadingProps, 'as'>) {
  return (
    <Heading as={as} className="text-normal f5 py-1" {...props}>
      {title}
    </Heading>
  )
}

export const TimelineRow = Object.assign(TimelineRowComponent, {
  Heading: TimelineRowHeading,
})
