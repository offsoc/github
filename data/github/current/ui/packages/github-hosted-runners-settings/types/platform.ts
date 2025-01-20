import {MachineSpecArchitecture} from './machine-spec'

export enum PlatformOsType {
  Linux = 'Linux',
  Windows = 'Windows',
  Custom = 'Custom',
}

export const platformOptions = [
  {
    displayName: 'Linux x64',
    id: 'linux-x64',
    osType: PlatformOsType.Linux,
    architecture: MachineSpecArchitecture.x64,
  },
  {
    displayName: 'Linux ARM64',
    id: 'linux-arm64',
    osType: PlatformOsType.Linux,
    architecture: MachineSpecArchitecture.ARM64,
  },
  {
    displayName: 'Windows x64',
    id: 'win-x64',
    osType: PlatformOsType.Windows,
    architecture: MachineSpecArchitecture.x64,
  },
  {
    displayName: 'Windows ARM64',
    id: 'win-arm64',
    osType: PlatformOsType.Windows,
    architecture: MachineSpecArchitecture.ARM64,
  },
  {
    displayName: 'Upload custom image',
    id: 'custom',
    osType: PlatformOsType.Custom,
    architecture: MachineSpecArchitecture.x64,
  },
] as const

// `Platform` is a type that can be any of the objects in the `platformOptions` array
export type Platform = (typeof platformOptions)[number]
export type PlatformId = Platform['id']

export function platformToOsType(platformInput: PlatformId): PlatformOsType {
  return platformOptions.find(p => p.id === platformInput)?.osType ?? PlatformOsType.Custom
}
