import {CommentBox, type CommentBoxConfig, type CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import {ReadonlyCommentBox} from '@github-ui/comment-box/ReadonlyCommentBox'
import type {Subject} from '@github-ui/comment-box/subject'
import {ContributorFooter} from '@github-ui/contributor-footer/ContributorFooter'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {testIdProps} from '@github-ui/test-id-props'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {LockIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import {forwardRef, useCallback, useMemo, useRef, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {BUTTON_LABELS} from '../../constants/button-labels'
import {IDS} from '../../constants/dom-elements'
import {ERRORS} from '../../constants/errors'
import {TEST_IDS} from '../../constants/test-ids'
import {type MarkdownComposerRef, useMarkdownBody} from '../../hooks/use-markdown-body'
import {useMarkdownStyles} from '../../hooks/use-markdown-styles'
import {useMetaAndShiftKeys} from '../../hooks/use-meta-and-shift-keys'
import {addCommentMutation} from '../../mutations/add-comment-mutation'
import {closePullRequestMutation} from '../../mutations/close-pull-request-mutation'
import {reopenPullRequestMutation} from '../../mutations/reopen-pull-request-mutation'
import {blockedCommentingReason} from '../../utils/blocked-commenting-reason'
import type {PullRequestCommentComposer_pullRequest$key} from './__generated__/PullRequestCommentComposer_pullRequest.graphql'
import {PullRequestCommentActionButtons} from './PullRequestCommentActionButtons'

type PullRequestCommentComposerProps = {
  onChange: () => void
  onSave: () => void
  onCancel: () => void
  commentBoxConfig?: CommentBoxConfig
  connectionId: string
  fileUploadsEnabled?: boolean
  pullRequest: PullRequestCommentComposer_pullRequest$key
}

const PullRequestCommentComposer = forwardRef<MarkdownComposerRef, PullRequestCommentComposerProps>(
  ({onChange, onSave, onCancel, commentBoxConfig, connectionId, pullRequest, fileUploadsEnabled}, ref) => {
    const pullRequestData = useFragment(
      graphql`
        fragment PullRequestCommentComposer_pullRequest on PullRequest {
          id
          locked
          viewerCanComment
          viewerCanClose
          viewerCanReopen
          databaseId
          repository {
            databaseId
            isArchived
            nameWithOwner
            slashCommandsEnabled
            securityPolicyUrl
            contributingFileUrl
            codeOfConductFileUrl
            visibility
          }
          state
          ...PullRequestCommentActionButtons_pullRequest
        }
      `,
      pullRequest,
    )

    const commentBoxRef = useRef<CommentBoxHandle>(null)
    const commentComposerRef = useRef<HTMLDivElement>(null)
    const repositoryDatabaseId = pullRequestData.repository.databaseId!
    const isRepoArchived = pullRequestData.repository.isArchived
    const {addToast} = useToastContext()
    const environment = useRelayEnvironment()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {metaAndShiftKeysPressed} = useMetaAndShiftKeys()
    const {markdownStyles} = useMarkdownStyles(commentComposerRef)
    const {markdownBody, resetMarkdownBody, markdownValidationResult, handleMarkdownBodyChanged} = useMarkdownBody({
      commentBoxRef,
      markdownComposerRef: ref,
      onChange,
      onCancel,
      referenceId: pullRequestData.id,
    })
    const isPullRequestLocked = pullRequestData.locked
    const cantCommentReason = blockedCommentingReason(isRepoArchived, isPullRequestLocked)

    const handleClosePullRequest = useCallback(() => {
      if (pullRequestData?.id) {
        return closePullRequestMutation({
          environment,
          input: {
            pullRequestId: pullRequestData.id,
          },
          onError: () =>
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: 'Could not close pull request',
            }),
        })
      }
    }, [pullRequestData, environment, addToast])

    const handleReopenPullRequest = useCallback(() => {
      if (pullRequestData?.id) {
        reopenPullRequestMutation({
          environment,
          input: {
            pullRequestId: pullRequestData.id,
          },
          onError: () =>
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: 'Could not re-open pull request',
            }),
        })
      }
    }, [pullRequestData, environment, addToast])

    const onCommentSave = useCallback(() => {
      setIsSubmitting(true)
      if (markdownBody?.length > 0) {
        addCommentMutation({
          environment,
          input: {
            subject: pullRequestData.id,
            body: markdownBody,
            connectionId,
          },
          onError: () => {
            setIsSubmitting(false)
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: ERRORS.couldNotComment,
            })
          },
          onCompleted: () => {
            setIsSubmitting(false)
            resetMarkdownBody()
          },
        })
      }

      if (metaAndShiftKeysPressed) {
        if (pullRequestData.state === 'OPEN' && pullRequestData.viewerCanClose) {
          handleClosePullRequest()
        } else if (pullRequestData.state === 'CLOSED' && pullRequestData.viewerCanReopen) {
          handleReopenPullRequest()
        }
      }

      onSave()
    }, [
      markdownBody,
      metaAndShiftKeysPressed,
      onSave,
      environment,
      pullRequestData.id,
      pullRequestData.state,
      pullRequestData.viewerCanClose,
      pullRequestData.viewerCanReopen,
      connectionId,
      addToast,
      resetMarkdownBody,
      handleClosePullRequest,
      handleReopenPullRequest,
    ])

    const handleActionButtonUpdate = useCallback(() => {
      if (markdownValidationResult?.isValid) {
        onCommentSave()
      }
    }, [onCommentSave, markdownValidationResult])

    const subject = useMemo<Subject>(() => {
      return {
        type: 'pull_request',
        id: {
          id: pullRequestData.id,
          databaseId: pullRequestData.databaseId!,
        },
        repository: {
          databaseId: repositoryDatabaseId,
          nwo: pullRequestData.repository.nameWithOwner,
          slashCommandsEnabled: pullRequestData.repository.slashCommandsEnabled,
        },
      }
    }, [
      pullRequestData.databaseId,
      pullRequestData.id,
      pullRequestData.repository.nameWithOwner,
      pullRequestData.repository.slashCommandsEnabled,
      repositoryDatabaseId,
    ])

    return (
      <Box sx={{width: '100%'}} ref={commentComposerRef} id={IDS.issueCommentComposer}>
        {!pullRequestData.viewerCanComment ? (
          <ReadonlyCommentBox
            reason={cantCommentReason}
            icon={LockIcon}
            {...testIdProps(TEST_IDS.readonlyCommentBox(TEST_IDS.commentComposer))}
          />
        ) : (
          <CommentBox
            actions={
              <PullRequestCommentActionButtons
                hasComment={markdownBody.length > 0}
                pullRequest={pullRequestData}
                onAction={handleActionButtonUpdate}
                onClose={handleClosePullRequest}
                onReopen={handleReopenPullRequest}
              />
            }
            ref={commentBoxRef}
            label="New comment"
            disabled={isSubmitting}
            subject={subject}
            value={markdownBody as SafeHTMLString}
            onChange={handleMarkdownBodyChanged}
            validationResult={markdownValidationResult}
            saveButtonText={BUTTON_LABELS.comment}
            saveButtonTrailingIcon={false}
            onSave={onCommentSave}
            userSettings={commentBoxConfig}
            fileUploadsEnabled={fileUploadsEnabled}
            sx={markdownStyles}
            buttonSize="medium"
            {...testIdProps(TEST_IDS.commentBox(TEST_IDS.commentComposer))}
          />
        )}
        {pullRequestData.repository.visibility === 'PUBLIC' && (
          <ContributorFooter
            codeOfConductFileUrl={pullRequestData.repository.codeOfConductFileUrl ?? undefined}
            securityPolicyUrl={pullRequestData.repository.securityPolicyUrl ?? undefined}
            contributingFileUrl={pullRequestData.repository.contributingFileUrl ?? undefined}
          />
        )}
      </Box>
    )
  },
)

PullRequestCommentComposer.displayName = 'PullRequestCommentComposer'
export {PullRequestCommentComposer}
