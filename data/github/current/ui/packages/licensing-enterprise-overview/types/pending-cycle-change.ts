export interface PendingCycleChange {
  changeType: 'change' | 'downgrade'
  effectiveDate: Date
  isChangingDuration: boolean
  isChangingSeats: boolean
  newPrice: string
  newSeatCount: number
  planDisplayName: string
  planDuration: string
}
