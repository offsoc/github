import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'

import type {MentionedEvent$key} from './__generated__/MentionedEvent.graphql'
import {createIssueEventExternalUrl} from '../utils/urls'
import {TimelineRow} from './row/TimelineRow'
import {LinkExternalIcon} from '@primer/octicons-react'

type MentionedEventProps = {
  queryRef: MentionedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function MentionedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: MentionedEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(
    graphql`
      fragment MentionedEvent on MentionedEvent {
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
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={LinkExternalIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.mentioned} `}</TimelineRow.Main>
    </TimelineRow>
  )
}
