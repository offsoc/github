import {ActivityHeader} from '@github-ui/commenting/ActivityHeader'
import {CommentActions, type CommentData} from '@github-ui/commenting/CommentActions'
import type {CommentHeaderProps} from '@github-ui/commenting/CommentHeader'
import {useCurrentRepository} from '@github-ui/current-repository'
import {MarkdownEditHistoryViewerQueryComponent} from '@github-ui/markdown-edit-history-viewer/MarkdownEditHistoryViewer'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {ReactionViewerQueryComponent} from '@github-ui/reaction-viewer/ReactionViewer'
import {ReactionViewerLoading} from '@github-ui/reaction-viewer/ReactionViewerLoading'
import {Suspense, useRef, useState} from 'react'

import {useCommenting} from '../../../hooks/use-commenting'
import {mapCommitCommentToComment} from '../../../hooks/use-fetch-commit-thread'
import type {CommitComment} from '../../../types/commit-types'
import type {Commit} from '../../../types/shared'
import {shortSha} from '../../../utils/short-sha'
import {UpdateCommitComment} from './UpdateCommitComment'

export function ExistingCommitComments({
  comments,
  commit,
  locked,
  deleteComment,
  updateComment,
  setNewCommentContent,
}: {
  comments: CommitComment[]
  commit: Commit
  locked: boolean
  deleteComment: (commentId: CommitComment['id']) => void
  updateComment: (comment: CommitComment) => void
  setNewCommentContent: (content?: string) => void
}) {
  if (comments.length === 0) {
    return null
  }

  return (
    <div className="d-flex flex-column gap-3">
      {comments.map(comment => {
        return (
          <ExistingCommitComment
            key={comment.id}
            comment={comment}
            commit={commit}
            locked={locked}
            deleteComment={deleteComment}
            updateComment={updateComment}
            setNewCommentContent={setNewCommentContent}
          />
        )
      })}
    </div>
  )
}

function ExistingCommitComment({
  comment,
  commit,
  locked,
  deleteComment: onDeleteComment,
  updateComment,
  setNewCommentContent,
}: {
  comment: CommitComment
  commit: Commit
  locked: boolean
  deleteComment: (commentId: CommitComment['id']) => void
  updateComment: (comment: CommitComment) => void
  setNewCommentContent: (content?: string) => void
}) {
  const repo = useCurrentRepository()

  const [isEditing, setIsEditing] = useState(false)
  const [isMinimized, setIsMinimized] = useState(comment.isHidden)
  const commentRef = useRef<HTMLDivElement>(null)
  const {deleteComment, hideComment, unhideComment} = useCommenting()

  const onDelete = async () => {
    const result = await deleteComment(comment.id.toString())

    if (result === 'canceled') {
      return
    }

    if (result === 'error') {
      // TODO - handle error
      return
    }

    if (result === 'success') {
      onDeleteComment(comment.id)
    }
  }

  const onUpdate = (updatedComment: CommitComment) => {
    updateComment(updatedComment)
    setIsEditing(false)
  }

  const onHide = async (reason: string) => {
    const result = await hideComment(comment.id.toString(), reason)

    if (result === 'error') {
      // TODO - handle error
      return
    }

    if (result === 'success') {
      updateComment({...comment, isHidden: true, minimizedReason: reason})
      setIsMinimized(true)
    }
  }

  const onUnhide = async () => {
    const result = await unhideComment(comment.id.toString())

    if (result === 'error') {
      // TODO - handle error
      return
    }

    if (result === 'success') {
      updateComment({...comment, isHidden: false, minimizedReason: null})
      setIsMinimized(false)
    }
  }

  // how to handle multiple authors?
  const commentSubjectAuthorLogin = commit.authors.length > 0 ? commit.authors[0]?.login : ''

  const commentDataWithoutFragment: Omit<CommentData, ' $fragmentSpreads'> = {
    ...mapCommitCommentToComment(comment, commit, repo),
    referenceText: shortSha(commit.oid),
  }

  return (
    <div className="border rounded-2" ref={commentRef} id={comment.urlFragment}>
      <CommitCommentHeader
        comment={commentDataWithoutFragment as CommentData}
        commentAuthorLogin={comment.author.login}
        commentSubjectAuthorLogin={commentSubjectAuthorLogin}
        commentSubjectType="commit"
        avatarUrl={comment.author.avatarUrl}
        isMinimized={isMinimized}
        editComment={() => {
          setIsEditing(true)
        }}
        onReplySelect={setNewCommentContent}
        onMinimize={setIsMinimized}
        navigate={() => {}}
        hideComment={onHide}
        unhideComment={onUnhide}
        deleteComment={onDelete}
        commentRef={commentRef}
        showEditHistory={comment.viewerCanReadUserContentEdits && !!comment.lastUserContentEdit}
        commitComment={comment}
      />
      {isMinimized ? null : isEditing ? (
        <div className="m-2">
          <UpdateCommitComment
            comment={comment}
            commitOid={commit.oid}
            onUpdate={onUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="d-flex flex-column m-3 gap-3" style={{gap: '12px'}}>
          <div className="markdown-body" data-turbolinks="false">
            <MarkdownViewer
              disabled={false}
              verifiedHTML={comment.htmlBody}
              markdownValue={comment.body}
              onChange={() => {}}
              onLinkClick={() => {}}
              teamHovercardsEnabled={true}
            />
          </div>
          <Suspense fallback={<ReactionViewerLoading />}>
            <ReactionViewerQueryComponent id={comment.relayId} subjectLocked={locked} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
interface CommitCommentHeaderProps extends CommentHeaderProps {
  showEditHistory: boolean
  commitComment: CommitComment
}

function CommitCommentHeader({hideActions, ...props}: CommitCommentHeaderProps) {
  let editHistoryComponent = null

  if (props.showEditHistory) {
    const comment = props.commitComment

    editHistoryComponent = (
      <Suspense fallback={null}>
        <MarkdownEditHistoryViewerQueryComponent id={comment.relayId} />
      </Suspense>
    )
  }

  return (
    <ActivityHeader
      {...props}
      actions={hideActions ? undefined : <CommentActions {...props} editHistoryComponent={editHistoryComponent} />}
    />
  )
}
