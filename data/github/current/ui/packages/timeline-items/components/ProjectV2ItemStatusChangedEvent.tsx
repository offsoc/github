// eslint-disable-next-line filenames/match-regex
import {TableIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {ProjectV2ItemStatusChangedEvent$key} from './__generated__/ProjectV2ItemStatusChangedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {ProjectV2} from './ProjectV2'

type ProjectV2ItemStatusChangedEventProps = {
  queryRef: ProjectV2ItemStatusChangedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
}

export function ProjectV2ItemStatusChangedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
}: ProjectV2ItemStatusChangedEventProps): JSX.Element {
  const {actor, createdAt, project, previousStatus, status} = useFragment(
    graphql`
      fragment ProjectV2ItemStatusChangedEvent on ProjectV2ItemStatusChangedEvent {
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        project {
          title
          url
        }
        previousStatus
        status
      }
    `,
    queryRef,
  )

  if (!project) {
    return <></>
  }

  const safeStatus = status.length > 0 ? status : 'No status'

  // Once we have support for the project IDs being exposed in GQL we can shift to using the
  // `issueEventExternalUrl` function here for our deep linked timestamp.
  return (
    <TimelineRow
      highlighted={false}
      actor={actor}
      onLinkClick={onLinkClick}
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      leadingIcon={TableIcon}
    >
      <TimelineRow.Main>
        {previousStatus && previousStatus.length > 0 ? (
          <>{`${LABELS.timeline.movedThisFrom} ${previousStatus} ${LABELS.timeline.to} `}</>
        ) : (
          <>{`${LABELS.timeline.movedThisTo} `}</>
        )}
        {`${safeStatus} ${LABELS.timeline.in} `}
        <Text sx={{marginRight: 1}}>
          <ProjectV2 title={project?.title} url={project?.url} />
        </Text>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
