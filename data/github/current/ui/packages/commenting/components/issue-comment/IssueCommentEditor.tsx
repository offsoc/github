import {CommentBox, type CommentBoxConfig, type CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import type {Subject} from '@github-ui/comment-box/subject'
import type {ValidationResult} from '@github-ui/entity-validators'
import {validateComment} from '@github-ui/entity-validators'
import {noop} from '@github-ui/noop'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {testIdProps} from '@github-ui/test-id-props'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {graphql, useRelayEnvironment} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {BUTTON_LABELS} from '../../constants/button-labels'
import {ERRORS} from '../../constants/errors'
import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'
import type {IssueCommentEditor_repository$key} from './__generated__/IssueCommentEditor_repository.graphql'
import type {IssueCommentEditorBodyFragment$key} from './__generated__/IssueCommentEditorBodyFragment.graphql'
import {IssueCommentHeader} from './IssueCommentHeader'
import type {updateIssueCommentBodyMutation$data} from './mutations/__generated__/updateIssueCommentBodyMutation.graphql'
import {commitUpdateIssueCommentBodyMutation} from './mutations/update-issue-comment-body-mutation'

type Props = {
  initialValue: string
  comment: IssueCommentEditorBodyFragment$key
  repo: IssueCommentEditor_repository$key
  cancelEdit: () => void
  onSave: () => void
  onChange: (value: string) => void
  commentBoxConfig?: CommentBoxConfig
  setIsSubmitting: (isSubmitting: boolean) => void
  isSubmitting: boolean
}

export const IssueCommentEditorFragment = graphql`
  fragment IssueCommentEditor_repository on IssueComment {
    repository {
      slashCommandsEnabled
      nameWithOwner
      databaseId
    }
  }
`

export const IssueCommentEditorBodyFragment = graphql`
  fragment IssueCommentEditorBodyFragment on IssueComment {
    id
    body
    bodyVersion
    author {
      login
      avatarUrl
    }
    issue {
      author {
        login
      }
    }
    ...IssueCommentHeader
  }
`

export function IssueCommentEditor({
  initialValue = '',
  comment,
  repo,
  cancelEdit,
  onSave,
  onChange,
  commentBoxConfig,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const ref = useRef<CommentBoxHandle>(null)
  const data = useFragment(IssueCommentEditorBodyFragment, comment)
  const {body, bodyVersion} = data
  const commentRepository = useFragment<IssueCommentEditor_repository$key>(IssueCommentEditorFragment, repo)
  const {repository} = commentRepository

  const repositoryDatabaseId = repository.databaseId!
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const [currentBody, setCurrentBody] = useState<string>(initialValue || body)
  const [currentBodyVersion] = useState<string>(bodyVersion)

  const [validationResult, setValidationResult] = useState<ValidationResult>(validateComment(currentBody))
  useEffect(() => {
    setValidationResult(validateComment(currentBody))
  }, [currentBody])

  const onMarkdownChange = (newMarkdown: string) => {
    setCurrentBody(newMarkdown)
    onChange(newMarkdown)
  }

  const save = useCallback(
    (newId: string) => {
      setIsSubmitting(true)
      commitUpdateIssueCommentBodyMutation({
        environment,
        input: {id: newId, body: currentBody, bodyVersion: currentBodyVersion},
        onError: (error: Error) => {
          setIsSubmitting(false)
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: error.message.startsWith(LABELS.staleCommentErrorPrefix)
              ? ERRORS.couldNotEditCommentStale
              : ERRORS.couldNotEditComment,
          })
          // this distinction is because for this specific error we don't want to close the editor (so the user can first copy the changes)
          if (!error.message.startsWith(LABELS.staleCommentErrorPrefix)) {
            onSave()
          } else {
            setValidationResult({
              isValid: false,
              errorMessage: ERRORS.couldNotEditCommentStale,
            })
          }
        },
        onCompleted: (response?: updateIssueCommentBodyMutation$data) => {
          setIsSubmitting(false)

          if (!response?.updateIssueComment) {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: ERRORS.couldNotEditComment,
            })
          } else {
            onSave()
          }
        },
      })
    },
    [setIsSubmitting, environment, currentBody, currentBodyVersion, addToast, onSave],
  )

  const onCancel = () => {
    cancelEdit()
  }

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus()
    }
  }, [ref])

  const subject = useMemo<Subject>(() => {
    return {
      type: 'issue_comment',
      repository: {
        databaseId: repositoryDatabaseId,
        nwo: repository.nameWithOwner,
        slashCommandsEnabled: repository.slashCommandsEnabled,
      },
    }
  }, [repository.nameWithOwner, repository.slashCommandsEnabled, repositoryDatabaseId])

  return (
    <>
      <IssueCommentHeader
        comment={data}
        commentAuthorLogin={data.author!.login}
        avatarUrl={data.author!.avatarUrl}
        commentSubjectAuthorLogin={data.issue.author!.login}
        editComment={noop}
        onReplySelect={noop}
        navigate={noop}
        hideActions
      />
      <Box sx={{ml: 2, mb: 2, mr: 2}}>
        <CommentBox
          disabled={isSubmitting}
          subject={subject}
          ref={ref}
          value={(initialValue || currentBody) as SafeHTMLString}
          placeholder=""
          onSave={() => save(data.id)}
          onCancel={onCancel}
          validationResult={validationResult}
          onChange={onMarkdownChange}
          saveButtonText={BUTTON_LABELS.updateComment}
          userSettings={commentBoxConfig}
          saveButtonTrailingIcon={!isSubmitting}
          buttonSize="medium"
          sx={{py: 0}}
          teamHovercardsEnabled={true}
          markdownSuggestionsFetchMethod="eager"
          {...testIdProps(TEST_IDS.commentBox('comment-editor'))}
        />
      </Box>
    </>
  )
}
