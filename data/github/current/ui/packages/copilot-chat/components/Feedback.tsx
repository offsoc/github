import {agoString} from '@github-ui/ago'
import {ThumbsdownIcon, ThumbsupIcon} from '@primer/octicons-react'
import {Dialog, IconButton} from '@primer/react'
import {useCallback, useState} from 'react'

import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {useChatMessage} from './ChatMessageContext'
import {FeedbackForm} from './FeedbackForm'

export type FeedbackProps = {
  returnFocusRef: React.RefObject<HTMLDivElement>
  setParentFocusZoneEnabled?: (enabled: boolean) => void
  onFeedbackSubmitted?: () => void
}

export const COPILOT_FEEDBACK_HEADER_ID = 'copilot-feedback-header'

export const Feedback = ({returnFocusRef, setParentFocusZoneEnabled, onFeedbackSubmitted}: FeedbackProps) => {
  const {message} = useChatMessage()
  const messageId = message.id
  const threadId = message.threadID
  const messageCreatedTime = message.createdAt
  const manager = useChatManager()
  const {optedInToUserFeedback} = useChatState()
  const [showForm, setShowForm] = useState<boolean>(true)
  const [submittedFeedback, setSubmittedFeedback] = useState<'POSITIVE' | 'NEGATIVE' | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)
  const messageCreatedDate = new Date(messageCreatedTime)

  const onClose = useCallback(
    async (feedback?: string) => {
      setParentFocusZoneEnabled?.(true)
      returnFocusRef.current?.focus()
      await manager.service.sendFeedback({
        feedback: feedback || submittedFeedback,
        messageId,
        threadId,
      })
      setShowForm(false)
    },
    [manager.service, messageId, returnFocusRef, setParentFocusZoneEnabled, submittedFeedback, threadId],
  )

  const onSubmit = useCallback(() => {
    setParentFocusZoneEnabled?.(true)
    returnFocusRef.current?.focus()
    setShowForm(false)
  }, [returnFocusRef, setParentFocusZoneEnabled])

  return (
    <>
      {submittedFeedback ? (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton
          unsafeDisableTooltip={true}
          aria-label={`${submittedFeedback === 'POSITIVE' ? 'positive' : 'negative'} feedback submitted`}
          icon={submittedFeedback === 'POSITIVE' ? ThumbsupIcon : ThumbsdownIcon}
          variant="invisible"
          size="small"
          disabled
          sx={{
            color: 'fg.default',
            bg: 'canvas.subtle',
          }}
        />
      ) : (
        <>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            disabled={!showForm}
            icon={ThumbsupIcon}
            aria-label={`Like Copilot response from ${agoString(messageCreatedDate)}`}
            onClick={() => {
              setSubmittedFeedback('POSITIVE')
              onFeedbackSubmitted?.()
              // Pass explicitly because the state won't be updated yet.
              void onClose('POSITIVE')
            }}
            variant="invisible"
            size="small"
            className="feedback-action"
          />
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            disabled={!showForm}
            icon={ThumbsdownIcon}
            size="small"
            aria-label={`Dislike Copilot response from ${agoString(messageCreatedDate)}`}
            onClick={() => {
              setSubmittedFeedback('NEGATIVE')
              onFeedbackSubmitted?.()
              if (optedInToUserFeedback) {
                setIsOpen(true)
              } else {
                // Pass explicitly because the state won't be updated yet.
                void onClose('NEGATIVE')
              }
            }}
            variant="invisible"
            className="feedback-action"
            data-testid="feedback-negative-button"
          />
        </>
      )}
      {submittedFeedback === 'NEGATIVE' && showForm && optedInToUserFeedback && (
        <Dialog
          returnFocusRef={returnFocusRef}
          isOpen={isOpen}
          onDismiss={() => {
            setParentFocusZoneEnabled?.(true)
            setIsOpen(false)
          }}
          aria-labelledby={COPILOT_FEEDBACK_HEADER_ID}
          data-testid="feedback-dialog"
          sx={{overflowX: 'hidden', overflowY: 'auto'}}
        >
          <Dialog.Header id={COPILOT_FEEDBACK_HEADER_ID}>Provide additional feedback</Dialog.Header>
          <FeedbackForm
            feedbackType={submittedFeedback}
            onClose={onClose}
            onSubmit={onSubmit}
            formLabel={COPILOT_FEEDBACK_HEADER_ID}
          />
        </Dialog>
      )}
    </>
  )
}
