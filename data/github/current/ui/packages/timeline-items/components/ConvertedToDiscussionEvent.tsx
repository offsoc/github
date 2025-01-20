import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ConvertedToDiscussionEvent$key} from './__generated__/ConvertedToDiscussionEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {CommentDiscussionIcon} from '@primer/octicons-react'

type ConvertedToDiscussionEventProps = {
  queryRef: ConvertedToDiscussionEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function ConvertedToDiscussionEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: ConvertedToDiscussionEventProps): JSX.Element {
  const {actor, createdAt, discussion, databaseId} = useFragment(
    graphql`
      fragment ConvertedToDiscussionEvent on ConvertedToDiscussionEvent {
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        discussion {
          url
          number
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
      leadingIcon={CommentDiscussionIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.convertedToDiscussion}
        {discussion && (
          <Link
            href={`${discussion.url}`}
            sx={{color: 'fg.default'}}
            aria-label={`Discussion #${discussion.number}`}
            inline
          >
            {` #${discussion.number} `}
          </Link>
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}
