import type {DiscountType, DiscountTargetType, DiscountTarget} from '../enums'

export interface DiscountAmount {
  appliedAmount: number
  targetAmount: number
}

interface DiscountTargetDetail {
  id: string
  type: DiscountTarget
}

interface DiscountData {
  isFullyApplied: boolean
  currentAmount: number
  targetAmount: number
  percentage: number
  uuid: string
  targets: DiscountTargetDetail[]
}

type DiscountAmounts = {
  [DiscountType.FixedAmount]?: DiscountAmount
  [DiscountType.Percentage]?: DiscountAmount[]
}

export type DiscountAmountsMap = {[key in DiscountTargetType]?: DiscountAmounts}

export type DiscountDataArray = DiscountData[]
