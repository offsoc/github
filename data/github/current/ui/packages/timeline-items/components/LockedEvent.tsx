import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getLockString} from '../utils/get-lock-string'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {LockedEvent$key} from './__generated__/LockedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {LockIcon} from '@primer/octicons-react'

type LockedEventProps = {
  queryRef: LockedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function LockedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: LockedEventProps): JSX.Element {
  const {actor, createdAt, lockReason, databaseId} = useFragment(
    graphql`
      fragment LockedEvent on LockedEvent {
        databaseId
        createdAt
        lockReason
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )
  const lockReasonString = getLockString(lockReason)
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      onLinkClick={onLinkClick}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      leadingIcon={LockIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.locked} `}
        {lockReason && <>{`${LABELS.timeline.as} ${lockReasonString} `}</>}
        {`${LABELS.timeline.limitedToCollaborators} `}
      </TimelineRow.Main>
    </TimelineRow>
  )
}
