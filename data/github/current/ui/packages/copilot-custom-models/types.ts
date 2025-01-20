import type {BaseRepo} from './features/RepoPicker/types'

type IsoDateTime = `${number}-${number}-${number}T${number}:${number}:${number}Z`

export interface Language {
  id: number | string
  color: string
  name: string
}

export interface PipelineItem {
  id: string
  actorLogin?: string // Sometimes returns an empty string, so use `||` instead of `??`
  cancelPath: string
  createdAt: string | null
  destroyPath: string
  editPath: string
  isDeployed: boolean
  repositoryCount: number
  showPath: string
  status: PipelineStatus
}

// ref: https://github.com/github/orca/blob/main/proto/api/v1/orca.proto
// ref: On that page, see `enum PipelineStatus`
export type PipelineStatus =
  | 'PIPELINE_STATUS_UNSPECIFIED'
  | 'PIPELINE_STATUS_ENQUEUED'
  | 'PIPELINE_STATUS_STARTED'
  | 'PIPELINE_STATUS_COMPLETED'
  | 'PIPELINE_STATUS_FAILED'
  | 'PIPELINE_STATUS_CANCELING'
  | 'PIPELINE_STATUS_CANCELED'
  | 'PIPELINE_STATUS_INACTIVE'
  | 'PIPELINE_STATUS_DELETING'
  | 'PIPELINE_STATUS_DELETED'

export type LogLevel = 'LOG_STATE_UNSPECIFIED' | 'LOG_STATE_INFO' | 'LOG_STATE_WARNING' | 'LOG_STATE_ERROR'

export interface Log {
  log_level: LogLevel
  logged_at: IsoDateTime
  message: string
}

export type PipelineStageStatus =
  | 'PIPELINE_STAGE_STATUS_UNSPECIFIED'
  | 'PIPELINE_STAGE_STATUS_PENDING'
  | 'PIPELINE_STAGE_STATUS_ENQUEUED'
  | 'PIPELINE_STAGE_STATUS_STARTED'
  | 'PIPELINE_STAGE_STATUS_COMPLETED'
  | 'PIPELINE_STAGE_STATUS_FAILED'
  | 'PIPELINE_STAGE_STATUS_SKIPPED'
  | 'PIPELINE_STAGE_STATUS_CANCELED'

export interface LogGroup {
  logs: Log[]
  name: string
  ui_group_logs: boolean
}

export interface Stage {
  order: number
  log_groups: LogGroup[]
  name: string
  status: PipelineStageStatus
}

export interface PipelineDetails extends PipelineItem {
  actorAvatarUrl?: string // Sometimes returns an empty string, so use `||` instead of `??`
  languages: Language[]
  repoSearchPath: string
  stages: Stage[]
  wasPrivateTelemetryCollected: boolean
}

// Replicated from /app/controllers/orgs/copilot_settings/custom_model_pipeline_repositories_controller.rb
export interface PipelineRepo extends BaseRepo {
  id: number
}
