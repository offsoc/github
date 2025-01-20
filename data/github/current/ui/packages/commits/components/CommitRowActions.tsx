import type {RepositoryNWO} from '@github-ui/current-repository'
import {blobPath, commitPath, repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {useAnalytics} from '@github-ui/use-analytics'
import {CodeIcon, CommentIcon, EllipsisIcon, FileCodeIcon} from '@primer/octicons-react'
import {Button, Tooltip} from '@primer/react'
import React from 'react'

import {useIsLoggingInformationProvided, useLoggingInfo} from '../contexts/CommitsLoggingContext'
import {shortSha} from '../utils/short-sha'
import {COMMENTS_CONTAINER_ID} from './Commit/comments/DiscussionComments'

export const BrowseRepositoryAtThisPoint = React.memo(WrappedBrowseRepositoryAtThisPoint)

function WrappedBrowseRepositoryAtThisPoint({repo, oid}: {repo: RepositoryNWO; oid: string}) {
  const browseRepoId = `browse-repo-${shortSha(oid)}`

  const {sendAnalyticsEvent} = useAnalytics()
  const {loggingPrefix, loggingPayload} = useLoggingInfo()
  const shouldLog = useIsLoggingInformationProvided()
  const loggingFunction = () => {
    if (shouldLog) {
      sendAnalyticsEvent(`${loggingPrefix}click`, 'COMMITS_BROWSE_REPOSITORY_AT_THIS_POINT_CLICKED', loggingPayload)
    }
  }
  return (
    <Tooltip aria-label="Browse repository at this point" id={browseRepoId} direction="sw">
      <a
        aria-labelledby={browseRepoId}
        href={repositoryTreePath({repo, action: 'tree', commitish: oid})}
        className="Button Button--iconOnly Button--invisible Button--small"
        data-testid="commit-row-browse-repo"
        onClick={loggingFunction}
      >
        <CodeIcon />
      </a>
    </Tooltip>
  )
}

export const ViewCodeAtThisPoint = React.memo(WrappedViewCodeAtThisPoint)

export function WrappedViewCodeAtThisPoint({repo, oid, path}: {repo: RepositoryNWO; oid: string; path: string}) {
  if (!path) return null

  const viewCodeId = `view-code-${shortSha(oid)}`

  return (
    <Tooltip aria-label="View code at this point" id={viewCodeId} direction="sw">
      <a
        aria-labelledby={viewCodeId}
        href={blobPath({owner: repo.ownerLogin, repo: repo.name, commitish: oid, filePath: path})}
        className="Button Button--iconOnly Button--invisible Button--small"
        data-testid="commit-row-view-code"
      >
        <FileCodeIcon />
      </a>
    </Tooltip>
  )
}

export function ViewCommitDetails({
  commitUrl,
  oid,
  softNavToCommit,
}: {
  commitUrl: string
  oid: string
  softNavToCommit?: boolean
}) {
  const sharedProps = {
    variant: 'invisible' as const,
    size: 'small' as const,
    sx: {fontFamily: 'var(--fontStack-monospace)', color: 'fg.muted'},
  }

  return (
    <Tooltip aria-label="View commit details" direction="s">
      {softNavToCommit ? (
        <Button as={Link} to={commitUrl} {...sharedProps}>
          {shortSha(oid)}
        </Button>
      ) : (
        <a className="Button--invisible Button--small Button text-mono" href={commitUrl} {...sharedProps}>
          <span className="Button-content">
            <span className="Button-label color-fg-muted">{shortSha(oid)}</span>
          </span>
        </a>
      )}
    </Tooltip>
  )
}

export function ToggleCommitDescription({
  showDescription,
  setShowDescription,
  oid,
}: {
  showDescription: boolean
  setShowDescription: (arg: boolean) => void
  oid: string
}) {
  const truncatedSha = shortSha(oid)
  const showDescriptionId = `show-description-${truncatedSha}`

  return (
    <Tooltip
      aria-label={`${!showDescription ? 'Show' : 'Hide'} description for ${truncatedSha}`}
      id={showDescriptionId}
      direction="se"
      className="ml-1"
    >
      <button
        className="Button Button--iconOnly Button--invisible Button--small"
        data-testid="commit-row-show-description-button"
        aria-labelledby={showDescriptionId}
        aria-pressed={showDescription}
        aria-expanded={showDescription}
        onClick={e => {
          e.preventDefault()
          setShowDescription(!showDescription)
        }}
      >
        <EllipsisIcon />
      </button>
    </Tooltip>
  )
}

export function CommitCommentCount({count, repo, oid}: {count?: number; repo: RepositoryNWO; oid: string}) {
  const commentCountId = `comment-count-${shortSha(oid)}`

  if (!count) {
    return null
  }

  return (
    <Tooltip aria-label={`View ${count} commit comment${count > 1 ? 's' : ''}`} id={commentCountId} direction="sw">
      <a
        aria-labelledby={commentCountId}
        href={`${commitPath({owner: repo.ownerLogin, repo: repo.name, commitish: oid})}#${COMMENTS_CONTAINER_ID}`}
        className="Button Button--invisible Button--small"
        data-testid="commit-row-comments"
      >
        <span className="Button-content color-fg-muted">
          <CommentIcon />
          <span className="Button-label">{count}</span>
        </span>
      </a>
    </Tooltip>
  )
}
