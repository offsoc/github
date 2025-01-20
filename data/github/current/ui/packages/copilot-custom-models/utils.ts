import type {PipelineItem, PipelineStatus} from './types'

// States where the ability to cancel the pipeline should show up
const cancelableStates: PipelineStatus[] = [
  'PIPELINE_STATUS_UNSPECIFIED',
  'PIPELINE_STATUS_ENQUEUED',
  'PIPELINE_STATUS_STARTED',
]

export function isPipelineCancelable({status}: PipelineItem): boolean {
  return cancelableStates.includes(status)
}

// States where the UI should poll for updates
const pollableStates: PipelineStatus[] = [
  'PIPELINE_STATUS_UNSPECIFIED',
  'PIPELINE_STATUS_ENQUEUED',
  'PIPELINE_STATUS_STARTED',
  'PIPELINE_STATUS_CANCELING',
  'PIPELINE_STATUS_DELETING',
]

export function isPipelinePollable({status}: PipelineItem): boolean {
  return pollableStates.includes(status)
}

// If this is appended, make sure `cancelableStates` and `pollableStates` above are modified as necessary
export const statusTextMap: Record<PipelineStatus, string> = {
  PIPELINE_STATUS_UNSPECIFIED: 'Pending',
  PIPELINE_STATUS_ENQUEUED: 'Pending',
  PIPELINE_STATUS_STARTED: 'Training',
  PIPELINE_STATUS_COMPLETED: 'Ready',
  PIPELINE_STATUS_FAILED: 'Failed',
  PIPELINE_STATUS_CANCELING: 'Canceling',
  PIPELINE_STATUS_CANCELED: 'Canceled',
  PIPELINE_STATUS_INACTIVE: 'Inactive',
  PIPELINE_STATUS_DELETING: 'Deleting',
  PIPELINE_STATUS_DELETED: 'Deleted',
}

export const deployedText = 'Deployed'
