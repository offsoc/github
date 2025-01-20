import {Button, Link} from '@primer/react'
import {graphql, useRelayEnvironment} from 'react-relay'
import {useFragment} from 'react-relay/hooks'
import {useCallback} from 'react'
import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {MarkedAsDuplicateEvent$key} from './__generated__/MarkedAsDuplicateEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {DuplicateIcon} from '@primer/octicons-react'
import {commitUnmarkIssueAsDuplicateMutation} from '../mutations/unmark-issue-as-duplicate-mutation'

type MarkedAsDuplicateEventProps = {
  queryRef: MarkedAsDuplicateEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  currentIssueId: string
}

export function MarkedAsDuplicateEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  currentIssueId,
}: MarkedAsDuplicateEventProps): JSX.Element {
  const environment = useRelayEnvironment()

  const {actor, createdAt, canonical, databaseId, viewerCanUndo, pendingUndo, id} = useFragment(
    graphql`
      fragment MarkedAsDuplicateEvent on MarkedAsDuplicateEvent {
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        canonical {
          ... on Issue {
            url
            number
            id
          }
          ... on PullRequest {
            url
            number
            id
          }
        }
        databaseId
        viewerCanUndo
        pendingUndo
        id
      }
    `,
    queryRef,
  )

  const unMarkAsDuplicate = useCallback(() => {
    if (!canonical?.id) return

    const input = {duplicateId: currentIssueId, cannonicalId: canonical.id}
    commitUnmarkIssueAsDuplicateMutation({environment, input, eventId: id})
  }, [canonical?.id, environment, currentIssueId, id])

  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={DuplicateIcon}
      fillRow={viewerCanUndo}
    >
      <TimelineRow.Main>
        {LABELS.timeline.markedAsDuplicate}
        <Link href={canonical?.url} sx={{color: 'fg.default', mx: 1}} inline>
          #{canonical?.number}
        </Link>
      </TimelineRow.Main>
      {viewerCanUndo && !pendingUndo && canonical?.number && (
        <TimelineRow.Trailing>
          <Button onClick={unMarkAsDuplicate} aria-label={LABELS.undoMarkIssueAsDuplicate(canonical.number)}>
            Undo
          </Button>
        </TimelineRow.Trailing>
      )}
    </TimelineRow>
  )
}
