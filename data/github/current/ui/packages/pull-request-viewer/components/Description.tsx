import type {CommentBoxConfig, CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import type {Subject} from '@github-ui/comment-box/subject'
import {CLASS_NAMES} from '@github-ui/commenting/DomElements'
import type {CommentingAppPayload} from '@github-ui/commenting/Types'
import {CopilotPrReviewBanner} from '@github-ui/copilot-pr-review-banner'
import {IssueBodyEditor} from '@github-ui/issue-body/IssueBodyEditor'
import {IssueBodyHeader} from '@github-ui/issue-body/IssueBodyHeader'
import type {IssueBodyHeaderActionsProps} from '@github-ui/issue-body/IssueBodyHeaderActions'
import {IssueBodyViewer} from '@github-ui/issue-body/IssueBodyViewer'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {SafeHTMLString} from '@github-ui/safe-html'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import {InfoIcon} from '@primer/octicons-react'
import {Box, Button, Dialog, IconButton} from '@primer/react'
import type {ForwardedRef, RefObject} from 'react'
import {forwardRef, useCallback, useEffect, useMemo, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import usePullRequestPageAppPayload from '../hooks/use-pull-request-page-app-payload'
import {updatePullRequestMutation} from '../mutations/update-pull-request-mutation'
import type {Description_pullRequest$key} from './__generated__/Description_pullRequest.graphql'

interface DescriptionProps {
  pullRequest: Description_pullRequest$key
  handleOpenSidesheet: () => void
}

const Description = forwardRef(function Description(
  {pullRequest, handleOpenSidesheet}: DescriptionProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const pullRequestData = useFragment(
    graphql`
      fragment Description_pullRequest on PullRequest {
        id
        databaseId
        bodyVersion
        ...IssueBodyHeader
        repository {
          databaseId
          nameWithOwner
          slashCommandsEnabled
          id
        }
        viewerCanUpdate
        locked
        body
        bodyHTML(unfurlReferences: true)
        ...IssueBodyViewerReactable
        ...IssueBodyViewer
      }
    `,
    pullRequest,
  )

  const repositoryDatabaseId = pullRequestData.repository.databaseId!

  const [presavedBody, setPresavedBody] = useSessionStorage<string>(
    `pull-request-${pullRequestData.id}.description-edit-text`,
    '',
  )
  const appPayload = useAppPayload<CommentingAppPayload>()
  const pasteUrlsAsPlainText = appPayload?.paste_url_link_as_plain_text || false
  const useMonospaceFont = appPayload?.current_user_settings?.use_monospace_font || false
  const commentBoxConfig: CommentBoxConfig = {
    pasteUrlsAsPlainText,
    useMonospaceFont,
  }
  const {copilotPreReviewBannerPayload} = usePullRequestPageAppPayload()
  const [bodyIsStale, setBodyIsStale] = useState(false)
  const [body, setBody] = useState<string>(presavedBody || '')
  const [isDescriptionEditActive, setIsDescriptionEditActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deferedIsEditing, setDeferedIsEditing] = useState(false)
  const [returnConfirmationRef, setReturnComfirmationRef] = useState<RefObject<HTMLElement> | undefined>(undefined)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const relayEnvironment = useRelayEnvironment()

  const {addToast} = useToastContext()

  const onBodyChange = useCallback(
    (newMarkdown: string) => {
      setBody(newMarkdown)
      setPresavedBody(newMarkdown)
    },
    [setPresavedBody],
  )

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

  useEffect(() => {
    if (isSubmitting) return
    if (isDescriptionEditActive) return

    setBody(pullRequestData.body)

    return () => setBodyIsStale(false)
  }, [pullRequestData.body, setBody, isDescriptionEditActive, body, isSubmitting])

  useEffect(() => setIsDescriptionEditActive(false), [pullRequestData.id, setIsDescriptionEditActive])
  useEffect(() => setDeferedIsEditing(isDescriptionEditActive), [isDescriptionEditActive])

  const updatePullRequestBody = useCallback(() => {
    setIsSubmitting(true)
    updatePullRequestMutation({
      environment: relayEnvironment,
      input: {pullRequestId: pullRequestData.id, body},
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Could not update pull request description.',
        })
      },
      onCompleted: () => {
        setIsDescriptionEditActive(false)
        setIsSubmitting(false)
        setPresavedBody(undefined)
      },
    })
  }, [relayEnvironment, pullRequestData.id, body, addToast, setPresavedBody])

  const resetDescriptionBodyAndCloseConfirmationDialog = useCallback(() => {
    setIsConfirmationDialogOpen(false)
    setIsDescriptionEditActive(false)
    setBody(pullRequestData.bodyHTML)
    setPresavedBody(undefined)
  }, [pullRequestData.bodyHTML, setBody, setPresavedBody, setIsDescriptionEditActive])

  const actionProps: IssueBodyHeaderActionsProps = {
    viewerCanUpdate: pullRequestData.viewerCanUpdate || false,
    startIssueBodyEdit: () => setIsDescriptionEditActive(true),
  }

  return (
    <div className={CLASS_NAMES.issueBody}>
      <h2 className="sr-only">Description</h2>
      {deferedIsEditing || isSubmitting ? (
        <>
          <IssueBodyEditor
            body={presavedBody || body}
            bodyIsStale={bodyIsStale}
            commentBoxConfig={commentBoxConfig}
            editorDisabled={isSubmitting}
            subject={subject}
            subjectId={pullRequestData.id}
            trailingIcon={!isSubmitting}
            onChange={onBodyChange}
            onCommit={updatePullRequestBody}
            onCancel={(reset, returnRef?: RefObject<CommentBoxHandle>) => {
              setReturnComfirmationRef(returnRef as unknown as RefObject<HTMLElement>)
              setIsConfirmationDialogOpen(true)
            }}
          />
          <Dialog
            aria-labelledby="label"
            isOpen={isConfirmationDialogOpen}
            returnFocusRef={returnConfirmationRef}
            onDismiss={resetDescriptionBodyAndCloseConfirmationDialog}
          >
            <Dialog.Header>Discard changes?</Dialog.Header>
            <Box sx={{p: 3}}>
              <span>You have unsaved changes. Are you sure you want to discard them?</span>
              <Box sx={{display: 'flex', mt: 3, justifyContent: 'flex-end'}}>
                <Button
                  sx={{mr: 1}}
                  onClick={() => {
                    setIsConfirmationDialogOpen(false)
                    returnConfirmationRef?.current?.focus()
                  }}
                >
                  Keep Editing
                </Button>
                <Button variant="danger" onClick={resetDescriptionBodyAndCloseConfirmationDialog}>
                  Close and discard
                </Button>
              </Box>
            </Box>
          </Dialog>
        </>
      ) : (
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 2}}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'border.muted',
              borderRadius: 2,
              flexGrow: 1,
              width: '100%',
              minWidth: 0,
            }}
          >
            <IssueBodyHeader
              actionProps={actionProps}
              comment={pullRequestData}
              isPullRequest={true}
              additionalActions={
                <Box sx={{display: ['flex', 'flex', 'none']}}>
                  {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                  <IconButton
                    ref={ref}
                    aria-label="View details"
                    icon={InfoIcon}
                    unsafeDisableTooltip={true}
                    variant="invisible"
                    onClick={handleOpenSidesheet}
                  />
                </Box>
              }
            />
            <IssueBodyViewer
              bodyVersion={pullRequestData.bodyVersion}
              comment={pullRequestData}
              html={pullRequestData.bodyHTML as SafeHTMLString}
              locked={pullRequestData.locked}
              markdown={pullRequestData.body}
              reactable={pullRequestData}
              viewerCanUpdate={pullRequestData.viewerCanUpdate || false}
            />
          </Box>
        </Box>
      )}
      {copilotPreReviewBannerPayload !== undefined && (
        <CopilotPrReviewBanner
          {...copilotPreReviewBannerPayload}
          environment={relayEnvironment}
          location="conversation"
          pullRequestId={pullRequestData.id}
        />
      )}
    </div>
  )
})

export default Description
