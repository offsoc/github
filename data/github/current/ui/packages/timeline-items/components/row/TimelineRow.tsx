import {Octicon, Timeline} from '@primer/react'
import type {TimelineRowEventActor$data, TimelineRowEventActor$key} from './__generated__/TimelineRowEventActor.graphql'
import {Ago} from './Ago'
import {EventActor} from './EventActor'
import type {Icon} from '@primer/octicons-react'
import {useSlots} from '@primer/react/experimental'
import type React from 'react'
import {useRef} from 'react'
import {graphql, useFragment} from 'react-relay'
import styles from './row.module.css'
import {useLinkInterception} from '@github-ui/use-link-interception'

type TimelineRowType = {
  actor: TimelineRowEventActor$key | null | undefined
  highlighted: boolean
  createdAt: string
  deepLinkUrl: string
  onLinkClick?: (event: MouseEvent) => void
  showAgoTimestamp?: boolean
  showActorName?: boolean
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  children: React.ReactNode
  leadingIcon: Icon
  iconColoring?: {
    color?: string
    backgroundColor?: string
  }
  fillRow?: boolean
}

type RowInternalType = Omit<TimelineRowType, 'children' | 'actor'> & {
  slots: RowSlots
  actor: TimelineRowEventActor$key
}

type EventRowSlotsConfig = {
  trailing: typeof Trailing
  secondary: typeof Secondary
  main: typeof Main
}

type RowSlots = ReturnType<typeof useSlots<EventRowSlotsConfig>>

const Row = ({actor, children, ...props}: TimelineRowType) => {
  const slots = useSlots<EventRowSlotsConfig>(children, {
    trailing: Trailing,
    secondary: Secondary,
    main: Main,
  })

  if (actor) return <RowInternal actor={actor} slots={slots} {...props} />

  return <RowBase actorData={null} slots={slots} {...props} />
}

const RowInternal = ({actor, ...props}: RowInternalType) => {
  const actorData = useFragment(
    graphql`
      fragment TimelineRowEventActor on Actor {
        ...EventActor
      }
    `,
    actor,
  )

  return <RowBase {...props} actorData={actorData} />
}

type RowBaseType = Omit<TimelineRowType, 'children' | 'actor'> & {
  slots: RowSlots
  actorData?: TimelineRowEventActor$data | null
}

export const RowBase = ({
  showActorName = true,
  showAgoTimestamp = true,
  highlighted,
  createdAt,
  deepLinkUrl,
  onLinkClick,
  refAttribute,
  leadingIcon,
  iconColoring,
  slots,
  actorData,
  fillRow,
}: RowBaseType) => {
  const highlightedStyle = highlighted
    ? {
        borderRadius: '50%',
        boxShadow: `0px 0px 0px 2px var(--fgColor-accent, var(--color-accent-fg)), 0px 0px 0px 4px var(--bgColor-accent-muted, var(--color-accent-subtle))`,
      }
    : {}

  const containerRef = useRef<HTMLDivElement | null>(null)
  useLinkInterception({htmlContainer: containerRef?.current || undefined, onLinkClick, openLinksInNewTab: false})

  return (
    <Timeline.Item
      sx={{
        py: 2,
      }}
      ref={highlighted ? refAttribute : null}
    >
      <Timeline.Badge
        sx={{
          backgroundColor: iconColoring?.backgroundColor,
          ...highlightedStyle,
        }}
      >
        {leadingIcon && (
          <Octicon
            icon={leadingIcon}
            sx={{
              color: iconColoring?.color,
              fontSize: '14px',
            }}
          />
        )}
      </Timeline.Badge>
      <Timeline.Body
        ref={containerRef}
        sx={{
          color: 'fg.subtle',
          fontSize: '14px',
          width: '100%',
          paddingRight: fillRow ? 0 : 5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className={styles.timelineBodyRowContainer}>
          <div className={styles.timelineBodyContent}>
            <EventActor actor={actorData || null} showAvatarOnly={!showActorName} />
            {slots[0].main}
            {showAgoTimestamp && <Ago timestamp={new Date(createdAt)} linkUrl={deepLinkUrl} />}
          </div>
          <div className={styles.timelineBodyTrailingContent}>{slots[0].trailing}</div>
        </div>
        <div>{slots[0].secondary}</div>
      </Timeline.Body>
    </Timeline.Item>
  )
}

function Trailing(props: React.PropsWithChildren) {
  return <div data-trailing>{props.children}</div>
}

function Secondary(props: React.PropsWithChildren) {
  return <div data-secondary>{props.children}</div>
}

function Main(props: React.PropsWithChildren) {
  return <>{props.children}</>
}

export const TimelineRow = Object.assign(Row, {
  Trailing,
  Secondary,
  Main,
})
