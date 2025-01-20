import type {PipelineStageStatus, Stage} from '../../../../types'

export const allStatuses: PipelineStageStatus[] = [
  'PIPELINE_STAGE_STATUS_UNSPECIFIED',
  'PIPELINE_STAGE_STATUS_PENDING',
  'PIPELINE_STAGE_STATUS_ENQUEUED',
  'PIPELINE_STAGE_STATUS_STARTED',
  'PIPELINE_STAGE_STATUS_COMPLETED',
  'PIPELINE_STAGE_STATUS_FAILED',
  'PIPELINE_STAGE_STATUS_SKIPPED',
  'PIPELINE_STAGE_STATUS_CANCELED',
]

const waiting: PipelineStageStatus[] = ['PIPELINE_STAGE_STATUS_UNSPECIFIED', 'PIPELINE_STAGE_STATUS_PENDING']
const inProgress: PipelineStageStatus[] = ['PIPELINE_STAGE_STATUS_ENQUEUED', 'PIPELINE_STAGE_STATUS_STARTED']
const finished: PipelineStageStatus[] = [
  'PIPELINE_STAGE_STATUS_COMPLETED',
  'PIPELINE_STAGE_STATUS_FAILED',
  'PIPELINE_STAGE_STATUS_SKIPPED',
  'PIPELINE_STAGE_STATUS_CANCELED',
]

export function isInProgress(curr: PipelineStageStatus): boolean {
  return inProgress.includes(curr)
}

export function shouldAutoOpen(prev: PipelineStageStatus | undefined, curr: PipelineStageStatus): boolean {
  const wasWaiting = !prev || waiting.includes(prev)
  return wasWaiting && isInProgress(curr)
}

export function shouldAutoClose(prev: PipelineStageStatus | undefined, curr: PipelineStageStatus): boolean {
  const wasStarted = prev === 'PIPELINE_STAGE_STATUS_STARTED'
  const isFinished = finished.includes(curr)
  return wasStarted && isFinished
}

export function wentBackwards(prev: PipelineStageStatus | undefined, curr: PipelineStageStatus): boolean {
  if (!prev) return false

  return allStatuses.indexOf(curr) < allStatuses.indexOf(prev)
}

function stageToSortStr(stage: Stage): string {
  // left-pads the number, so '2' does not come after '10'
  const order = String(stage.order).padStart(3, '0')

  // Use the name if order not unique, alphabetical, case insensitive
  const withName = `${order}-${stage.name.toLowerCase()}`

  return withName
}

export function stageSortFn(a: Stage, b: Stage): number {
  return stageToSortStr(a).localeCompare(stageToSortStr(b))
}
