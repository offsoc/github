import {GrowthBanner} from '@github-ui/growth-banner'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {PlayIcon} from '@primer/octicons-react'
import {useState} from 'react'

export interface ActionsSurveyProps {
  surveyLink: string
  surveyOpenCallbackPath: string
  surveyDismissCallbackPath: string
}

export function ActionsSurvey({surveyLink, surveyOpenCallbackPath, surveyDismissCallbackPath}: ActionsSurveyProps) {
  const [showBanner, setShowBanner] = useState(true)
  if (!showBanner) return null

  const handleDismiss = async () => {
    setShowBanner(false)
    await verifiedFetch(surveyDismissCallbackPath, {method: 'POST'})
  }

  const handleOpen = async () => {
    await verifiedFetch(surveyOpenCallbackPath, {method: 'POST'})
    setShowBanner(false)
    window.location.href = surveyLink
  }

  return (
    <GrowthBanner
      variant="information"
      title="Help us improve GitHub Actions"
      icon={PlayIcon}
      closeButtonClick={handleDismiss}
      primaryButtonProps={{
        onClick: handleOpen,
        children: 'Give feedback',
      }}
    >
      Tell us how to make GitHub Actions work better for you with three quick questions.
    </GrowthBanner>
  )
}
