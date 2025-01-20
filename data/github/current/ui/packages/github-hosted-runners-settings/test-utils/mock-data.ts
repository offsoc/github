import type {NewRunnerPayload} from '../routes/NewRunner'
import type {EditRunnerPayload} from '../routes/EditRunner'
import {RunnerGroupVisibility, type RunnerCreateForm, type RunnerEditForm, type RunnerGroup} from '../types/runner'
import {ImageSource} from '../types/image'
import type {PlatformId} from '../types/platform'
import {type MachineSpec, MachineSpecArchitecture} from '../types/machine-spec'
import type {Image, ImageVersion} from '../types/image'

const defaultGroup: RunnerGroup = {
  id: 1,
  name: 'Default',
  visibility: RunnerGroupVisibility.All,
  allowPublic: false,
  selectedTargets: [],
  precreated: true,
}
const anotherGroup: RunnerGroup = {
  id: 2,
  name: 'Another Group',
  visibility: RunnerGroupVisibility.All,
  allowPublic: false,
  selectedTargets: [],
  precreated: true,
}

const defaultMachineSpec = {
  id: '4-core',
  architecture: MachineSpecArchitecture.x64,
  storageGb: 100,
  memoryGb: 16,
  cpuCores: 4,
  type: 'basic',
  documentationUrl: '',
  gpu: null,
} as const satisfies MachineSpec

const githubLinuxImage = {
  id: 'ubuntu-latest',
  displayName: 'Latest (22.04)',
  source: ImageSource.Curated,
  platform: 'linux-x64',
  sizeGb: 86,
} as const satisfies Image

export function getNewRunnerRoutePayload(input?: {
  isPublicIpAllowed?: boolean
  usedIpCount?: number
  totalIpCount?: number
  runnerGroups?: RunnerGroup[]
  maxConcurrentJobsDefault?: number
  maxConcurrentJobsMin?: number
  maxConcurrentJobsDefaultMax?: number
  maxConcurrentJobsGpuMax?: number
  machineSpecs?: MachineSpec[]
  images?: {[key: string]: Image[]}
}): NewRunnerPayload {
  input = input || {}

  const isPublicIpAllowed = input.isPublicIpAllowed ?? true
  const usedIpCount = input.usedIpCount ?? 0
  const totalIpCount = input.totalIpCount ?? 20
  const runnerGroups = input.runnerGroups ?? [defaultGroup, anotherGroup]
  const maxConcurrentJobsDefault = input.maxConcurrentJobsDefault ?? 20
  const maxConcurrentJobsMin = input.maxConcurrentJobsMin ?? 1
  const maxConcurrentJobsDefaultMax = input.maxConcurrentJobsDefaultMax ?? 1000
  const maxConcurrentJobsGpuMax = input.maxConcurrentJobsGpuMax ?? 40
  const isCustomImageUploadingEnabled = true
  const machineSpecs = input.machineSpecs ?? [defaultMachineSpec]
  const images = input.images ?? {github: [githubLinuxImage]}
  const isCustomImagesFeatureEnabled = true

  return {
    isEnterprise: false,
    runnerListPath: '/organizations/some-org/actions/runners',
    entityLogin: 'some-org',
    docsUrlBase: 'https://docs.github.com/',
    isPublicIpAllowed,
    usedIpCount,
    totalIpCount,
    runnerGroups,
    maxConcurrentJobsDefault,
    maxConcurrentJobsMin,
    maxConcurrentJobsDefaultMax,
    maxConcurrentJobsGpuMax,
    isCustomImageUploadingEnabled,
    machineSpecs,
    images,
    isCustomImagesFeatureEnabled,
  }
}

export function getEditRunnerRoutePayload(input?: {
  docsUrlBase?: string
  imageVersions?: ImageVersion[]
  isPublicIpAllowed?: boolean
  maxConcurrentJobsMax?: number
  maxConcurrentJobsMin?: number
  runnerGroupId?: number
  runnerGroups?: RunnerGroup[]
  runnerHasCustomImage?: boolean
  runnerHasGpuSpec?: boolean
  runnerHasPublicIp?: boolean
  runnerId?: number
  runnerImageVersion?: string
  runnerListPath?: string
  runnerMaxConcurrentJobs?: number
  runnerName?: string
  totalIpCount?: number
  usedIpCount?: number
}): EditRunnerPayload {
  input = input || {}

  const imageVersions = input.imageVersions ?? []
  const isPublicIpAllowed = input.isPublicIpAllowed ?? true
  const maxConcurrentJobsMax = input.maxConcurrentJobsMax ?? 1000
  const maxConcurrentJobsMin = input.maxConcurrentJobsMin ?? 1
  const runnerGroupId = input.runnerGroupId ?? 1
  const runnerGroups = input.runnerGroups ?? [defaultGroup]
  const runnerHasCustomImage = input.runnerHasCustomImage ?? false
  const runnerHasGpuSpec = input.runnerHasGpuSpec ?? false
  const runnerHasPublicIp = input.runnerHasPublicIp ?? false
  const runnerId = input.runnerId ?? 999
  const runnerImageVersion = input.runnerImageVersion ?? ''
  const runnerMaxConcurrentJobs = input.runnerMaxConcurrentJobs ?? 50
  const runnerName = input.runnerName ?? 'some-runner'
  const totalIpCount = input.totalIpCount ?? 20
  const usedIpCount = input.usedIpCount ?? 0

  return {
    docsUrlBase: 'https://docs.github.com/',
    entityLogin: 'some-org',
    imageVersions,
    isEnterprise: false,
    isPublicIpAllowed,
    maxConcurrentJobsMin,
    maxConcurrentJobsMax,
    runnerGroupId,
    runnerGroups,
    runnerHasCustomImage,
    runnerHasGpuSpec,
    runnerHasPublicIp,
    runnerId,
    runnerImageVersion,
    runnerListPath: '/organizations/some-org/actions/runners',
    runnerMaxConcurrentJobs,
    runnerName,
    totalIpCount,
    usedIpCount,
  }
}

export function getRunnerCreateForm(input?: {
  runnerName?: string
  platform?: PlatformId
  isPublicIpEnabled?: boolean
  imageId?: string | null
  imageSource?: ImageSource
  imageVersion?: string | null
  imageName?: string | null
  imageUploadTypeId?: PlatformId
  imageSasUri?: string
  machineSpecId?: string
}): RunnerCreateForm {
  input = input || {}

  const runnerName = input.runnerName ?? 'some-runner'
  const isPublicIpEnabled = input.isPublicIpEnabled ?? false
  const machineSpecId = input.machineSpecId ?? defaultMachineSpec.id
  const isImageUpload = input.platform === 'custom'
  const isImageGenerationEnabled = false
  const {imageSource, imageId, imageVersion, imageSasUri, imageName, platform} = isImageUpload
    ? {
        imageSource: ImageSource.Custom,
        imageId: null,
        imageVersion: null,
        imageName: null,
        imageSasUri: input.imageSasUri ?? '',
        platform: input.imageUploadTypeId ?? 'linux-x64',
      }
    : {
        imageSource: input.imageSource ?? githubLinuxImage.source,
        imageId: input.imageId ?? githubLinuxImage.id,
        imageVersion: input.imageVersion ?? null,
        imageName: input.imageName ?? `Ubuntu ${githubLinuxImage.displayName}`,
        imageSasUri: '',
        platform: input.platform ?? 'linux-x64',
      }

  return {
    name: runnerName,
    platform: platform ?? null,
    runnerGroupId: 1,
    maximumConcurrentJobs: 20,
    imageId,
    imageSource,
    imageVersion,
    machineSpecId,
    isPublicIpEnabled,
    imageName,
    imageSasUri,
    isImageGenerationEnabled,
  }
}

export function getRunnerEditForm(input?: {
  isPublicIpEnabled?: boolean
  name?: string
  maximumConcurrentJobs?: number
}): RunnerEditForm {
  input = input || {}

  const name = input.name ?? 'some-runner'
  const maximumConcurrentJobs = input.maximumConcurrentJobs ?? 50
  const isPublicIpEnabled = input.isPublicIpEnabled ?? false

  return {
    imageVersion: null,
    isPublicIpEnabled,
    maximumConcurrentJobs,
    name,
    runnerGroupId: 1,
  }
}

export function getImage(input?: Partial<Image>) {
  input = input || {}

  return {
    ...githubLinuxImage,
    ...input,
  } as const satisfies Image
}

export function getMachineSpec(input?: Partial<MachineSpec>) {
  input = input || {}

  return {
    ...defaultMachineSpec,
    ...input,
  } as const satisfies MachineSpec
}
