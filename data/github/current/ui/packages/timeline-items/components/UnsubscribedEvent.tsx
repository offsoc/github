import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'

import type {UnsubscribedEvent$key} from './__generated__/UnsubscribedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {PinIcon} from '@primer/octicons-react'

type UnubscribedEventProps = {
  queryRef: UnsubscribedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UnsubscribedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UnubscribedEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(
    graphql`
      fragment UnsubscribedEvent on UnsubscribedEvent {
        createdAt
        databaseId
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )
  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      onLinkClick={onLinkClick}
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      leadingIcon={PinIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.unsubscribed} `}</TimelineRow.Main>
    </TimelineRow>
  )
}
