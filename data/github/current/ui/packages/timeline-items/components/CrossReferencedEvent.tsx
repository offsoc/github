import {Box} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {CrossReferencedEvent$key} from './__generated__/CrossReferencedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {CrossReferencedEventInner} from './CrossReferencedEventInner'
import {LinkExternalIcon} from '@primer/octicons-react'
import {Ago} from './row/Ago'
import {createIssueEventExternalUrl} from '../utils/urls'

export type ReferenceTypes = 'issues' | 'prs' | 'mixed'

type RollupGroup = CrossReferencedEvent$key & {source?: {__typename: string}; createdAt?: string}
type RollupGroups = Record<string, RollupGroup[]>

type CrossReferencedEventProps = {
  queryRef: CrossReferencedEvent$key & {createdAt?: string}
  rollupGroup?: RollupGroups
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

type sourceType = 'Issue' | 'PullRequest'

export const CrossReferencedEventFragment = graphql`
  fragment CrossReferencedEvent on CrossReferencedEvent {
    referencedAt
    willCloseTarget
    databaseId
    target {
      ... on Issue {
        repository {
          id
        }
      }
    }
    innerSource: source {
      __typename
      ...CrossReferencedEventInner
    }
    actor {
      ...TimelineRowEventActor
    }
  }
`

export function CrossReferencedEvent({
  queryRef,
  issueUrl,
  highlightedEventId,
  onLinkClick,
  refAttribute,
  rollupGroup,
}: CrossReferencedEventProps): JSX.Element {
  const {actor, referencedAt, willCloseTarget, innerSource, databaseId, target} = useFragment(
    CrossReferencedEventFragment,
    queryRef,
  )

  const isIssue = innerSource.__typename === 'Issue'
  const isPullRequest = innerSource.__typename === 'PullRequest'

  if (!isIssue && !isPullRequest) {
    return <></>
  }

  const rolledUpGroup = rollupGroup && rollupGroup['CrossReferencedEvent'] ? rollupGroup['CrossReferencedEvent'] : []
  const hasMixedReferenceTypes = rolledUpGroup.some(item => item.source?.__typename !== innerSource.__typename)

  const message = buildMessage(innerSource.__typename, willCloseTarget, rolledUpGroup?.length, hasMixedReferenceTypes)

  const highlighted = String(databaseId) === highlightedEventId

  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={referencedAt}
      showAgoTimestamp={false}
      deepLinkUrl={issueUrl}
      onLinkClick={onLinkClick}
      leadingIcon={LinkExternalIcon}
    >
      <TimelineRow.Main>
        {message}{' '}
        {eventCreatedAt && (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        )}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <section aria-label={LABELS.crossReferencedEvent.sectionLabel}>
          <Box
            as="ul"
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {itemsToRender.map((item, index) => (
              <CrossReferenceItem
                key={`${databaseId}_${index}`}
                event={item}
                targetRepositoryId={target.repository?.id}
              />
            ))}
          </Box>
        </section>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function CrossReferenceItem({
  event,
  targetRepositoryId,
}: {
  event: CrossReferencedEvent$key
  targetRepositoryId: string | undefined
}) {
  const {innerSource} = useFragment(CrossReferencedEventFragment, event)
  return <CrossReferencedEventInner event={innerSource} targetRepositoryId={targetRepositoryId} />
}

function buildMessage(
  sourceType: sourceType,
  willCloseTarget: boolean,
  rolledUpGroupLength: number,
  mixedReferenceTypes: boolean,
) {
  if (willCloseTarget) {
    return LABELS.timeline.linkedAClosingPR
  }
  if (rolledUpGroupLength === 0 || mixedReferenceTypes) {
    return LABELS.timeline.mentionedThisIn
  }
  if (sourceType === 'Issue') {
    return `${LABELS.timeline.mentionedThisIn} in ${rolledUpGroupLength} issues`
  } else {
    return `${LABELS.timeline.mentionedThisIn} in ${rolledUpGroupLength} pull requests`
  }
}

function getCreatedAt(createdAt: string | undefined, rollupGroup: RollupGroup[]) {
  if (rollupGroup.length === 0) {
    return createdAt
  }
  let latest = undefined

  if (createdAt) {
    latest = new Date(createdAt).valueOf()
  }

  for (const event of rollupGroup) {
    if (event.createdAt) {
      const current = new Date(event.createdAt).valueOf()
      if (!latest || current > latest) {
        latest = current
      }
    }
  }

  return latest
}
