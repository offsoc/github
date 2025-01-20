import type {SecurityCampaignAlert} from './security-campaign-alert'

export interface GetAlertsResponse {
  alerts: SecurityCampaignAlert[]
  openCount: number
  closedCount: number
  nextCursor: string
  prevCursor: string
}
