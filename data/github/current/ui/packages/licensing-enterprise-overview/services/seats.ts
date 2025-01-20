import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {PendingCycleChange} from '../types/pending-cycle-change'
import {ERRORS} from '../helpers/constants'

export interface SeatPriceCheckResult {
  total_seats: number
  old_seats: number
  valid_seats: number
  current_price: string
  payment_due: string
  payment_due_notice: string
  payment_increase: string
  payment_decrease: string
  sales_tax_notice: string
  seat_cost_label: string
}
export async function checkSeatPrice(basePath: string, seats: number): Promise<SeatPriceCheckResult> {
  const response = await verifiedFetchJSON(`${basePath}/settings/billing/seat_price?seats=${seats}`)
  return response.json()
}

interface SeatUpdateConsequences {
  newPayment?: string
  newPendingCycleChange?: PendingCycleChange
  newSeatCount?: number
}
type UpdateSeatsResponse = {error: string} | (SeatUpdateConsequences & {success: string})
type UpdateSeatsResult = SeatUpdateConsequences & {successMessage: string}
export async function updateSeats(basePath: string, seats: number): Promise<UpdateSeatsResult> {
  const response = await verifiedFetchJSON(`${basePath}/settings/billing/change_seats?seats=${seats}`, {method: 'PUT'})

  const result = (await response.json()) as UpdateSeatsResponse
  if (!result) {
    throw new Error(ERRORS.UPDATE_SEATS_FAILED_REASON_UNKNOWN)
  }

  if ('error' in result) {
    throw new Error(result.error)
  }

  return {
    successMessage: result.success,
    newPayment: result.newPayment,
    newPendingCycleChange: result.newPendingCycleChange,
    newSeatCount: result.newSeatCount,
  }
}
