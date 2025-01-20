import type {PipelineDetails, PipelineItem} from '../../types'

export interface RoutePayload {
  adminEmail: string
  deployedPipeline?: PipelineDetails
  hasAnyDeployed: boolean
  latestPipeline?: PipelineDetails
  newPath: string
  organization: string
  pipelines: PipelineItem[]
  withinRateLimit: boolean
}
