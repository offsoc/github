import {AlertIcon} from '@primer/octicons-react'
import {TimelineRow} from './row/TimelineRow'

export function FallbackEvent(): JSX.Element {
  return (
    <TimelineRow
      showActorName={false}
      showAgoTimestamp={false}
      highlighted={false}
      actor={null}
      createdAt={''}
      deepLinkUrl={''}
      leadingIcon={AlertIcon}
    >
      <TimelineRow.Main>
        <span>Could not load event</span>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
