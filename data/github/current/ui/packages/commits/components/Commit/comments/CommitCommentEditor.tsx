import {CommentBox, type CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import {type MarkdownComposerRef, useMarkdownBody} from '@github-ui/commenting/useMarkdownBody'
import {useCurrentRepository} from '@github-ui/current-repository'
import {forwardRef, useCallback, useEffect, useRef, useState} from 'react'

const CommitCommentEditor = forwardRef<
  MarkdownComposerRef,
  {
    commentContent?: string
    initialMarkdown?: string
    commitOid: string
    onCancel?: () => void
    onSave: (markdown: string, restMarkdownBody: () => void) => Promise<void>
    referenceId: string
    buttonText: string
  }
>(({initialMarkdown, commitOid, onCancel, onSave, referenceId, buttonText, commentContent}, ref) => {
  const [saving, setSaving] = useState<boolean>(false)
  const commentBoxRef = useRef<CommentBoxHandle | null>(null)
  const definedCommentContent = useRef<string | undefined>(undefined)
  const repo = useCurrentRepository()

  const onChange = useCallback(() => {}, [])

  const {markdownBody, resetMarkdownBody, markdownValidationResult, handleMarkdownBodyChanged} = useMarkdownBody({
    commentBoxRef,
    markdownComposerRef: ref,
    onChange,
    onCancel: () => {},
    referenceId,
  })

  useEffect(() => {
    // Don't override the markdown saved in the session
    if (initialMarkdown && !markdownBody) {
      handleMarkdownBodyChanged(initialMarkdown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMarkdown])

  useEffect(() => {
    if (commentContent && definedCommentContent.current !== commentContent) {
      handleMarkdownBodyChanged(commentContent)
      definedCommentContent.current = commentContent
      setTimeout(() => {
        if (commentBoxRef.current) {
          commentBoxRef.current?.scrollIntoView()
          commentBoxRef.current?.focus()
        }
      }, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentContent])

  const onSaveInt = async () => {
    setSaving(true)
    await onSave(markdownBody, resetMarkdownBody)
    setSaving(false)
  }

  return (
    <CommentBox
      ref={commentBoxRef}
      validationResult={markdownValidationResult}
      disabled={saving}
      onChange={newMarkdown => {
        handleMarkdownBodyChanged(newMarkdown)
      }}
      onCancel={() => {
        handleMarkdownBodyChanged(initialMarkdown ?? '')
        onCancel && onCancel()
      }}
      onSave={onSaveInt}
      saveButtonText={buttonText}
      saveButtonTrailingIcon={false}
      value={markdownBody}
      teamHovercardsEnabled
      fileUploadsEnabled
      subject={{
        type: 'commit',
        id: {
          id: commitOid,
        },
        repository: {
          databaseId: repo.id,
          nwo: repo.ownerLogin,
          slashCommandsEnabled: false,
        },
      }}
    />
  )
})

CommitCommentEditor.displayName = 'CommitCommentEditor'
export {CommitCommentEditor}
