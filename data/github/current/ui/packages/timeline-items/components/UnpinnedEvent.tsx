import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UnpinnedEvent$key} from './__generated__/UnpinnedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {PinIcon} from '@primer/octicons-react'

type UnpinnedEventProps = {
  queryRef: UnpinnedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UnpinnedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UnpinnedEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(
    graphql`
      fragment UnpinnedEvent on UnpinnedEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
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
      leadingIcon={PinIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.unpinned} `}</TimelineRow.Main>
    </TimelineRow>
  )
}
