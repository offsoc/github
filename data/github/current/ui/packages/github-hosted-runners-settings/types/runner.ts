import type {ImageSource} from './image'
import type {PlatformId} from './platform'

export type RunnerCreateForm = {
  name: string
  platform: PlatformId | null
  runnerGroupId: number
  maximumConcurrentJobs: number
  imageId: string | null
  imageSource: ImageSource
  imageVersion: string | null
  imageName: string | null
  machineSpecId: string | null
  isPublicIpEnabled: boolean
  imageSasUri: string
  isImageGenerationEnabled: boolean
}

export type RunnerEditForm = {
  imageVersion: string | null
  isPublicIpEnabled: boolean
  maximumConcurrentJobs: number
  name: string
  runnerGroupId: number
}

export type RunnerGroup = {
  id: number
  name: string
  visibility: RunnerGroupVisibility
  allowPublic: boolean
  selectedTargets: unknown[]
  precreated: boolean
}

export enum RunnerGroupVisibility {
  All = 'ALL',
  Selected = 'SELECTED',
  Private = 'PRIVATE',
}
