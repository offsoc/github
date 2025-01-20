import type {SecurityCampaignAlertGroup} from './security-campaign-alert-group'

export interface GetAlertsGroupsResponse {
  openCount: number
  closedCount: number
  nextCursor: string
  prevCursor: string
  groups: SecurityCampaignAlertGroup[]
}
