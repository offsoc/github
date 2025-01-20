import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UnlockedEvent$key} from './__generated__/UnlockedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {UnlockIcon} from '@primer/octicons-react'

type UnlockedEventProps = {
  queryRef: UnlockedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UnlockedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UnlockedEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(
    graphql`
      fragment UnlockedEvent on UnlockedEvent {
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
      leadingIcon={UnlockIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.unlockedConversation} `}</TimelineRow.Main>
    </TimelineRow>
  )
}
