import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {CommentDeletedEvent$key} from './__generated__/CommentDeletedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {TrashIcon} from '@primer/octicons-react'

type CommentDeletedEventProps = {
  queryRef: CommentDeletedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function CommentDeletedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: CommentDeletedEventProps): JSX.Element {
  const {actor, createdAt, deletedCommentAuthor, databaseId} = useFragment(
    graphql`
      fragment CommentDeletedEvent on CommentDeletedEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        deletedCommentAuthor {
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
      leadingIcon={TrashIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.deletedACommentFrom} `}
        <Link href={`/${deletedCommentAuthor?.login}`} sx={{color: 'fg.default'}} inline>
          {deletedCommentAuthor?.login}
        </Link>{' '}
      </TimelineRow.Main>
    </TimelineRow>
  )
}
