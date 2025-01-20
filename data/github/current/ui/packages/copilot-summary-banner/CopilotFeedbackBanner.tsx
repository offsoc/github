import {useId, useMemo, useRef, useState} from 'react'
import {CopilotIcon} from '@primer/octicons-react'
import {Box, Button, Flash, Octicon, Text} from '@primer/react'
import {CopilotSummaryFeedback} from './CopilotSummaryFeedback'
import {CopilotFeedbackDialog} from './CopilotFeedbackDialog'
import type {ClassificationOptions, Feedback} from './utils'
import {sendFeedback as defaultSendFeedback} from './utils'

interface CopilotFeedbackBannerProps {
  feedbackUrl: string
  feedbackAuthToken: string
  jobId?: string | null
  sessionId?: string | null
  classificationOptions: ClassificationOptions
  sendFeedback?: (feedbackUrl: string, authenticityToken: string, feedback: Feedback) => Promise<void>
}

export function CopilotFeedbackBanner({
  feedbackUrl,
  feedbackAuthToken,
  jobId,
  sessionId,
  classificationOptions,
  sendFeedback = defaultSendFeedback,
}: CopilotFeedbackBannerProps) {
  const [feedbackCollected, setFeedbackCollected] = useState(false)
  const [showAdditionalFeedback, setShowAdditionalFeedback] = useState(true)
  const [openFeedbackDialogue, setOpenFeedbackDialogue] = useState(false)
  const textContent = useMemo(() => {
    return feedbackCollected ? 'Thank you!' : 'How did Copilot perform?'
  }, [feedbackCollected])
  const additionalFeedbackText = 'Give additional feedback'
  const feedbackMessageId = useId()
  const useCase = sessionId ? (jobId ? 'summary or text completion' : 'text completion') : 'summary'
  const additionalFeedbackRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <CopilotFeedbackDialog
        isOpen={openFeedbackDialogue}
        onCancel={() => {
          setOpenFeedbackDialogue(false)
          additionalFeedbackRef.current?.focus()
        }}
        onSubmitFeedback={async (feedbackText, canContact, classification) => {
          setOpenFeedbackDialogue(false)
          setFeedbackCollected(true)
          setShowAdditionalFeedback(false)
          document.getElementById('pull_request_body')?.focus()

          try {
            await sendFeedback(feedbackUrl, feedbackAuthToken, {
              body: feedbackText,
              contact: canContact,
              classification,
            })
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)
            setFeedbackCollected(false)
            setShowAdditionalFeedback(true)
          }
        }}
        classificationOptions={classificationOptions}
      />
      <Flash
        sx={{border: 'none', backgroundColor: 'transparent', padding: 0}}
        data-testid="copilot-feedback-banner"
        variant="default"
        role="group"
        aria-labelledby={`copilot-feedback-message-${feedbackMessageId}`}
      >
        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
          <Box
            sx={{
              borderRadius: '100%',
              position: 'relative',
              bg: 'canvas.subtle',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '8px',
              border: '1px solid',
              borderColor: 'border.default',
            }}
          >
            <Octicon icon={CopilotIcon} size={12} sx={{fill: 'fg.muted'}} />
          </Box>
          <Text
            sx={{color: 'fg.muted', fontSize: 0}}
            id={`copilot-feedback-message-${feedbackMessageId}`}
            data-testid="copilot-feedback-message"
          >
            {textContent}
          </Text>
          {feedbackCollected && showAdditionalFeedback && (
            <div>
              <Button
                onClick={() => {
                  setOpenFeedbackDialogue(true)
                }}
                variant="invisible"
                size="small"
                ref={additionalFeedbackRef}
              >
                {additionalFeedbackText}
              </Button>
            </div>
          )}
          {!feedbackCollected && (
            <Box sx={{paddingLeft: 1}}>
              <CopilotSummaryFeedback
                onClick={async sentiment => {
                  setFeedbackCollected(true)
                  try {
                    await sendFeedback(feedbackUrl, feedbackAuthToken, {sentiment})
                    additionalFeedbackRef.current?.focus()
                  } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(error)
                    setFeedbackCollected(false)
                  }
                }}
                useCase={useCase}
              />
            </Box>
          )}
        </Box>
      </Flash>
    </>
  )
}
