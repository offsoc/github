import {TimelineRow} from '@github-ui/timeline-items/TimelineRow'
import {GitMergeIcon} from '@primer/octicons-react'
import {BranchName, Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import type {MergedEvent_mergedEvent$key} from './__generated__/MergedEvent_mergedEvent.graphql'

function MergedViaMergeQueueMainContent({
  hasActor,
  mergeRefName,
  commitUrl,
  commitAbbreviatedOid,
}: {
  hasActor: boolean
  mergeRefName: string
  commitUrl?: string
  commitAbbreviatedOid?: string
}) {
  return (
    <span>
      {hasActor ? 'merged' : 'Merged'} via the queue into{' '}
      <BranchName sx={{':hover': {textDecoration: 'none'}, color: 'fg.muted'}}>{mergeRefName}</BranchName>{' '}
      {commitUrl && commitAbbreviatedOid && (
        <span>
          with commit{' '}
          <Link inline href={commitUrl} sx={{fontWeight: 'var(--base-text-weight-semibold)', color: 'fg.default'}}>
            {commitAbbreviatedOid}
          </Link>{' '}
        </span>
      )}
    </span>
  )
}

function MergedManuallyMainContent({
  mergeRefName,
  commitUrl,
  commitAbbreviatedOid,
}: {
  mergeRefName: string
  commitUrl?: string
  commitAbbreviatedOid?: string
}) {
  return (
    <span>
      {commitUrl && commitAbbreviatedOid ? (
        <span>
          merged commit{' '}
          <Link href={commitUrl} sx={{fontWeight: 'var(--base-text-weight-semibold)', color: 'fg.default'}}>
            {commitAbbreviatedOid}
          </Link>{' '}
        </span>
      ) : (
        <span>merged this pull request</span>
      )}
      into <BranchName sx={{':hover': {textDecoration: 'none'}, color: 'fg.muted'}}>{mergeRefName}</BranchName>{' '}
    </span>
  )
}

export type MergedEventProps = {
  queryRef: MergedEvent_mergedEvent$key
  pullRequestUrl: string
}

export function MergedEvent({queryRef, pullRequestUrl}: MergedEventProps) {
  const {actor, mergeCommit, mergeRefName, viaMergeQueue, viaMergeQueueAPI, createdAt, databaseId} = useFragment(
    graphql`
      fragment MergedEvent_mergedEvent on MergedEvent {
        actor {
          ...TimelineRowEventActor
        }
        mergeCommit: commit {
          abbreviatedOid
          oid
        }
        mergeRefName
        viaMergeQueue
        viaMergeQueueAPI
        createdAt
        databaseId
      }
    `,
    queryRef,
  )

  const displayActor = !viaMergeQueue || viaMergeQueueAPI ? actor : null
  const commitUrl = mergeCommit && `${pullRequestUrl}/commits/${mergeCommit.oid as string}`
  const commitAbbreviatedOid = mergeCommit?.abbreviatedOid

  return (
    <TimelineRow
      actor={displayActor}
      createdAt={createdAt}
      deepLinkUrl={`${pullRequestUrl}#event-${databaseId}`}
      highlighted={false}
      iconColoring={{color: 'white', backgroundColor: 'done.emphasis'}}
      leadingIcon={GitMergeIcon}
    >
      <TimelineRow.Main>
        {viaMergeQueue ? (
          <MergedViaMergeQueueMainContent
            commitAbbreviatedOid={commitAbbreviatedOid}
            commitUrl={commitUrl ?? undefined}
            hasActor={!!displayActor}
            mergeRefName={mergeRefName}
          />
        ) : (
          <MergedManuallyMainContent
            commitAbbreviatedOid={commitAbbreviatedOid}
            commitUrl={commitUrl ?? undefined}
            mergeRefName={mergeRefName}
          />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}
