export interface AzureEmission {
  id: string
  azurePartitionKey: string
  sku: string
  quantity: number
  emissionState: string
  emissionDate: string
}

export interface GetAzureEmissionsRequest {
  month: number
  year: number
}

export interface EmissionDate {
  day: number
  month: number
  year: number
}
