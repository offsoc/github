import type {CustomImagesManagementPayload} from '../routes/CustomImagesManagement'
import type {CustomImageVersionsListPayload} from '../routes/CustomImageVersionsList'
import {
  type Image,
  type ImageVersion,
  ImageSource,
  ImageVersionState,
  ImageDefinitionState,
} from '@github-ui/github-hosted-runners-settings/types/image'

export const customLinuxImage = {
  id: '1',
  displayName: 'test-linux-image',
  source: ImageSource.Custom,
  platform: 'linux-x64',
  sizeGb: 30,
  versionCount: 1,
  totalVersionsSize: 30,
  latestVersion: '1.0.0',
  state: ImageDefinitionState.Ready,
} as const satisfies Image

export const customWindowsImage = {
  id: '2',
  displayName: 'test-windows-image',
  source: ImageSource.Custom,
  platform: 'win-x64',
  sizeGb: 30,
  versionCount: 2,
  totalVersionsSize: 30,
  latestVersion: '1.0.1',
  state: ImageDefinitionState.Ready,
} as const satisfies Image

export function getCustomImagesRoutePayload(input?: {
  entityLogin?: string
  images?: Image[]
  isEnterprise?: boolean
  platform?: string
}): CustomImagesManagementPayload {
  input = input || {}

  const platform = input?.platform ?? 'linux-x64'

  return {
    entityLogin: input?.entityLogin ?? 'test-entity-login',
    isEnterprise: input?.isEnterprise ?? false,
    images: input?.images ?? (platform !== 'linux-x64' ? [customWindowsImage] : [customLinuxImage]),
  }
}

export const readyImageVersion = {
  version: '1.0.0',
  state: ImageVersionState.Ready,
  size: 30,
  createdOn: '2024-01-01',
  lastUsedOn: '2024-03-08',
} as const satisfies ImageVersion

export const failedImageVersion = {
  version: '1.0.1',
  state: ImageVersionState.ImportFailed,
  failureReason: 'Authentication failed',
  size: 0,
  createdOn: '2024-01-01',
} as const satisfies ImageVersion

export const importingImageVersion = {
  version: '1.0.2',
  state: ImageVersionState.ImportingBlob,
  size: 0,
  createdOn: '2024-01-01',
} as const satisfies ImageVersion

export function getCustomImageVersionsRoutePayload(input?: {
  entityLogin?: string
  imageDefinitionId?: string
  isEnterprise?: boolean
  versions?: ImageVersion[]
}): CustomImageVersionsListPayload {
  return {
    entityLogin: input?.entityLogin ?? 'test-entity-login',
    imageDefinitionId: input?.imageDefinitionId ?? '123',
    imageName: customLinuxImage.displayName,
    imagesListPath: '/organizations/some-org/custom-images',
    isEnterprise: input?.isEnterprise ?? false,
    latestVersion: readyImageVersion.version,
    versions: input?.versions ?? [readyImageVersion, failedImageVersion],
  }
}
