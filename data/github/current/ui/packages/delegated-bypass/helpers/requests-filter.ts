import {encodePart} from '@github-ui/paths'
import type {DelegatedBypassFilter} from '../delegated-bypass-types'

export function requestsIndexPath({filter}: {filter?: DelegatedBypassFilter}) {
  const params: string[] = []
  if (filter) {
    if (filter.approver) params.push(`approver=${encodePart(filter.approver.login)}`)
    if (filter.requester) params.push(`requester=${encodePart(filter.requester.login)}`)
    if (filter.timePeriod) params.push(`time_period=${encodePart(filter.timePeriod)}`)
    if (filter.page) params.push(`page=${encodePart(String(filter.page))}`)
    if (filter.requestStatus) params.push(`request_status=${encodePart(filter.requestStatus)}`)
    if (filter.repository) params.push(`repository=${encodePart(filter.repository)}`)
  }

  return params.length > 0 ? `${params.join('&')}` : ''
}
