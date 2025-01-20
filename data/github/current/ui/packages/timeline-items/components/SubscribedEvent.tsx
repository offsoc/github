import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'

import type {SubscribedEvent$key} from './__generated__/SubscribedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {PinIcon} from '@primer/octicons-react'

type SubscribedEventProps = {
  queryRef: SubscribedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function SubscribedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: SubscribedEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(
    graphql`
      fragment SubscribedEvent on SubscribedEvent {
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
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      onLinkClick={onLinkClick}
      leadingIcon={PinIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.subscribed} `}</TimelineRow.Main>
    </TimelineRow>
  )
}
