import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ReopenedEvent$key} from './__generated__/ReopenedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {IssueReopenedIcon} from '@primer/octicons-react'

export type ReopenedEventProps = {
  queryRef: ReopenedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function ReopenedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: ReopenedEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(
    graphql`
      fragment ReopenedEvent on ReopenedEvent {
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
      iconColoring={{backgroundColor: 'open.fg', color: 'white'}}
      leadingIcon={IssueReopenedIcon}
    >
      <TimelineRow.Main>
        <span>{LABELS.timeline.reopenedThis} </span>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
