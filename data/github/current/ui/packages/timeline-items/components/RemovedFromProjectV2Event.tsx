// eslint-disable-next-line filenames/match-regex
import {TableIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {RemovedFromProjectV2Event$key} from './__generated__/RemovedFromProjectV2Event.graphql'
import {TimelineRow} from './row/TimelineRow'
import {ProjectV2} from './ProjectV2'
import {Fragment} from 'react'
import {RolledupProjectV2Event} from './RolledupProjectV2Event'

type RemovedFromProjectV2EventProps = {
  queryRef: RemovedFromProjectV2Event$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  rollupGroup?: Record<string, Array<RemovedFromProjectV2Event$key | RemovedFromProjectV2Event$key>>
}

const RemovedFromProjectV2EventFragment = graphql`
  fragment RemovedFromProjectV2Event on RemovedFromProjectV2Event {
    createdAt
    actor {
      ...TimelineRowEventActor
    }
    project {
      title
      url
    }
  }
`

export function RemovedFromProjectV2Event({
  queryRef,
  issueUrl,
  onLinkClick,
  rollupGroup,
}: RemovedFromProjectV2EventProps): JSX.Element {
  const {actor, createdAt, project} = useFragment(RemovedFromProjectV2EventFragment, queryRef)

  if (!project) {
    return <></>
  }

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
        {rollupGroup ? (
          <RolledupProjectV2Event rollupGroup={rollupGroup} />
        ) : (
          <RemovedFromProjectV2sRendering queryRefs={[queryRef]} />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const RemovedFromProjectV2sRendering = ({queryRefs}: {queryRefs: RemovedFromProjectV2Event$key[]}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {`${LABELS.timeline.removedThisFrom} `}
      {queryRefs.map((queryRef, index) => (
        <Fragment key={index}>
          <InternalRemovedFromProjectV2sRendering
            queryRef={queryRef}
            first={index === 0}
            last={index === queryRefs.length - 1}
          />
        </Fragment>
      ))}
    </>
  )
}

const InternalRemovedFromProjectV2sRendering = ({
  queryRef,
  first,
  last,
}: Pick<RemovedFromProjectV2EventProps, 'queryRef'> & {
  first: boolean
  last: boolean
}) => {
  const {project} = useFragment(RemovedFromProjectV2EventFragment, queryRef)

  if (!project?.title || !project?.url) {
    return null
  }

  return (
    <Text
      sx={{
        marginRight: 0,
        '&:last-of-type': {
          marginRight: 1,
        },
      }}
    >
      <>
        {!first && !last && <Text sx={{mr: 1}}>,</Text>}
        {!first && last && <Text sx={{mr: 1, ml: 1}}>{LABELS.timeline.and}</Text>}
        <ProjectV2 title={project?.title} url={project?.url} />
      </>
    </Text>
  )
}
