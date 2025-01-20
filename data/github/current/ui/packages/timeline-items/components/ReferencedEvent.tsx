import {Box} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {Ago} from './row/Ago'
import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ReferencedEvent$key} from './__generated__/ReferencedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {ReferencedEventInner, type ReferencedEventInnerProps} from './ReferencedEventInner'
import {CommitIcon} from '@primer/octicons-react'

type ReferencedEventProps = {
  queryRef: ReferencedEvent$key
  rollupGroup?: Record<string, ReferencedEvent$key[]>
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  viewer: string | null
}

export const ReferencedEventFragment = graphql`
  fragment ReferencedEvent on ReferencedEvent {
    databaseId
    willCloseSubject
    subject {
      __typename
    }
    actor {
      ...TimelineRowEventActor
    }
    commit {
      ...ReferencedEventInner
    }
    createdAt
  }
`

export function ReferencedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  viewer,
}: ReferencedEventProps): JSX.Element {
  const {actor, createdAt, commit, databaseId, subject, willCloseSubject} = useFragment(
    ReferencedEventFragment,
    queryRef,
  )

  if (commit === null) {
    return <></>
  }

  const highlighted = String(databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup && rollupGroup['ReferencedEvent'] ? rollupGroup['ReferencedEvent'] : [queryRef]
  const numItems = rolledUpGroup.length

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      onLinkClick={onLinkClick}
      showAgoTimestamp={false}
      leadingIcon={CommitIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.addedCommitsThatReferences(numItems)} `}
        <Ago timestamp={new Date(createdAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2, ml: [0, 0, 4, 4]}}>
          {rolledUpGroup.map((itemQueryRef, index) => (
            <ReferencedItem
              key={`${databaseId}_${index}`}
              itemQueryRef={itemQueryRef}
              subjectType={subject.__typename}
              viewerLogin={viewer}
              willCloseSubject={willCloseSubject}
            />
          ))}
        </Box>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

function ReferencedItem({
  itemQueryRef,
  ...props
}: {itemQueryRef: ReferencedEvent$key} & Omit<ReferencedEventInnerProps, 'commitKey'>) {
  const {commit} = useFragment(ReferencedEventFragment, itemQueryRef)
  if (!commit) return null

  return <ReferencedEventInner commitKey={commit} {...props} />
}
