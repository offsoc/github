import {CommentBox, type CommentBoxConfig, type CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import type {Subject} from '@github-ui/comment-box/subject'
import {validateIssueBody} from '@github-ui/entity-validators'
import {testIdProps} from '@github-ui/test-id-props'
import {AlertIcon} from '@primer/octicons-react'
import {Flash, Octicon} from '@primer/react'
import {type RefObject, useEffect, useId, useRef, useState} from 'react'

import {LABELS} from '../constants/labels'
import {TEST_IDS} from '../constants/test-ids'

export type IssueBodyEditorProps = {
  subjectId: string
  subject: Subject
  body: string
  bodyIsStale?: boolean
  onChange: (newMarkdown: string) => void
  onCancel: (reset: boolean, returnRef?: RefObject<CommentBoxHandle>) => void
  onCommit: (subjectId: string) => void
  commentBoxConfig?: CommentBoxConfig
  editorDisabled?: boolean
  trailingIcon?: boolean
}

export function IssueBodyEditor({
  subjectId,
  subject,
  body,
  bodyIsStale,
  onChange,
  onCancel,
  onCommit,
  commentBoxConfig,
  editorDisabled = false,
  trailingIcon = true,
}: IssueBodyEditorProps) {
  const [validationError, setValidationError] = useState<string | undefined>(undefined)
  const ref = useRef<CommentBoxHandle>(null)

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus()
    }
  }, [ref])

  const validationResult = validateIssueBody(body)

  const validationErrorId = useId()
  return (
    <>
      <CommentBox
        disabled={editorDisabled}
        saveButtonTrailingIcon={trailingIcon}
        subject={subject}
        value={body}
        placeholder={LABELS.issueBodyPlaceholder}
        onChange={(newMarkdown: string) => {
          if (validationError) {
            setValidationError(undefined)
          }
          onChange(newMarkdown)
        }}
        onCancel={() => onCancel(true, ref)}
        validationResult={{isValid: true}}
        userSettings={commentBoxConfig}
        onSave={() => {
          if (validationResult.isValid) {
            onCommit(subjectId)
          } else {
            setValidationError(validationResult.errorMessage)
          }
        }}
        contentIsStale={bodyIsStale}
        ref={ref}
        label={'Body input'}
        aria-describedby={validationError ? validationErrorId : undefined}
        buttonSize="medium"
        teamHovercardsEnabled={true}
        {...testIdProps(TEST_IDS.commentBox('body'))}
      />
      {validationError && (
        <Flash
          variant="danger"
          sx={{
            height: '35px',
            padding: '6px',
            color: 'danger.fg',
            fontWeight: 'bold',
          }}
          id={validationErrorId}
        >
          <Octicon icon={AlertIcon} />
          {validationError}
        </Flash>
      )}
    </>
  )
}
