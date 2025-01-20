import {GrowthBanner} from '@github-ui/growth-banner'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {CodespacesIcon} from '@primer/octicons-react'
import {useState} from 'react'

export interface CodespacesSurveyProps {
  surveyLink: string
  surveyOpenCallbackPath: string
  surveyDismissCallbackPath: string
}

export function CodespacesSurvey({
  surveyLink,
  surveyOpenCallbackPath,
  surveyDismissCallbackPath,
}: CodespacesSurveyProps) {
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
      title="Help us improve GitHub Codespaces"
      icon={CodespacesIcon}
      closeButtonClick={handleDismiss}
      primaryButtonProps={{
        onClick: handleOpen,
        children: 'Give feedback',
      }}
    >
      Tell us how to make GitHub Codespaces work better for you with three quick questions.
    </GrowthBanner>
  )
}
