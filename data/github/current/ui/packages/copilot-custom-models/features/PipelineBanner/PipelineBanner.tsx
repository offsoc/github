import {isPipelineCancelable} from '../../utils'
import {usePipelineDetails} from '../PipelineDetails'
import {CanceledBanner} from './CanceledBanner'
import {FailedBanner} from './FailedBanner'
import {InProgressBanner} from './InProgressBanner'
import {SuccessBanner} from './SuccessBanner'

interface Props {
  isListItem?: boolean
}

export function PipelineBanner({isListItem = false}: Props) {
  const {bannerPipeline: pipelineDetails, isStale, isViewingDetails} = usePipelineDetails()

  const isInProgress = isPipelineCancelable(pipelineDetails)
  const showFailed = pipelineDetails.status === 'PIPELINE_STATUS_FAILED' && !isStale
  const wasCanceled = pipelineDetails.status === 'PIPELINE_STATUS_CANCELED'
  const wasSuccessful = pipelineDetails.status === 'PIPELINE_STATUS_COMPLETED'
  const showSuccessBanner = wasSuccessful && !isViewingDetails && !isListItem

  if (isInProgress) return <InProgressBanner isListItem={isListItem} />
  if (showFailed) return <FailedBanner isListItem={isListItem} />
  if (wasCanceled) return <CanceledBanner isListItem={isListItem} />
  if (showSuccessBanner) return <SuccessBanner />

  return null
}
