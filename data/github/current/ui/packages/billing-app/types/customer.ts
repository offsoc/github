import type {DiscountTarget} from '../enums'

export interface Target {
  id: string
  type: DiscountTarget
}

export interface GetAllDiscountStatesRequest {
  month: number
  year: number
  enterpriseSlug: string
}

export interface GetAllDiscountStatesResponse {
  discounts: DiscountState[]
  statusCode: number
}

export interface DiscountState {
  isFullyApplied: boolean
  currentAmount: number
  targetAmount: number
  percentage: number
  targets: Target[]
  uuid: string
}

export interface CreateDiscountRequest {
  customerId: string
  endDate: number
  percentage: number
  startDate: number
  targets: Target[]
  targetAmount: number
}
