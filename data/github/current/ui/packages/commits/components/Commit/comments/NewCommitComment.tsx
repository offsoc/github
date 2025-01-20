import {ReadonlyCommentBox} from '@github-ui/comment-box/ReadonlyCommentBox'
import {blockedCommentingReason} from '@github-ui/commenting/blockedCommentingReason'
import {IDS} from '@github-ui/commenting/DomElements'
import type {MarkdownComposerRef} from '@github-ui/commenting/useMarkdownBody'
import {LockIcon} from '@primer/octicons-react'
import {Heading} from '@primer/react'
import {useRef} from 'react'

import {useCommenting} from '../../../hooks/use-commenting'
import type {CommitComment} from '../../../types/commit-types'
import {CommitCommentEditor} from './CommitCommentEditor'

export function NewCommitComment({
  commitOid,
  onAddComment,
  newCommentContent,
  canComment,
  locked,
  repoArchived,
}: {
  commitOid: string
  onAddComment: (comment: CommitComment) => void
  newCommentContent?: string
  canComment: boolean
  locked: boolean
  repoArchived: boolean
}) {
  const {addComment} = useCommenting()

  const commentEditor = useRef<MarkdownComposerRef>(null)

  const onSave = async (markdown: string, resetMarkdownBody: () => void) => {
    const result = await addComment(markdown)

    if (result.comment) {
      onAddComment(result.comment)
      resetMarkdownBody()
    } else {
      // TODO - handle error
    }
  }

  const reason = blockedCommentingReason(repoArchived, locked)

  return (
    <div className="d-flex flex-column gap-2 pt-3">
      <Heading as="h2" className="h4">
        Add a comment
      </Heading>
      {canComment ? (
        <div id={IDS.issueCommentComposer}>
          <CommitCommentEditor
            commitOid={commitOid}
            ref={commentEditor}
            onSave={onSave}
            referenceId={`new-discussion-comment-${commitOid}`}
            commentContent={newCommentContent}
            buttonText="Comment on this commit"
          />
        </div>
      ) : (
        <ReadonlyCommentBox icon={LockIcon} reason={reason} />
      )}
    </div>
  )
}
