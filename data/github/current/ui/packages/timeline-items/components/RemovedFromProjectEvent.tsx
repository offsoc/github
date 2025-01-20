import {TableIcon} from '@primer/octicons-react'
import {Link, Octicon} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'

import type {RemovedFromProjectEvent$key} from './__generated__/RemovedFromProjectEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {createIssueEventExternalUrl} from '../utils/urls'

type RemovedFromProjectEventProps = {
  queryRef: RemovedFromProjectEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function RemovedFromProjectEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: RemovedFromProjectEventProps): JSX.Element {
  const {actor, createdAt, project, projectColumnName, databaseId} = useFragment(
    graphql`
      fragment RemovedFromProjectEvent on RemovedFromProjectEvent {
        createdAt
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        project {
          name
          url
        }
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
        {`${LABELS.timeline.removedThisFrom} ${projectColumnName} in `}
        <Octicon icon={TableIcon} />{' '}
        <Link href={project.url} sx={{color: 'fg.default', mr: 1}} inline>
          {project.name}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
