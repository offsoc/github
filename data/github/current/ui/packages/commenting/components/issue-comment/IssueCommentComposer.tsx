import {CommentBox, type CommentBoxConfig, type CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import {ReadonlyCommentBox} from '@github-ui/comment-box/ReadonlyCommentBox'
import type {Subject} from '@github-ui/comment-box/subject'
import {LazyContributorFooter} from '@github-ui/contributor-footer/LazyContributorFooter'
import type {LazyContributorFooter$key} from '@github-ui/contributor-footer/LazyContributorFooter.graphql'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {type CloseButtonState, IssueActions} from '@github-ui/issue-actions/IssueActions'
import {commitCloseIssueMutation, commitReopenIssueMutation} from '@github-ui/issue-actions/UpdateIssueStateMutation'
import {userHovercardPath} from '@github-ui/paths'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {IS_BROWSER} from '@github-ui/ssr-utils'
import {testIdProps} from '@github-ui/test-id-props'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {LockIcon} from '@primer/octicons-react'
import {Box, Heading, Link} from '@primer/react'
import {forwardRef, useCallback, useMemo, useRef, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'
import {ConnectionHandler} from 'relay-runtime'

import {BUTTON_LABELS} from '../../constants/button-labels'
import {IDS} from '../../constants/dom-elements'
import {ERRORS} from '../../constants/errors'
import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'
import {type MarkdownComposerRef, useMarkdownBody} from '../../hooks/use-markdown-body'
import {useMarkdownStyles} from '../../hooks/use-markdown-styles'
import {useMetaAndShiftKeys} from '../../hooks/use-meta-and-shift-keys'
import {addCommentMutation} from '../../mutations/add-comment-mutation'
import {blockedCommentingReason} from '../../utils/blocked-commenting-reason'
import type {IssueCommentComposer$key} from './__generated__/IssueCommentComposer.graphql'
import type {IssueCommentComposerSecondary$key} from './__generated__/IssueCommentComposerSecondary.graphql'
import type {IssueCommentComposerViewer$key} from './__generated__/IssueCommentComposerViewer.graphql'

type IssueCommentComposerBaseProps = {
  onChange: () => void
  onSave: () => void
  onCancel: () => void
  onNewIssueComment?: () => void
  commentBoxConfig?: CommentBoxConfig
  fileUploadsEnabled?: boolean
  singleKeyShortcutEnabled: boolean
  insidePortal?: boolean
}

type IssueCommentComposerProps = IssueCommentComposerBaseProps & {
  issue: IssueCommentComposer$key
  issueSecondary?: IssueCommentComposerSecondary$key
  repoSecondary?: LazyContributorFooter$key
  viewer: IssueCommentComposerViewer$key
}

export const IssueCommentComposer = forwardRef<MarkdownComposerRef, IssueCommentComposerProps>(
  (
    {
      onChange,
      onSave,
      onCancel,
      onNewIssueComment,
      commentBoxConfig,
      singleKeyShortcutEnabled,
      issue,
      issueSecondary,
      repoSecondary,
      viewer,
      fileUploadsEnabled,
      insidePortal,
    },
    ref,
  ) => {
    const data = useFragment(
      graphql`
        fragment IssueCommentComposer on Issue {
          id
          locked
          viewerCanComment
          databaseId
          repository {
            id
            databaseId
            isArchived
            nameWithOwner
            viewerCanInteract
            viewerInteractionLimitReasonHTML
          }
          ...IssueActions
        }
      `,
      issue,
    )

    const secondaryData = useFragment(
      graphql`
        fragment IssueCommentComposerSecondary on Issue {
          viewerCanReopen
          viewerCanClose
          repository {
            slashCommandsEnabled
          }
        }
      `,
      issueSecondary,
    )
    // If the secondary data is not available, we default to false
    const slashCommandsEnabled = secondaryData?.repository.slashCommandsEnabled ?? false

    const viewerData = useFragment(
      graphql`
        fragment IssueCommentComposerViewer on User {
          id
          login
          avatarUrl(size: 64)
        }
      `,
      viewer,
    )

    const {id: issueId} = data
    const commentBoxRef = useRef<CommentBoxHandle>(null)
    const commentComposerRef = useRef<HTMLDivElement>(null)
    const repositoryDatabaseId = data.repository.databaseId!
    const isRepoArchived = data.repository.isArchived
    const {addToast} = useToastContext()
    const environment = useRelayEnvironment()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [closeButtonState, setCloseButtonState] = useState<CloseButtonState>('OPEN')
    const {markdownStyles} = useMarkdownStyles(commentComposerRef)
    const cantCommentReason = blockedCommentingReason(
      isRepoArchived,
      data.locked,
      !data.repository.viewerCanInteract ? data.repository.viewerInteractionLimitReasonHTML : null,
    )
    const {metaAndShiftKeysPressed} = useMetaAndShiftKeys()
    const {markdownBody, resetMarkdownBody, markdownValidationResult, handleMarkdownBodyChanged} = useMarkdownBody({
      commentBoxRef,
      markdownComposerRef: ref,
      onChange,
      onCancel,
      referenceId: issueId,
      hasSingleKeyShortcutEnabled: singleKeyShortcutEnabled,
      insidePortal,
    })

    const onCommentSave = useCallback(
      (subject: string, skipStateChange = false) => {
        setIsSubmitting(true)
        if (markdownBody?.length > 0) {
          const issueCommentsConnectionId = ConnectionHandler.getConnectionID(
            data.id, // passed as input to the mutation/subscription
            'IssueBacksideTimeline_timelineItems',
          )
          const connectionId = `${issueCommentsConnectionId}(visibleEventsOnly:true)`

          addCommentMutation({
            environment,
            input: {
              subject,
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
              onNewIssueComment && onNewIssueComment()
            },
          })
        }

        // Do not modify the issue state when we are already modifying the issue state elsewhere
        if (metaAndShiftKeysPressed && !skipStateChange) {
          if (closeButtonState === 'CLOSED' && secondaryData?.viewerCanClose) {
            commitCloseIssueMutation({
              environment,
              input: {
                issueId: data?.id,
                newStateReason: 'COMPLETED',
              },
              onError: () =>
                // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                addToast({
                  type: 'error',
                  message: ERRORS.couldNotCloseIssue,
                }),
              onCompleted: onNewIssueComment,
            })
          } else if (closeButtonState === 'NOT_PLANNED' && secondaryData?.viewerCanClose) {
            commitCloseIssueMutation({
              environment,
              input: {
                issueId: data?.id,
                newStateReason: 'NOT_PLANNED',
              },
              onError: () =>
                // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                addToast({
                  type: 'error',
                  message: ERRORS.couldNotCloseIssue,
                }),
              onCompleted: onNewIssueComment,
            })
          } else if (closeButtonState === 'OPEN' && secondaryData?.viewerCanReopen) {
            commitReopenIssueMutation({
              environment,
              input: {
                issueId: data?.id,
              },
              onError: () =>
                // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                addToast({
                  type: 'error',
                  message: ERRORS.couldNotCloseIssue,
                }),
              onCompleted: onNewIssueComment,
            })
          }
        }

        onSave()
      },
      [
        markdownBody,
        metaAndShiftKeysPressed,
        onSave,
        data.id,
        environment,
        addToast,
        resetMarkdownBody,
        onNewIssueComment,
        closeButtonState,
        secondaryData?.viewerCanClose,
        secondaryData?.viewerCanReopen,
      ],
    )

    const subject = useMemo<Subject>(() => {
      return {
        type: 'issue_comment',
        id: {
          id: data.id,
          databaseId: data.databaseId!,
        },
        repository: {
          databaseId: repositoryDatabaseId,
          nwo: data.repository.nameWithOwner,
          slashCommandsEnabled,
        },
      }
    }, [data.databaseId, data.id, data.repository.nameWithOwner, repositoryDatabaseId, slashCommandsEnabled])

    const handleActionButtonUpdate = useCallback(() => {
      if (markdownValidationResult && markdownValidationResult.isValid) {
        onCommentSave(issueId, true)
      }
    }, [issueId, onCommentSave, markdownValidationResult])

    const actions = (
      <IssueActions
        actionRef={data}
        onAction={handleActionButtonUpdate}
        hasComment={markdownBody.length > 0}
        buttonSize="medium"
        closeButtonState={closeButtonState}
        setCloseButtonState={setCloseButtonState}
        viewerCanReopen={secondaryData?.viewerCanReopen}
        viewerCanClose={secondaryData?.viewerCanClose}
      />
    )

    return (
      <Box
        data-testid={TEST_IDS.commentComposer}
        sx={{
          mb: 2,
          mt: 4,
        }}
        ref={commentComposerRef}
        id={IDS.issueCommentComposer}
      >
        <Box
          sx={{
            display: 'flex',
            pl: 'var(--base-size-12)',
            pb: 3,
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Link
            href={`/${viewerData.login}`}
            data-hovercard-url={userHovercardPath({owner: viewerData.login})}
            aria-label={`@${viewerData.login}'s profile`}
          >
            <GitHubAvatar size={32} src={viewerData.avatarUrl} alt={viewerData.login} />
          </Link>
          <Heading id="comment-composer-heading" as="h2" sx={{fontSize: 2}}>
            Add a comment
          </Heading>
        </Box>
        {IS_BROWSER &&
          (!data.viewerCanComment || !data.repository.viewerCanInteract ? (
            <ReadonlyCommentBox
              reason={cantCommentReason}
              icon={LockIcon}
              {...testIdProps(TEST_IDS.readonlyCommentBox(TEST_IDS.commentComposer))}
            />
          ) : (
            <CommentBox
              ref={commentBoxRef}
              placeholder={LABELS.newCommentPlaceholder}
              label={LABELS.newComment}
              disabled={isSubmitting}
              subject={subject}
              value={markdownBody as SafeHTMLString}
              onChange={handleMarkdownBodyChanged}
              actions={actions}
              validationResult={markdownValidationResult}
              saveButtonText={BUTTON_LABELS.comment}
              saveButtonTrailingIcon={false}
              onSave={() => onCommentSave(issueId)}
              userSettings={commentBoxConfig}
              fileUploadsEnabled={fileUploadsEnabled}
              sx={markdownStyles}
              buttonSize="medium"
              labelledBy="comment-composer-heading"
              teamHovercardsEnabled={true}
              markdownSuggestionsFetchMethod="eager"
              {...testIdProps(TEST_IDS.commentBox(TEST_IDS.commentComposer))}
            />
          ))}
        <LazyContributorFooter repositoryKey={repoSecondary} sx={{pl: 2, mt: 2}} />
      </Box>
    )
  },
)
IssueCommentComposer.displayName = 'CommentComposer'
