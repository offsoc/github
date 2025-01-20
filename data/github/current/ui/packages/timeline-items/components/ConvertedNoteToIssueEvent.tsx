import {NoteIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ConvertedNoteToIssueEvent$key} from './__generated__/ConvertedNoteToIssueEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type ConvertedNoteToIssueEventProps = {
  queryRef: ConvertedNoteToIssueEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function ConvertedNoteToIssueEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: ConvertedNoteToIssueEventProps): JSX.Element {
  const {actor, createdAt, project, databaseId} = useFragment(
    graphql`
      fragment ConvertedNoteToIssueEvent on ConvertedNoteToIssueEvent {
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        project {
          url
          name
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
      leadingIcon={NoteIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.issueFromNote}
        <Link href={`${project?.url}`} sx={{color: 'fg.default'}} inline>
          {` ${project?.name} `}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
