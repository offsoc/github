import type {PipelineDetails} from '../../types'

export interface RoutePayload {
  adminEmail: string
  editPath: string
  hasAnyDeployed: boolean
  indexPath: string
  isStale: boolean
  organization: {
    slug: string
  }
  pipelineDetails: PipelineDetails
  updatePath: string
  withinRateLimit: boolean
}
export interface ShowPathJsonResponse {
  payload: RoutePayload
  title: string
}
