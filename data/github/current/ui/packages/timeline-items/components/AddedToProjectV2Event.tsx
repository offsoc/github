// eslint-disable-next-line filenames/match-regex
import {TableIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {AddedToProjectV2Event$key} from './__generated__/AddedToProjectV2Event.graphql'
import {TimelineRow} from './row/TimelineRow'
import {ProjectV2} from './ProjectV2'
import {Fragment} from 'react'
import {RolledupProjectV2Event} from './RolledupProjectV2Event'

type AddedToProjectV2EventProps = {
  queryRef: AddedToProjectV2Event$key
  issueUrl: string
  rollupGroup?: Record<string, Array<AddedToProjectV2Event$key | AddedToProjectV2Event$key>>
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

const AddedToProjectV2EventFragment = graphql`
  fragment AddedToProjectV2Event on AddedToProjectV2Event {
    databaseId
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

export function AddedToProjectV2Event({
  queryRef,
  issueUrl,
  rollupGroup,
  highlightedEventId,
  refAttribute,
}: AddedToProjectV2EventProps): JSX.Element {
  const {actor, createdAt, project, databaseId} = useFragment(AddedToProjectV2EventFragment, queryRef)

  if (!project) {
    return <></>
  }

  const hightlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={hightlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      leadingIcon={TableIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupProjectV2Event rollupGroup={rollupGroup} />
        ) : (
          <AddedToProjectV2sRendering queryRefs={[queryRef]} />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const AddedToProjectV2sRendering = ({queryRefs}: {queryRefs: AddedToProjectV2Event$key[]}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {`${LABELS.timeline.addedThisTo} `}
      {queryRefs.map((queryRef, index) => (
        <Fragment key={index}>
          <InternalAddedToProjectV2sRendering
            queryRef={queryRef}
            first={index === 0}
            last={index === queryRefs.length - 1}
          />
        </Fragment>
      ))}
    </>
  )
}

const InternalAddedToProjectV2sRendering = ({
  queryRef,
  first,
  last,
}: Pick<AddedToProjectV2EventProps, 'queryRef'> & {
  first: boolean
  last: boolean
}) => {
  const {project} = useFragment(AddedToProjectV2EventFragment, queryRef)

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
