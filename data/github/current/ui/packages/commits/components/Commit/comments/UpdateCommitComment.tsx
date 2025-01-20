import type {MarkdownComposerRef} from '@github-ui/commenting/useMarkdownBody'
import {useRef} from 'react'

import {useCommenting} from '../../../hooks/use-commenting'
import type {CommitComment} from '../../../types/commit-types'
import {CommitCommentEditor} from './CommitCommentEditor'

export function UpdateCommitComment({
  comment,
  commitOid,
  onCancel,
  onUpdate,
}: {
  comment: CommitComment
  commitOid: string
  onCancel: () => void
  onUpdate: (comment: CommitComment) => void
}) {
  const {editComment} = useCommenting()
  const commentEditor = useRef<MarkdownComposerRef>(null)

  const onSave = async (markdown: string) => {
    const result = await editComment(markdown, comment)

    if (result.updatedFields) {
      onUpdate({
        ...comment,
        ...result.updatedFields,
      })
    } else {
      // TODO - handle error
    }
  }

  return (
    <CommitCommentEditor
      commitOid={commitOid}
      initialMarkdown={comment.body}
      ref={commentEditor}
      onSave={onSave}
      onCancel={onCancel}
      referenceId={`${commitOid}-${comment.id}`}
      buttonText="Update comment"
    />
  )
}
