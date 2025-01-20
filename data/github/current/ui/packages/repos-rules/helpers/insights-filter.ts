import {encodePart} from '@github-ui/paths'
import type {InsightsFilter} from '../types/rules-types'

export function insightsIndexPath({filter}: {filter?: InsightsFilter}) {
  const params: string[] = []
  if (filter) {
    if (filter.branch) params.push(`ref=${encodePart(filter.branch)}`)
    if (filter.repository) params.push(`repository=${encodePart(filter.repository)}`)
    if (filter.actor) params.push(`actor=${encodePart(filter.actor.login)}`)
    if (filter.timePeriod) params.push(`time_period=${encodePart(filter.timePeriod)}`)
    if (filter.ruleset) params.push(`ruleset=${encodePart(filter.ruleset.name)}`)
    if (filter.ruleStatus) params.push(`rule_status=${encodePart(filter.ruleStatus)}`)
    if (filter.evaluateStatus) params.push(`evaluate_status=${encodePart(filter.evaluateStatus)}`)
    if (filter.page) params.push(`page=${encodePart(String(filter.page))}`)
  }

  return params.length > 0 ? `${params.join('&')}` : ''
}
