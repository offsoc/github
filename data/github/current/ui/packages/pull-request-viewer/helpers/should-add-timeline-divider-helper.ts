import {VALUES} from '@github-ui/timeline-items/Values'

export function shouldAddTimelineDivider(
  frontTimelineItems: ReadonlyArray<{__typename: string}>,
  backTimeLineItems: ReadonlyArray<{__typename: string}>,
  index: number,
  isFrontTimelineItem: boolean,
  isMajor: boolean,
) {
  if (isFrontTimelineItem && index === 0) return false

  const items = isFrontTimelineItem ? frontTimelineItems : backTimeLineItems

  if (index > 0 && items[index - 1]) {
    const eventType = items[index]!.__typename
    const previousEventType = items[index - 1]!.__typename
    const previousEventIsMajor = VALUES.timeline.majorEventTypes.includes(previousEventType)

    if (isMajor !== previousEventIsMajor) {
      if (eventType === 'IssueComment' && previousEventType === 'IssueComment') return false
      if (eventType !== 'IssueComment' && previousEventType !== 'IssueComment') return false
    }
  }

  return true
}
