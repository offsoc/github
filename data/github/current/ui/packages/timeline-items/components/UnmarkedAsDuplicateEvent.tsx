import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UnmarkedAsDuplicateEvent$key} from './__generated__/UnmarkedAsDuplicateEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {DuplicateIcon} from '@primer/octicons-react'

type UnmarkedAsDuplicateEventProps = {
  queryRef: UnmarkedAsDuplicateEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UnmarkedAsDuplicateEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UnmarkedAsDuplicateEventProps): JSX.Element {
  const {actor, createdAt, canonical, databaseId} = useFragment(
    graphql`
      fragment UnmarkedAsDuplicateEvent on UnmarkedAsDuplicateEvent {
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        canonical {
          ... on Issue {
            url
            number
          }
          ... on PullRequest {
            url
            number
          }
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
      leadingIcon={DuplicateIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.unmarkedAsDuplicate}
        <Link href={canonical?.url} sx={{color: 'fg.default', mx: 1}} inline>
          #{canonical?.number}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
