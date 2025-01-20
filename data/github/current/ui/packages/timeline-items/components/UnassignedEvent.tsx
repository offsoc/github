import {PersonIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UnassignedEvent$key} from './__generated__/UnassignedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {Fragment} from 'react'
import {Assignee} from './Assignee'
import {RolledupAssignedEvent} from './RolledupAssignedEvent'
import type {AssignedEvent$key} from './__generated__/AssignedEvent.graphql'
import styles from './assignees.module.css'

type UnassignedEventProps = {
  queryRef: UnassignedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: Record<string, Array<AssignedEvent$key | AssignedEvent$key>>
}

const UnassignedEventFragment = graphql`
  fragment UnassignedEvent on UnassignedEvent {
    databaseId
    createdAt
    actor {
      login
      ...TimelineRowEventActor
    }
    assignee {
      ... on User {
        login
      }
      ... on Mannequin {
        login
      }
      ... on Organization {
        login
      }
      ... on Bot {
        login
      }
    }
  }
`

export function UnassignedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
}: UnassignedEventProps): JSX.Element {
  const {actor, createdAt, assignee, databaseId} = useFragment(UnassignedEventFragment, queryRef)

  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={PersonIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupAssignedEvent rollupGroup={rollupGroup} />
        ) : (
          <RemovedAssigneesRendering
            queryRefs={[queryRef]}
            selfAssigned={actor?.login === assignee?.login}
            rollup={false}
          />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const RemovedAssigneesRendering = ({
  queryRefs,
  selfAssigned,
  rollup,
}: {
  queryRefs: UnassignedEvent$key[]
  selfAssigned: boolean
  rollup: boolean
}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {!selfAssigned && `${LABELS.timeline.unassigned} `}
      {queryRefs.map((queryRef, index) => (
        <Fragment key={index}>
          <InternalRemovedAssigneesRendering
            queryRef={queryRef}
            rollup={rollup}
            first={index === 0}
            last={index === queryRefs.length - 1}
          />
        </Fragment>
      ))}
    </>
  )
}

const InternalRemovedAssigneesRendering = ({
  queryRef,
  rollup,
  first,
  last,
}: Pick<UnassignedEventProps, 'queryRef'> & {
  rollup: boolean
  first: boolean
  last: boolean
}) => {
  const {assignee, actor} = useFragment(UnassignedEventFragment, queryRef)

  if (!assignee?.login) {
    return null
  }

  return (
    <div className={styles.assigneeEventContainer}>
      {actor?.login === assignee?.login && !rollup ? (
        LABELS.timeline.removedTheirAssignment
      ) : (
        <>
          {!first && !last && <div className={styles.assigneeMarginRight}>,</div>}
          {!first && last && <div className={styles.assigneeMarginHorizontal}>{LABELS.timeline.and}</div>}
          <Assignee assigneeLogin={assignee?.login} />
        </>
      )}
    </div>
  )
}
