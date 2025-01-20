import {GitHubAvatar} from '@github-ui/github-avatar'
import {NewMarkdownViewer} from '@github-ui/markdown-viewer/NewMarkdownViewer'
import {userHovercardPath} from '@github-ui/paths'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {ChevronRightIcon} from '@primer/octicons-react'
import {AvatarStack, Button, Link, RelativeTime} from '@primer/react'
import {clsx} from 'clsx'
import {memo} from 'react'

import type {ThreadComment} from '../../utilities/copilot-task-types'
import sharedStyles from './GenerateFixPanel.module.css'
import styles from './PullRequestThread.module.css'

function extractCommentAuthors(comments: ThreadComment[]): Author[] {
  const uniqueAuthors = new Set<string>()
  const extractedAuthors = comments.reduce((authors, commentData) => {
    if (commentData.author && !uniqueAuthors.has(commentData.author.login)) {
      authors.push({
        avatarUrl: commentData.author.avatarUrl,
        login: commentData.author.login,
      })
      uniqueAuthors.add(commentData.author.login)
    }

    return authors
  }, [] as Author[])

  return extractedAuthors ?? []
}

interface Author {
  avatarUrl: string
  login: string
}

function Authors({authors}: {authors: Author[]}) {
  if (authors.length === 0) return null

  return (
    <AvatarStack>
      {authors.map(({login, avatarUrl}) => (
        <GitHubAvatar key={login} alt={login} size={18} src={avatarUrl} />
      ))}
    </AvatarStack>
  )
}

function ThreadComment({comment}: {comment: ThreadComment}) {
  const {author, body, createdAt} = comment
  const {avatarUrl, login} = author
  const createdData = new Date(createdAt)

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex flex-row gap-2">
        <GitHubAvatar
          data-hovercard-url={userHovercardPath({owner: login})}
          src={avatarUrl}
          size={24}
          alt={`@${login}`}
        />
        <Link
          className={clsx('color-fg-default f5 overflow-hidden', sharedStyles.actorName)}
          data-hovercard-url={userHovercardPath({owner: login})}
          href={login}
        >
          {login}
        </Link>
        <RelativeTime date={createdData} className="color-fg-muted">
          on {createdData.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}{' '}
        </RelativeTime>
      </div>
      <NewMarkdownViewer verifiedHTML={body as SafeHTMLString} />
    </div>
  )
}

export const PullThread = memo(function PullThread({comments, isBusy}: {comments: ThreadComment[]; isBusy: boolean}) {
  if (!isBusy) {
    return (
      <div className="d-flex flex-column gap-4">
        {comments.map(comment => (
          <ThreadComment key={comment.id} comment={comment} />
        ))}
      </div>
    )
  }

  const firstComment = comments[0]!
  const authors = extractCommentAuthors(comments)
  const repliesCount = comments.length - 1
  const repliesText = repliesCount > 1 ? `${repliesCount} replies` : '1 reply'
  return (
    <>
      <ThreadComment comment={firstComment} />
      <span>
        <Button
          aria-label="View thread in diff"
          className={clsx('color-fg-muted', styles.threadSummaryButton)}
          size="small"
          trailingVisual={ChevronRightIcon}
          variant="invisible"
        >
          <div className="d-flex flex-row flex-items-center gap-2 flex-justify-start">
            <span className="color-fg-muted">{repliesText}</span>
            <Authors authors={authors} />
          </div>
        </Button>
      </span>
    </>
  )
})
