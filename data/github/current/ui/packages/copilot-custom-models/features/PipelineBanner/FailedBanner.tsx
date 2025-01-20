import {Banner} from '@primer/react/drafts'
import {useNavigateWithFlashBanner} from '../NavigateWithFlashBanner'
import {usePipelineDetails} from '../PipelineDetails'
import {isListItemStyle} from './shared'
import {BannerTitle} from './BannerTitle'
import {Text} from '@primer/react'

interface Props {
  isListItem?: boolean
}

export function FailedBanner({isListItem = false}: Props) {
  const {
    canViewDetails,
    bannerPipeline: {canRetrain, editPath, showPath},
    hasAnyDeployed,
    org,
  } = usePipelineDetails()
  const {navigate} = useNavigateWithFlashBanner()

  const handleRetrainClick = () => navigate(editPath)

  let nextSteps = ''
  if (canViewDetails) nextSteps += 'review the recent training run'
  if (canViewDetails && canRetrain) nextSteps += ' or '
  if (canRetrain) nextSteps += 'try retraining the model'
  if (nextSteps) nextSteps = `Please ${nextSteps}.`

  return (
    <Banner
      description={
        <>
          <BannerTitle isListItem={isListItem}>Failed</BannerTitle>
          <Text sx={{wordBreak: 'break-word'}}>
            The {org} model training has failed.{' '}
            {hasAnyDeployed ? (
              <span>Your existing model is still deployed.</span>
            ) : (
              <span>There is currently no deployed model available.</span>
            )}{' '}
            {nextSteps} For more help please contact support.
          </Text>
        </>
      }
      primaryAction={
        canRetrain ? <Banner.PrimaryAction onClick={handleRetrainClick}>Try again</Banner.PrimaryAction> : undefined
      }
      secondaryAction={
        canViewDetails ? (
          <Banner.SecondaryAction onClick={() => navigate(showPath)}>View training run</Banner.SecondaryAction>
        ) : undefined
      }
      style={isListItem ? isListItemStyle : undefined}
      variant="critical"
    />
  )
}
