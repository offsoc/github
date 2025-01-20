import type {CommentBoxConfig, CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import type {CommentingAppPayload} from '@github-ui/commenting/Types'
import {ConversationCommentBox} from '@github-ui/conversations'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import useSafeState from '@github-ui/use-safe-state'
import {StopIcon, TriangleDownIcon, XIcon} from '@primer/octicons-react'
import {
  AnchoredOverlay,
  Box,
  Button,
  Flash,
  FormControl,
  Heading,
  IconButton,
  Octicon,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  Tooltip,
} from '@primer/react'
import {useEffect, useMemo, useRef} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {usePullRequestAnalytics} from '../../hooks/use-pull-request-analytics'
import type {PullRequestReviewEvent} from '../../mutations/__generated__/addPullRequestReviewMutation.graphql'
import addPullRequestReviewMutation from '../../mutations/add-pull-request-review-mutation'
import deletePullRequestReviewMutation from '../../mutations/delete-pull-request-review-mutation'
import submitPullRequestReviewMutation from '../../mutations/submit-pull-request-review-mutation'
import type {ReviewMenu_pullRequest$key} from './__generated__/ReviewMenu_pullRequest.graphql'
import type {ReviewMenu_user$key} from './__generated__/ReviewMenu_user.graphql'

type ErrorCause = {
  message?: string
}

function getApproveDisabledTooltip(
  reviewerIsAuthor: boolean,
  violatedPushPolicy: boolean,
  canLeaveNonCommentReview: boolean,
) {
  if (reviewerIsAuthor) return "Pull request authors can't approve their own pull requests."
  if (violatedPushPolicy) return "Users that pushed changes to this pull request after it was opened can't approve"
  if (!canLeaveNonCommentReview) return 'Only users with explicit access to this repository may approve pull requests'
  return ''
}

function getRequestChangesDisabledTooltip(reviewerIsAuthor: boolean, canLeaveNonCommentReview: boolean) {
  if (reviewerIsAuthor) return "Pull request authors can't request changes on their own pull requests."
  if (!canLeaveNonCommentReview)
    return 'Only users with explicit access to this repository may request changes on pull requests'
  return ''
}

function getPendingCommentMessage(count: number) {
  if (count === 0) return ''
  if (count === 1) return '1 pending comment'
  return `${count} pending comments`
}

function getReviewMenuDisplayState({
  viewerIsAnonymous,
  viewerIsAuthor,
  viewerCanLeaveNonCommentReviews,
  isPROpen,
  viewerPendingReview,
}: {
  viewerIsAnonymous: boolean
  viewerIsAuthor: boolean
  viewerCanLeaveNonCommentReviews: boolean
  isPROpen: boolean
  viewerPendingReview?: {comments: {totalCount: number}} | null
}): {isHidden: boolean; text?: string} {
  const hasPendingComments = (viewerPendingReview?.comments.totalCount ?? 0) > 0
  const isCommentingAuthor = viewerIsAuthor && hasPendingComments
  const isApprovingReviewer = viewerCanLeaveNonCommentReviews
  const isNonApprovingReviewerWithComments = !isApprovingReviewer && hasPendingComments
  const isNonApprovingReviewerWithoutComments = !isApprovingReviewer && !hasPendingComments

  switch (true) {
    case viewerIsAnonymous:
      return {isHidden: true}
    case !isPROpen:
      return {
        isHidden: !hasPendingComments,
        text: 'comments',
      }
    case isCommentingAuthor || isNonApprovingReviewerWithComments:
      return {
        isHidden: false,
        text: 'comments',
      }
    case isApprovingReviewer:
      return {
        isHidden: false,
        text: 'review',
      }
    case isNonApprovingReviewerWithoutComments:
    default:
      return {isHidden: true}
  }
}

function ReviewRadioButtons({
  onReviewEventChange,
  reviewEvent,
  viewerCanLeaveNonCommentReviews,
  viewerCanWriteToRepo,
  viewerHasViolatedPushPolicy,
  viewerIsAuthor,
}: {
  onReviewEventChange: (selected: string | null) => void
  reviewEvent: string
  viewerCanLeaveNonCommentReviews: boolean
  viewerCanWriteToRepo: boolean
  viewerHasViolatedPushPolicy: boolean | null | undefined
  viewerIsAuthor: boolean
}) {
  return (
    <RadioGroup name="reviewEvent" sx={{mt: 3}} onChange={onReviewEventChange}>
      <RadioGroup.Label visuallyHidden>Review Event</RadioGroup.Label>
      <RadioButton
        checked={reviewEvent === 'COMMENT'}
        label="Comment"
        subLabel="Submit general feedback without explicit approval."
        value="COMMENT"
      />
      <RadioButton
        checked={reviewEvent === 'APPROVE'}
        disabled={!viewerCanLeaveNonCommentReviews}
        label="Approve"
        subLabel="Submit feedback and approve merging these changes."
        value="APPROVE"
        disabledTooltip={getApproveDisabledTooltip(
          viewerIsAuthor,
          !!viewerHasViolatedPushPolicy,
          viewerCanLeaveNonCommentReviews,
        )}
      />
      <RadioButton
        checked={reviewEvent === 'REQUEST_CHANGES'}
        disabled={!viewerCanLeaveNonCommentReviews}
        disabledTooltip={getRequestChangesDisabledTooltip(viewerIsAuthor, viewerCanLeaveNonCommentReviews)}
        label="Request changes"
        value="REQUEST_CHANGES"
        subLabel={
          viewerCanWriteToRepo
            ? 'Submit feedback that must be addressed before merging.'
            : 'Submit feedback suggesting changes.'
        }
      />
    </RadioGroup>
  )
}

function RadioButton({
  checked,
  disabled,
  disabledTooltip,
  label,
  subLabel,
  value,
}: {
  checked?: boolean
  disabled?: boolean
  disabledTooltip?: string
  label: string
  subLabel: string
  value: string
}) {
  const radioControl = (
    <FormControl disabled={disabled}>
      <Radio checked={checked} sx={{mt: 1}} value={value} />
      <FormControl.Label sx={{display: 'flex', flexDirection: 'column'}}>
        <span>{label}</span>
        <Text sx={{color: 'fg.muted', fontWeight: 'normal', fontSize: 0}}>{subLabel}</Text>
      </FormControl.Label>
    </FormControl>
  )

  return disabled && disabledTooltip ? <Tooltip text={disabledTooltip}>{radioControl}</Tooltip> : radioControl
}

export default function ReviewMenu({
  onUpdateReviewBody,
  onUpdateReviewEvent,
  pullRequest,
  redirectOnSubmit = false,
  reviewEvent,
  reviewBody,
  user,
}: {
  onUpdateReviewBody: (body: string) => void
  onUpdateReviewEvent: (body: string) => void
  pullRequest: ReviewMenu_pullRequest$key
  redirectOnSubmit?: boolean
  reviewBody: string
  reviewEvent: string
  user: ReviewMenu_user$key
}) {
  const userData = useFragment(
    graphql`
      fragment ReviewMenu_user on User {
        login
      }
    `,
    user,
  )

  const {
    author,
    id,
    repository,
    state,
    viewerCanLeaveNonCommentReviews,
    viewerHasViolatedPushPolicy,
    viewerPendingReview,
    comparison,
    ...rest
  } = useFragment(
    graphql`
      fragment ReviewMenu_pullRequest on PullRequest {
        id
        author {
          login
        }
        headRefOid
        repository {
          id
          viewerPermission
        }
        state
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          newCommit {
            oid
          }
          summary {
            path
          }
        }
        viewerCanLeaveNonCommentReviews
        viewerHasViolatedPushPolicy
        viewerPendingReview {
          id
          comments {
            totalCount
          }
        }
      }
    `,
    pullRequest,
  )

  const viewerIsAuthor = author?.login === userData.login
  const isPROpen = state === 'OPEN'
  const viewerCanWriteToRepo = repository.viewerPermission === 'WRITE' || repository.viewerPermission === 'ADMIN'
  const headRefOid = (comparison?.newCommit?.oid ?? rest.headRefOid) as string
  const markdownInputRef = useRef<CommentBoxHandle>(null)
  const [isOpen, setIsOpen] = useSafeState(false)
  const [isSubmitting, setIsSubmitting] = useSafeState(false)
  const [isCancelling, setIsCancelling] = useSafeState(false)
  const [errorMessage, setErrorMessage] = useSafeState<string | undefined>()
  const environment = useRelayEnvironment()
  const submitDisabled =
    isSubmitting || (!reviewBody && reviewEvent === 'COMMENT' && !viewerPendingReview?.comments.totalCount)

  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()
  const appPayload = useAppPayload<CommentingAppPayload>()
  const pasteUrlsAsPlainText = appPayload?.paste_url_link_as_plain_text || false
  const useMonospaceFont = appPayload?.current_user_settings?.use_monospace_font || false
  const commentBoxConfig: CommentBoxConfig = {
    pasteUrlsAsPlainText,
    useMonospaceFont,
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => markdownInputRef.current?.focus())
    }
  }, [isOpen])

  const handleReviewEventChange = (newReviewEvent: string | null) => {
    newReviewEvent && onUpdateReviewEvent(newReviewEvent)
  }

  const handleReviewSubmit = () => {
    if (errorMessage) setErrorMessage(undefined)
    setIsSubmitting(true)

    const commonInput = {body: reviewBody, event: reviewEvent as PullRequestReviewEvent, pullRequestId: id}
    const tryRedirect = (url?: string) => {
      if (url) {
        window.location.href = url
      }
    }

    const onError = (error: Error) => {
      setIsSubmitting(false)
      const message = (error.cause as ErrorCause[])?.[0]?.message
      const additionalErrorText = message ? `: ${message}` : '.'
      setErrorMessage(`Failed to submit review${additionalErrorText}`)
    }

    if (viewerPendingReview) {
      // user has a pending review
      submitPullRequestReviewMutation({
        environment,
        input: {
          ...commonInput,
          pullRequestReviewId: viewerPendingReview.id,
          headSha: headRefOid,
        },
        pathsToInvalidate: (comparison?.summary || []).map(s => s.path),
        onCompleted: response => {
          if (redirectOnSubmit) {
            const redirectUrl = response.submitPullRequestReview?.pullRequestReview?.url
            tryRedirect(redirectUrl)
          } else {
            setIsSubmitting(false)
            setIsOpen(false)
            onUpdateReviewBody('')
          }
        },
        onError,
        pullRequestId: id,
      })
    } else {
      // no pending review, just submit a new one
      addPullRequestReviewMutation({
        environment,
        input: {...commonInput, commitOID: headRefOid},
        // redirect to the PR home page on success
        onCompleted: response => {
          if (redirectOnSubmit) {
            const redirectUrl = response.addPullRequestReview?.pullRequestReview?.url
            tryRedirect(redirectUrl)
          } else {
            setIsSubmitting(false)
            setIsOpen(false)
            onUpdateReviewBody('')
          }
        },
        onError,
        pullRequestId: id,
      })
    }
    sendPullRequestAnalyticsEvent('submit_review_dialog.submit', 'SUBMIT_REVIEW_BUTTON')
  }

  const handleReviewCancel = () => {
    if (!viewerPendingReview) return
    if (!confirm('Are you sure you want to cancel? You will lose all your pending comments.')) return

    if (errorMessage) setErrorMessage(undefined)
    setIsCancelling(true)

    deletePullRequestReviewMutation({
      environment,
      input: {pullRequestReviewId: viewerPendingReview.id},
      onCompleted() {
        setIsCancelling(false)
        setIsOpen(false)
      },
      onError: error => {
        setIsCancelling(false)
        setErrorMessage(`Failed to cancel review: ${error.message}`)
      },
    })
    sendPullRequestAnalyticsEvent('submit_review_dialog.cancel', 'CANCEL_REVIEW_BUTTON')
  }

  const reviewMenuDisplayState = useMemo(
    () =>
      getReviewMenuDisplayState({
        viewerIsAnonymous: !userData?.login,
        isPROpen,
        viewerCanLeaveNonCommentReviews,
        viewerIsAuthor,
        viewerPendingReview,
      }),
    [userData, viewerCanLeaveNonCommentReviews, viewerPendingReview, isPROpen, viewerIsAuthor],
  )
  if (reviewMenuDisplayState.isHidden) return null

  return (
    <AnchoredOverlay
      // just let the browser's default tab behavior take over
      focusZoneSettings={{disabled: true}}
      open={isOpen}
      overlayProps={{
        sx: {
          display: 'flex',
          maxWidth: 'calc(100vw - 32px)',
          width: '640px',
          // Action menu overlay has a child div that needs to flex grow
          '& > div': {flexGrow: '1'},
        },
      }}
      renderAnchor={anchorProps => (
        <Button
          {...anchorProps}
          count={viewerPendingReview?.comments.totalCount ? viewerPendingReview.comments.totalCount : undefined}
          sx={{'[data-component=trailingIcon]': {marginX: -1}}}
          trailingAction={TriangleDownIcon}
          variant="primary"
        >
          Submit {reviewMenuDisplayState.text}
        </Button>
      )}
      onClose={() => setIsOpen(false)}
      onOpen={() => {
        setIsOpen(true)
        sendPullRequestAnalyticsEvent('submit_review_dialog.open', 'REVIEW_CHANGES_BUTTON')
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <Box sx={{mt: 2, mx: 3, mb: 0}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
            <Heading as="h4" sx={{fontSize: 1}}>
              <span>Finish your {reviewMenuDisplayState.text}</span>
            </Heading>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              aria-label="Close"
              icon={XIcon}
              unsafeDisableTooltip={true}
              variant="invisible"
              onClick={() => setIsOpen(false)}
            />
          </Box>
          <ConversationCommentBox
            ref={markdownInputRef}
            label="Add review comment"
            placeholder="Leave a comment"
            sx={{flexGrow: '1', width: '100%'}}
            userSettings={commentBoxConfig}
            value={reviewBody}
            onChange={onUpdateReviewBody}
            onPrimaryAction={handleReviewSubmit}
          />
          {isPROpen && (
            <ReviewRadioButtons
              reviewEvent={reviewEvent}
              viewerCanLeaveNonCommentReviews={viewerCanLeaveNonCommentReviews}
              viewerCanWriteToRepo={viewerCanWriteToRepo}
              viewerHasViolatedPushPolicy={viewerHasViolatedPushPolicy}
              viewerIsAuthor={viewerIsAuthor}
              onReviewEventChange={handleReviewEventChange}
            />
          )}
        </Box>

        <Box sx={{my: 3, borderTop: '1px solid', borderColor: 'border.default'}}>
          {errorMessage && (
            <Flash sx={{mx: 3, my: 2}} variant="danger">
              <Octicon className="mr-2" icon={StopIcon} />
              {errorMessage}
            </Flash>
          )}
          <Box
            sx={{alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', mt: 3, mx: 3}}
          >
            {viewerPendingReview?.id && (
              <>
                <Box sx={{ml: 2, color: 'fg.muted', fontSize: 0}}>
                  {getPendingCommentMessage(viewerPendingReview.comments.totalCount)}
                </Box>
                <Button disabled={isCancelling} sx={{mx: 2}} tabIndex={0} onClick={handleReviewCancel}>
                  <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'row'}}>
                    Discard {reviewMenuDisplayState.text}
                    {isCancelling && <Spinner size="small" sx={{ml: 2}} />}
                  </Box>
                </Button>
              </>
            )}
            <Button disabled={submitDisabled} variant="primary" onClick={handleReviewSubmit}>
              <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'row'}}>
                Submit {reviewMenuDisplayState.text}
                {isSubmitting && <Spinner size="small" sx={{ml: 2}} />}
              </Box>
            </Button>
          </Box>
        </Box>
      </Box>
    </AnchoredOverlay>
  )
}
