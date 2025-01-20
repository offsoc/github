/* eslint-disable relay/unused-fields */
/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/must-colocate-fragment-spreads */
import {CLASS_NAMES} from '@github-ui/commenting/DomElements'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useCurrentUser} from '@github-ui/current-user'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {KeyIcon, LockIcon} from '@primer/octicons-react'
import {Button, CounterLabel, Flash} from '@primer/react'
import {clsx} from 'clsx'
import {useEffect, useMemo, useState, useTransition} from 'react'
import {useQueryLoader} from 'react-relay'
import {graphql} from 'relay-runtime'

import {useDiscussionComments} from '../../../contexts/DiscussionCommentsContext'
import type {CommitExtended, InitialCommentInfo} from '../../../types/commit-types'
import {isWeirichCommit} from '../../../utils/weirich-commit'
import styles from './Comment.module.css'
import {CommentLoading} from './CommentLoading'
import {ExistingCommitComments} from './ExistingCommitComments'
import {LockConversationDialog} from './LockConversationDialog'
import {NewCommitComment} from './NewCommitComment'
import {NotificationsFooter} from './NotificationFooter'

// id to jump to when navigating to the comments section from commits list
export const COMMENTS_CONTAINER_ID = 'comments'

export function DiscussionComments(props: {commit: CommitExtended; commentInfo: InitialCommentInfo}) {
  // Preload our required GraphQL data used in comments
  // We do this to avoid sending 2 requests for each rendered comment (1 for reactions, 1 for edit history)
  // This way we can send 1 request for all GQL comments and let Relay read the data from the store
  // We only preload the data for the first 60 comments to avoid loading all comments at once
  // Anything beyond the first 60 comments will be loaded on demand. More than a full page of comments is rare.
  const [queryReference, loadQuery] = useQueryLoader(graphql`
    query DiscussionComments_ReactionViewerLazyQuery($id: ID!) {
      node(id: $id) {
        ... on Commit {
          comments(last: 60) {
            nodes {
              id
              ...MarkdownEditHistoryViewer_comment
              ...ReactionViewerGroups
            }
          }
        }
      }
    }
  `)

  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      loadQuery({id: props.commit.globalRelayId}, {fetchPolicy: 'store-or-network'})
    })
  }, [loadQuery, props.commit.globalRelayId])

  return (
    <div
      className={clsx(
        'd-flex flex-column gap-2 pt-3',
        CLASS_NAMES.commentsContainer,
        styles['commit-discussion-comments'],
      )}
      id={COMMENTS_CONTAINER_ID}
    >
      {/* need key to trigger re-fetch and re-render when we soft nav between commits changes return */}
      {queryReference ? <DiscussionCommentsInternal {...props} key={props.commit.oid} /> : <CommentLoading />}
    </div>
  )
}

function DiscussionCommentsInternal({commit, commentInfo}: {commit: CommitExtended; commentInfo: InitialCommentInfo}) {
  const repo = useCurrentRepository()
  const currentUser = useCurrentUser()

  const {
    retry,
    loadMore,
    canLoadMore,
    addComment,
    deleteComment,
    updateComment,
    count: commentCount,
    comments,
    subscribed,
    providerState,
  } = useDiscussionComments()

  // Used for quote replies
  const [newCommentContent, setNewCommentContent] = useState<string | undefined>(undefined)
  const [locked, setLocked] = useState(commentInfo.locked)

  const isWeirichCommitValue = useMemo(() => isWeirichCommit(commit.oid, repo.id), [commit.oid, repo.id])

  useEffect(() => {
    if (ssrSafeWindow?.location.hash) {
      const urlFragment = ssrSafeWindow.location.hash.slice(1)
      const comment = comments.find(c => c.urlFragment === urlFragment)

      if (comment) {
        const commentElement = document.getElementById(urlFragment)
        if (commentElement) {
          commentElement.scrollIntoView()
          commentElement.focus()
        }
      }
    }
  }, [comments])

  return (
    <>
      <DiscussionCommentsHeader
        commitOid={commit.oid}
        commentCount={commentCount}
        canLock={commentInfo.canLock}
        locked={locked}
        setLocked={setLocked}
      />
      {providerState === 'loading' && <CommentLoading />}
      {providerState === 'error' && (
        <Flash className="d-flex flex-justify-between flex-items-center" variant="danger">
          <span>Failed to load comments.</span>
          <Button onClick={() => retry()}>Retry</Button>
        </Flash>
      )}
      {providerState === 'loaded' && canLoadMore && (
        <Button className="width-full" onClick={() => loadMore()}>
          Load more comments
        </Button>
      )}
      <ExistingCommitComments
        comments={comments}
        commit={commit}
        locked={locked}
        deleteComment={deleteComment}
        updateComment={updateComment}
        setNewCommentContent={setNewCommentContent}
      />
      {isWeirichCommitValue ? (
        <div className="text-center">
          {[...Array(38)].map((_, i) => (
            <img
              key={`rose-${i}`}
              alt="rose"
              src="/images/icons/emoji/rose.png"
              className={styles['discussion-comments-rose']}
            />
          ))}
        </div>
      ) : null}
      {providerState === 'loaded' || comments.length !== 0 ? (
        <>
          <NewCommitComment
            commitOid={commit.oid}
            onAddComment={addComment}
            newCommentContent={newCommentContent}
            canComment={commentInfo.canComment}
            locked={locked}
            repoArchived={commentInfo.repoArchived}
          />
          {currentUser ? <NotificationsFooter commitOid={commit.oid} subscribed={subscribed ?? false} /> : null}
        </>
      ) : null}
    </>
  )
}

function DiscussionCommentsHeader({
  commitOid,
  commentCount,
  locked,
  setLocked,
  canLock,
}: {
  commitOid: string
  commentCount: number | undefined
  locked: boolean
  setLocked: (locked: boolean) => void
  canLock: boolean
}) {
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  return (
    <div className="d-flex flex-items-center flex-justify-between">
      <h2 className="sr-only">{commentCount} commit comments</h2>
      <div className="d-flex flex-items-center">
        <div className="h4 pr-2">Comments</div>
        {commentCount !== undefined && <CounterLabel>{commentCount}</CounterLabel>}
      </div>
      {canLock && (
        <>
          <Button
            leadingVisual={locked ? KeyIcon : LockIcon}
            variant="invisible"
            onClick={() => setLockDialogOpen(true)}
          >
            {locked ? 'Unlock' : 'Lock'} conversation
          </Button>
          {lockDialogOpen && (
            <LockConversationDialog
              commitOid={commitOid}
              locked={locked}
              onClose={newLockedState => {
                setLockDialogOpen(false)
                if (newLockedState !== undefined) {
                  setLocked(newLockedState)
                }
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
