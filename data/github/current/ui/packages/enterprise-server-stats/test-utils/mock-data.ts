import {TimePeriod} from '../types'
import type {EnterpriseServerStatsProps} from '../EnterpriseServerStats'

export function getEnterpriseServerStatsProps(): EnterpriseServerStatsProps {
  return {
    enterpriseSlug: 'enterprise-slug',
    selectedServer: 'server-id',
    timePeriod: TimePeriod.Year,
  }
}
