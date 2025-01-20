import {TableIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'

import type {MovedColumnsInProjectEvent$key} from './__generated__/MovedColumnsInProjectEvent.graphql'
import {createIssueEventExternalUrl} from '../utils/urls'
import {TimelineRow} from './row/TimelineRow'

type MovedColumnsInProjectEventProps = {
  queryRef: MovedColumnsInProjectEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function MovedColumnsInProjectEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: MovedColumnsInProjectEventProps): JSX.Element {
  const {actor, createdAt, project, projectColumnName, previousProjectColumnName, databaseId} = useFragment(
    graphql`
      fragment MovedColumnsInProjectEvent on MovedColumnsInProjectEvent {
        createdAt
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        project {
          name
          url
        }
        previousProjectColumnName
        projectColumnName
      }
    `,
    queryRef,
  )

  if (!project) {
    return <></>
  }
  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={TableIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.movedThisFrom} ${previousProjectColumnName} to ${projectColumnName} in `}
        <Link href={project.url} sx={{color: 'fg.default', mr: 1}} inline>
          {project.name}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
