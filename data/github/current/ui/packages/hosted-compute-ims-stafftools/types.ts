export type ImageDefinition = {
  id: string
  name: string
  osType: string
  architecture: string
  enabled: boolean
  pointsToImageDefinitionId: string
  createdAt: string
  updatedAt: string
  imageVersionsCount: number
}

export type ImageVersion = {
  imageDefinitionId: string
  version: string
  state: string
  stateDetails: string
  sizeGb: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}
