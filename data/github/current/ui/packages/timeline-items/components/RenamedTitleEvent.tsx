import {Text} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {RenamedTitleEvent$key} from './__generated__/RenamedTitleEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {PencilIcon} from '@primer/octicons-react'

type RenamedTitleEventProps = {
  queryRef: RenamedTitleEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function RenamedTitleEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: RenamedTitleEventProps): JSX.Element {
  const {actor, createdAt, currentTitle, previousTitle, databaseId} = useFragment(
    graphql`
      fragment RenamedTitleEvent on RenamedTitleEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        currentTitle
        previousTitle
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
      leadingIcon={PencilIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.renamedTitle}{' '}
        <Text sx={{textDecoration: 'line-through', color: 'fg.default'}}>{previousTitle}</Text>{' '}
        <Text sx={{color: 'fg.default'}}>{currentTitle}</Text>{' '}
      </TimelineRow.Main>
    </TimelineRow>
  )
}
