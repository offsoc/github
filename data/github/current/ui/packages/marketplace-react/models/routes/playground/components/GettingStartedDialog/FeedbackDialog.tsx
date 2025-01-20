import {Button, Checkbox, CheckboxGroup, Dialog, FormControl, IconButton, Textarea} from '@primer/react'
import {Feedback, type FeedbackState} from './types'
import {useCallback, useEffect, useState, type FormEvent} from 'react'
import type {ShowModelPayload} from '../../../../../types'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ThumbsdownIcon, ThumbsupIcon} from '@primer/octicons-react'
import {sendFeedback} from '../../../../utils/feedback'

const initialState = {
  satisfaction: Feedback.UNKNOWN,
  reasons: [],
  feedbackText: '',
  contactConsent: false,
}

export function FeedbackDialog({
  returnFocusRef,
  isFeedbackDialogOpen,
  setIsFeedbackDialogOpen,
  isNegativePreSelected,
  setIsNegativeFeedbackConfirmed,
}: {
  returnFocusRef: React.RefObject<HTMLDivElement>
  isFeedbackDialogOpen: boolean
  setIsFeedbackDialogOpen: (isFeedbackDialogOpen: boolean) => void
  isNegativePreSelected?: boolean
  setIsNegativeFeedbackConfirmed?: (isNegativeFeedbackConfirmed: boolean) => void
}) {
  const payload = useRoutePayload<ShowModelPayload>()
  const {canProvideAdditionalFeedback, model} = payload

  const [feedback, setFeedback] = useState<FeedbackState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const submitButtonDisabled =
    (feedback.satisfaction === Feedback.UNKNOWN && feedback.feedbackText.length === 0) || isSubmitting
  const isNegative = feedback.satisfaction === Feedback.NEGATIVE || isNegativePreSelected

  useEffect(() => {
    // If the user selects the thumbs down icon on the playground page, display the feedback dialog without the thumbs up/down options
    if (isNegativePreSelected) {
      setFeedback({...feedback, satisfaction: Feedback.NEGATIVE})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {value, checked} = event.target
      if (checked) {
        setFeedback({...feedback, reasons: [...feedback.reasons, value] as FeedbackState['reasons']})
      } else {
        setFeedback({
          ...feedback,
          reasons: feedback.reasons.filter(reason => reason !== value),
        })
      }
    },
    [feedback, setFeedback],
  )

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const res = await sendFeedback({model, feedback})
      if (res.ok) {
        setFeedback(initialState)
        setIsNegativeFeedbackConfirmed?.(true)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
    setIsFeedbackDialogOpen(false)
    setIsSubmitting(false)
  }, [feedback, model, setIsFeedbackDialogOpen, setIsNegativeFeedbackConfirmed])

  useEffect(() => {
    if (!canProvideAdditionalFeedback && feedback.satisfaction === Feedback.POSITIVE) {
      // The feedback gets instantly submitted when a user cannot provide additional feedback and clicks the thumbs up icon
      handleSubmit()
    }
    // handleSubmit does not need to be included in the dependency list because it gets triggered every time feedback changes
    // This useEffect should only be triggered when feedback.satisfaction or canProvideAdditionalFeedback changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canProvideAdditionalFeedback, feedback.satisfaction])

  const handleClick = useCallback(
    (event: FormEvent<HTMLButtonElement>) => {
      const response = Number(event.currentTarget.value)
      if (response === Feedback.POSITIVE) {
        setFeedback({...feedback, satisfaction: response, reasons: []})
      } else {
        setFeedback({...feedback, satisfaction: response})
      }
    },
    [feedback],
  )

  return (
    <Dialog
      returnFocusRef={returnFocusRef}
      onDismiss={() => {
        setIsFeedbackDialogOpen(false)
      }}
      isOpen={isFeedbackDialogOpen}
      aria-labelledby="feedback-header"
      sx={{width: 640}}
    >
      <Dialog.Header sx={{border: 0, bg: 'transparent'}} id="feedback-header">
        Provide feedback
      </Dialog.Header>
      <form className="px-3 pb-3 d-flex flex-column gap-3">
        {!isNegativePreSelected && (
          <div className="d-flex flex-column">
            <h4 className="f5">How has your experience been with GitHub Models?</h4>
            <div className="d-flex mt-2">
              <IconButton
                sx={{
                  color: 'fg.muted',
                  backgroundColor: feedback.satisfaction === Feedback.POSITIVE ? 'canvas.subtle' : 'canvas.default',
                }}
                icon={ThumbsupIcon}
                variant="invisible"
                aria-label="Positive"
                value="1"
                onClick={handleClick}
              />
              <IconButton
                sx={{
                  color: 'fg.muted',
                  backgroundColor: feedback.satisfaction === Feedback.NEGATIVE ? 'canvas.subtle' : 'canvas.default',
                }}
                icon={ThumbsdownIcon}
                variant="invisible"
                aria-label="Negative"
                value="2"
                onClick={handleClick}
              />
            </div>
          </div>
        )}
        {isNegative && (
          <CheckboxGroup>
            <CheckboxGroup.Label sx={{fontSize: 1, fontWeight: 'bold'}}>This response is...</CheckboxGroup.Label>
            <FormControl>
              <Checkbox value="harmful" onChange={handleChange} />
              <FormControl.Label sx={{fontWeight: 'normal'}}>Harmful or unsafe</FormControl.Label>
            </FormControl>
            <FormControl>
              <Checkbox value="not true" onChange={handleChange} />
              <FormControl.Label sx={{fontWeight: 'normal'}}>Not true</FormControl.Label>
            </FormControl>
            <FormControl>
              <Checkbox value="unhelpful" onChange={handleChange} />
              <FormControl.Label sx={{fontWeight: 'normal'}}>Not helpful</FormControl.Label>
            </FormControl>
            <FormControl>
              <Checkbox value="other" onChange={handleChange} />
              <FormControl.Label sx={{fontWeight: 'normal'}}>Other</FormControl.Label>
            </FormControl>
          </CheckboxGroup>
        )}
        {canProvideAdditionalFeedback && (
          <>
            <FormControl>
              <FormControl.Label>Additional information</FormControl.Label>
              <Textarea
                aria-label="Additional information"
                resize="vertical"
                rows={3}
                value={feedback.feedbackText}
                placeholder="Give as much detail and context as possible but do not share any personal or sensitive information."
                onChange={e => {
                  setFeedback({
                    ...feedback,
                    feedbackText: e.target.value,
                  })
                }}
                sx={{width: '100%'}}
              />
            </FormControl>
            <FormControl>
              <Checkbox
                value="default"
                checked={feedback.contactConsent}
                onChange={() => {
                  setFeedback({...feedback, contactConsent: !feedback.contactConsent})
                }}
              />
              <FormControl.Label sx={{fontWeight: 'normal'}}>
                Allow GitHub to follow up about this feedback using the primary email address on your account.
              </FormControl.Label>
            </FormControl>
          </>
        )}
        {(canProvideAdditionalFeedback || isNegative) && (
          <div className="d-flex mt-2 flex-justify-end">
            <Button variant="primary" onClick={handleSubmit} disabled={submitButtonDisabled}>
              Submit feedback
            </Button>
          </div>
        )}
      </form>
    </Dialog>
  )
}
