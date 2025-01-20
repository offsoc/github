import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {PinnedEvent$key} from './__generated__/PinnedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {PinIcon} from '@primer/octicons-react'

type PinnedEventProps = {
  queryRef: PinnedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function PinnedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: PinnedEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(
    graphql`
      fragment PinnedEvent on PinnedEvent {
        databaseId
        createdAt
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
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={PinIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.pinned} `}</TimelineRow.Main>
    </TimelineRow>
  )
}
