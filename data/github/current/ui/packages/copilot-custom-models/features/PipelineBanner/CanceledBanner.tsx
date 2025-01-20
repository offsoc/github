import {Link, Text} from '@primer/react'
import {Banner} from '@primer/react/drafts'
import {useNavigateWithFlashBanner} from '../NavigateWithFlashBanner'
import {usePipelineDetails} from '../PipelineDetails'
import {isListItemStyle} from './shared'
import {BannerTitle} from './BannerTitle'

interface Props {
  isListItem?: boolean
}

export function CanceledBanner({isListItem = false}: Props) {
  const {
    hasAnyDeployed,
    bannerPipeline: {canRetrain, editPath},
  } = usePipelineDetails()
  const {navigate} = useNavigateWithFlashBanner()

  const secondSentence = canRetrain ? (
    <>
      Please contact support for help or{' '}
      <Link href="#" inline onClick={() => navigate(editPath)} sx={{cursor: 'pointer'}}>
        start again
      </Link>
    </>
  ) : (
    <>Please contact support for help</>
  )

  return (
    <Banner
      description={
        <>
          <BannerTitle isListItem={isListItem}>Canceled</BannerTitle>
          <Text sx={{wordBreak: 'break-word'}}>
            Training run was canceled. {secondSentence}.{' '}
            {hasAnyDeployed && <span>Your existing model is still deployed.</span>}
          </Text>
        </>
      }
      style={isListItem ? isListItemStyle : undefined}
      variant="warning"
    />
  )
}
