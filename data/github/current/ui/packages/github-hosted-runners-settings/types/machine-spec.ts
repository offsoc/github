export enum MachineSpecArchitecture {
  x64 = '', // empty string is the current default
  ARM64 = 'Arm64',
}

export type MachineSpec = {
  id: string
  architecture: MachineSpecArchitecture
  storageGb: number
  memoryGb: number
  cpuCores: number
  type: 'basic' | 'gpu_optimized'
  documentationUrl: string
  gpu: {
    name: string
    count: number
    memoryGb: number
  } | null
}
