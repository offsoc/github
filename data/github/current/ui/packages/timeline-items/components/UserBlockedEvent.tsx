import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UserBlockedEvent$key} from './__generated__/UserBlockedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {BlockedIcon} from '@primer/octicons-react'

type UserBlockedEventProps = {
  queryRef: UserBlockedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UserBlockedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UserBlockedEventProps): JSX.Element {
  const {actor, createdAt, blockedUser, blockDuration, databaseId} = useFragment(
    graphql`
      fragment UserBlockedEvent on UserBlockedEvent {
        databaseId
        createdAt
        blockDuration
        actor {
          ...TimelineRowEventActor
        }
        blockedUser: subject {
          login
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
      leadingIcon={BlockedIcon}
    >
      <TimelineRow.Main>
        {blockDuration !== 'PERMANENT' && `${LABELS.timeline.temporarily} `}
        {`${LABELS.timeline.blocked} `}
        <Link href={`/${blockedUser?.login}`} sx={{color: 'fg.default', mr: 1}} inline>
          {blockedUser?.login}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
