import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {ConvertedFromDraftEvent$key} from './__generated__/ConvertedFromDraftEvent.graphql'
import {createIssueEventExternalUrl} from '../utils/urls'
import {TimelineRow} from './row/TimelineRow'
import {IssueDraftIcon} from '@primer/octicons-react'

type ConvertedFromDraftEventProps = {
  queryRef: ConvertedFromDraftEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function ConvertedFromDraftEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: ConvertedFromDraftEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(
    graphql`
      fragment ConvertedFromDraftEvent on ConvertedFromDraftEvent {
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        databaseId
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
      leadingIcon={IssueDraftIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.convertedFromDraftIssue} `}</TimelineRow.Main>
    </TimelineRow>
  )
}
