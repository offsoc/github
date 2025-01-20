import type React from 'react'
import {Label, Link as PrimerLink} from '@primer/react'

interface feedbackButton {
  showFeedbackLink: boolean
  feedbackLink: string
}

type BetaProps = {
  feedbackButton?: feedbackButton
}

const BetaSection: React.FC<BetaProps> = ({feedbackButton}) => {
  const showFeedbackLink = feedbackButton ? feedbackButton.showFeedbackLink : false
  const feedbackLink = feedbackButton ? feedbackButton.feedbackLink : ''

  return (
    <>
      <Label variant="success" size="small" className="ml-2 v-align-middle">
        Beta
      </Label>
      {showFeedbackLink && (
        <PrimerLink
          href={feedbackLink}
          sx={{fontSize: 1, fontWeight: 400, ml: 2, mr: 2, cursor: 'pointer'}}
          target="_blank"
        >
          Give feedback
        </PrimerLink>
      )}
    </>
  )
}

export default BetaSection
