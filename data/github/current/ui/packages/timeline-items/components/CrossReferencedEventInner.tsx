import {Octicon, Box, Text, Link, Tooltip} from '@primer/react'
import {useFragment, graphql} from 'react-relay'

import {getSourceIcon} from '../utils/get-source-icon'
import {issueHovercardPath, issueLinkedPullRequestHovercardPath} from '@github-ui/paths'
import {LockIcon} from '@primer/octicons-react'
import {LABELS} from '../constants/labels'
import type {CrossReferencedEventInner$key} from './__generated__/CrossReferencedEventInner.graphql'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'

type CrossReferencedEventInnerProps = {
  event: CrossReferencedEventInner$key
  targetRepositoryId: string | undefined
}

export function CrossReferencedEventInner({event, targetRepositoryId}: CrossReferencedEventInnerProps): JSX.Element {
  const source = useFragment(
    graphql`
      fragment CrossReferencedEventInner on ReferencedSubject {
        __typename
        ... on Issue {
          id
          issueTitleHTML: titleHTML
          url
          number
          stateReason
          repository {
            id
            name
            isPrivate
            owner {
              login
            }
          }
        }
        ... on PullRequest {
          id
          pullTitleHTML: titleHTML
          url
          number
          state
          isDraft
          isInMergeQueue
          repository {
            id
            name
            isPrivate
            owner {
              login
            }
          }
        }
      }
    `,
    event,
  )
  const isIssue = source.__typename === 'Issue'
  const isPullRequest = source.__typename === 'PullRequest'

  if (!isIssue && !isPullRequest) {
    return <></>
  }

  const state = isPullRequest ? source.state : undefined
  const stateReason = isIssue ? source.stateReason : undefined
  const isDraft = isPullRequest ? source.isDraft : undefined
  const isInMergeQueue = isPullRequest ? source.isInMergeQueue : undefined
  const icon = getSourceIcon(source.__typename, state, stateReason, isDraft, isInMergeQueue)

  const dataHovercardUrl =
    source.repository && source.number
      ? isIssue
        ? issueHovercardPath({
            repo: source.repository.name,
            owner: source.repository.owner.login,
            issueNumber: source.number,
          })
        : issueLinkedPullRequestHovercardPath({
            owner: source.repository.owner.login,
            repo: source.repository.name,
            pullRequestNumber: source.number,
          })
      : null

  const repoIssueText =
    source.repository.id === targetRepositoryId
      ? `#${source.number}`
      : `${source.repository.owner.login}/${source.repository.name}#${source.number}`

  const privateDescriptionId = `${source.id}-private-description`

  // Defining the title in this way avoids a problem that stems from the titleHTML field being defined as different
  // types in the Issue and PullRequest platform objects.
  const titleHTML = isIssue ? source.issueTitleHTML : source.pullTitleHTML

  return (
    <Box
      as="li"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Octicon icon={icon.icon} size={16} sx={{color: icon.color, mt: 1}} />
      <Link
        sx={{color: 'fg.default', minWidth: 0}}
        href={source.url}
        data-hovercard-url={dataHovercardUrl}
        aria-describedby={source.repository.isPrivate ? privateDescriptionId : undefined}
        inline
      >
        <SafeHTMLBox
          as="bdi"
          sx={{display: 'inline', wordBreak: 'break-word'}}
          className="markdown-title"
          html={titleHTML as SafeHTMLString}
        />
        <Text sx={{color: 'fg.muted'}}> {repoIssueText}</Text>
      </Link>
      {source.repository.isPrivate && source.repository.id !== targetRepositoryId && (
        <>
          <Tooltip
            aria-label={LABELS.crossReferencedEventLockTooltip(
              `${source.repository.owner.login}/${source.repository.name}`,
            )}
          >
            <Octicon icon={LockIcon} />
          </Tooltip>
          <span id={privateDescriptionId} className="sr-only">
            {LABELS.crossReferencedEvent.privateEventDescription}
          </span>
        </>
      )}
    </Box>
  )
}
