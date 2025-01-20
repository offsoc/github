import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {MilestonedEvent$key} from './__generated__/MilestonedEvent.graphql'
import {getWrappedMilestoneLink} from './DemilestonedEvent'
import {TimelineRow} from './row/TimelineRow'
import {MilestoneIcon} from '@primer/octicons-react'

type MilestonedEventProps = {
  queryRef: MilestonedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function MilestonedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: MilestonedEventProps): JSX.Element {
  const {actor, createdAt, milestoneTitle, milestone, databaseId} = useFragment(
    graphql`
      fragment MilestonedEvent on MilestonedEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        milestoneTitle
        milestone {
          url
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
      leadingIcon={MilestoneIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.addedToMilestone} {getWrappedMilestoneLink(milestone?.url, milestoneTitle)}
        {LABELS.timeline.milestone}{' '}
      </TimelineRow.Main>
    </TimelineRow>
  )
}
