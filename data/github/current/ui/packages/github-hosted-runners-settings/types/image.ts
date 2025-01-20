import type {PlatformId} from './platform'

export enum ImageSource {
  Marketplace = 'Marketplace',
  Curated = 'Curated',
  Custom = 'Custom',
}

export enum ImageDefinitionState {
  Provisioning = 'Provisioning',
  Ready = 'Ready',
  Deleting = 'Deleting',
}

export enum ImageVersionState {
  Ready = 'Ready',
  ImportFailed = 'ImportFailed',
  ImportingBlob = 'ImportingBlob',
  ProvisioningImageVersion = 'ProvisioningImageVersion',
  Deleting = 'Deleting',
  Generating = 'Generating',
}

export type Image = {
  id: string
  displayName: string
  source: ImageSource
  platform: PlatformId
  sizeGb: number
  state?: ImageDefinitionState
  versionCount?: number
  totalVersionsSize?: number
  latestVersion?: string
  imageVersions?: ImageVersion[]
  isImageGenerationSupported?: boolean
}

export type ImageVersion = {
  version: string
  state: ImageVersionState
  failureReason?: string
  size?: number
  createdOn: string
  lastUsedOn?: string
}
