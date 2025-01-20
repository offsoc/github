import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {TransferredEvent$key} from './__generated__/TransferredEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {LinkExternalIcon} from '@primer/octicons-react'

type TransferredEventProps = {
  queryRef: TransferredEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function TransferredEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: TransferredEventProps): JSX.Element {
  const {actor, createdAt, fromRepository, databaseId} = useFragment(
    graphql`
      fragment TransferredEvent on TransferredEvent {
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        fromRepository {
          nameWithOwner
          url
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
      <TimelineRow.Main>
        {LABELS.timeline.transferredThis}
        <Link href={`${fromRepository?.url}`} sx={{color: 'fg.default', ml: 1, mr: 1}} inline>
          {fromRepository?.nameWithOwner}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
