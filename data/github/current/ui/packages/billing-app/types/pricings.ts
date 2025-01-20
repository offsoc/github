export interface PricingList {
  sku: string
  friendlyName: string
  product: string
  price: number
  meterType: MeterType
  azureMeterId: string
  freeForPublicRepos: boolean
  effectiveDatePrices?: EffectiveDatePrice[]
  unitType: UnitType
  effectiveAt: number
}

export type MeterType = 'Default' | 'PerHourUnitCharge'

export type UnitType =
  | 'Unknown'
  | 'Seconds'
  | 'Minutes'
  | 'Hours'
  | 'Bytes'
  | 'Megabytes'
  | 'Gigabytes'
  | 'ByteHours'
  | 'MegabyteHours'
  | 'GigabyteHours'
  | 'GigabyteMonths'
  | 'UserMonths'

export interface PricingDetails {
  sku: string
  product: string
  price: number
  meterType: MeterType
  friendlyName: string
  azureMeterId: string
  freeForPublicRepos: boolean
  effectiveDatePrices?: EffectiveDatePrice[]
  unitType: UnitType
  effectiveAt: number
}

export interface EffectiveDatePrice {
  startDate: string
  endDate: string
  price: number
}

export interface UpsertPricingRequestPayload {
  sku: string
  product: string
  price: number
  meterType: MeterType
  unitType: UnitType
  freeForPublicRepos: boolean
  friendlyName: string
  azureMeterId: string
  effectiveAt: number
}
