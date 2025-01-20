import {GitPullRequestDraftIcon, StopIcon} from '@primer/octicons-react'
import {useAnalytics} from '@github-ui/use-analytics'
import {HEADER_ICON_SIZE} from '../../constants'
import {Box, CircleOcticon, Button, Flash, Octicon, Spinner} from '@primer/react'
import useSafeState from '@github-ui/use-safe-state'

import {useRelayEnvironment} from 'react-relay'

import type {PullRequestState} from '../../types'

import {markPullRequestReadyForReviewMutation} from '../../mutations/mark-pull-request-ready-for-review-mutation'
import {MergeBoxSectionHeader} from './common/MergeBoxSectionHeader'

export type MarkReadyForReviewFunction = ({
  onCompleted,
  onError,
}: {
  onCompleted: () => void
  onError: () => void
}) => void

type DraftStateSectionWithRelayProps = Omit<DraftStateSectionProps, 'onMarkReadyForReview'> & {id: string}
export function DraftStateSectionWithRelay({id, ...props}: DraftStateSectionWithRelayProps) {
  const environment = useRelayEnvironment()
  const onMarkReadyForReview: MarkReadyForReviewFunction = ({onCompleted, onError}) => {
    markPullRequestReadyForReviewMutation({
      environment,
      input: {pullRequestId: id},
      onCompleted,
      onError,
    })
  }
  return <DraftStateSection {...props} onMarkReadyForReview={onMarkReadyForReview} />
}

export type DraftStateSectionProps = {
  isDraft: boolean
  state: PullRequestState
  viewerCanUpdate: boolean
} & Callbacks

type Callbacks = {
  onMarkReadyForReview: MarkReadyForReviewFunction
}

/**
 *
 * Renders if the pull request is in a Draft State
 */
export function DraftStateSection({isDraft, state, viewerCanUpdate, onMarkReadyForReview}: DraftStateSectionProps) {
  const [errorMessage, setErrorMessage] = useSafeState<string | null>(null)
  const [markingReadyForReview, setMarkingReadyForReview] = useSafeState(false)
  const {sendAnalyticsEvent} = useAnalytics()

  function handleMarkReadyForReview() {
    if (markingReadyForReview) return
    setMarkingReadyForReview(true)
    onMarkReadyForReview({
      onCompleted: () => setMarkingReadyForReview(false),
      onError: () => {
        setMarkingReadyForReview(false)
        setErrorMessage('Could not mark ready for review')
      },
    })

    sendAnalyticsEvent(
      'draft_state_section.mark_ready_for_review',
      'MERGEBOX_DRAFT_STATE_SECTION_MARK_READY_FOR_REVIEW_BUTTON',
    )
  }

  if (state !== 'OPEN' || !isDraft || !viewerCanUpdate) {
    return null
  }

  return (
    <Box aria-label="Draft state" as="section" sx={{borderBottom: '1px solid', borderColor: 'border.muted'}}>
      <MergeBoxSectionHeader
        title="This pull request is still a work in progress"
        subtitle="Draft pull requests cannot be merged."
        icon={
          <CircleOcticon
            size={HEADER_ICON_SIZE}
            icon={() => <GitPullRequestDraftIcon size={16} />}
            sx={{bg: 'neutral.emphasis', color: 'fg.onEmphasis'}}
          />
        }
        rightSideContent={
          <Button
            aria-busy={markingReadyForReview}
            aria-label={
              markingReadyForReview ? 'Marking pull request ready for review' : 'Mark pull request ready for review'
            }
            onClick={handleMarkReadyForReview}
          >
            <div className="d-flex flex-row flex-items-center">
              {markingReadyForReview ? (
                <>
                  <Spinner size="small" sx={{mr: 1}} />
                  <span>Marking ready for review...</span>
                </>
              ) : (
                'Ready for review'
              )}
            </div>
          </Button>
        }
      >
        {errorMessage && (
          <Flash sx={{mb: 3}} variant="danger">
            <Octicon sx={{mr: 2}} icon={StopIcon} />
            {errorMessage}
          </Flash>
        )}
      </MergeBoxSectionHeader>
    </Box>
  )
}
