import type {TimelineItemsPaginated$data} from '../components/__generated__/TimelineItemsPaginated.graphql'

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends ReadonlyArray<infer ElementType>
  ? ElementType
  : never

export type TimelineItem = NonNullable<ArrayElement<NonNullable<TimelineItemsPaginated$data['edges']>>>['node']

const ROLLUP_TIME_CUTOFF = 1000 * 60 * 60 * 24 * 7 // a week - this is in parity with rails

const ENABLED_ROLLUP_TYPE_MAP: Record<string, Set<string>> = {
  LabeledEvent: new Set(['LabeledEvent', 'UnlabeledEvent']),
  UnlabeledEvent: new Set(['LabeledEvent', 'UnlabeledEvent']),
  CrossReferencedEvent: new Set(['CrossReferencedEvent']),
  ReferencedEvent: new Set(['ReferencedEvent']),
  AssignedEvent: new Set(['AssignedEvent', 'UnassignedEvent']),
  UnassignedEvent: new Set(['AssignedEvent', 'UnassignedEvent']),
  AddedToProjectV2Event: new Set(['AddedToProjectV2Event', 'RemovedFromProjectV2Event']),
  RemovedFromProjectV2Event: new Set(['AddedToProjectV2Event', 'RemovedFromProjectV2Event']),
}

const getCreatedAt = (event: TimelineItem): Date | undefined => {
  if (event?.__typename && ENABLED_ROLLUP_TYPE_MAP[event.__typename]) {
    return (event.createdAt && new Date(event.createdAt)) || undefined
  }

  return undefined
}

const canPerformSpecificEventRollup = (event: NonNullable<TimelineItem>): boolean => {
  if (event.__typename === 'CrossReferencedEvent' && event.willCloseTarget) {
    return false
  }

  return true
}

const eventCanRollup = (event: TimelineItem, nextEvent: TimelineItem): boolean => {
  if (!event || !nextEvent || !event.actor) {
    return false
  }

  if (!ENABLED_ROLLUP_TYPE_MAP[event.__typename]?.has(nextEvent.__typename)) {
    return false
  }

  if (event.actor?.login !== nextEvent.actor?.login) {
    return false
  }

  if (!canPerformSpecificEventRollup(event) || !canPerformSpecificEventRollup(nextEvent)) {
    return false
  }

  const createdAt = getCreatedAt(event)
  const nextCreatedAt = getCreatedAt(nextEvent)

  if (
    createdAt === undefined ||
    nextCreatedAt === undefined ||
    Math.abs(createdAt.getTime() - nextCreatedAt.getTime()) > ROLLUP_TIME_CUTOFF
  ) {
    return false
  }
  return true
}

const totalRolledUpEvents = (rollups: Record<string, TimelineItem[]>): number => {
  let total = 0
  for (const key in rollups) {
    total += rollups[key]!.length
  }

  return total
}

export interface RolledUpTimelineItem {
  item: TimelineItem | undefined
  rollupGroup: Record<string, TimelineItem[]> | undefined
}

export const rollupEvents = (events: TimelineItem[]): RolledUpTimelineItem[] => {
  const rolledUpEvents: RolledUpTimelineItem[] = []
  let index = 0
  while (index < events.length) {
    const rollups = rollupCurrentEvent(events, index)

    // This includes the current event
    const totalEventsRolledUp = totalRolledUpEvents(rollups)
    const currentEvent = events[index]

    if (rollups) removeDuplicateRollupEvents(rollups)

    rolledUpEvents.push({
      item: currentEvent,
      rollupGroup: totalEventsRolledUp > 1 ? rollups : undefined,
    })

    // For null/undefined events the rollups will be empty but we need to increment at least 1.
    index += Math.max(totalEventsRolledUp, 1)
  }

  return rolledUpEvents
}

const rollupCurrentEvent = (events: TimelineItem[], index: number): Record<string, TimelineItem[]> => {
  let currentEvent = events[index]!
  const rollups = [currentEvent]

  while (index + 1 < events.length) {
    const nextEvent = events[index + 1]!
    if (!eventCanRollup(currentEvent, nextEvent)) {
      break
    }

    currentEvent = nextEvent
    rollups.push(currentEvent)
    index++
  }

  return partitionRollups(rollups)
}

const partitionRollups = (rollups: TimelineItem[]): Record<string, TimelineItem[]> => {
  // Partition the distinct rolled up groups by __typename
  const distinctRollups: Record<string, TimelineItem[]> = {}
  for (const rollup of rollups) {
    if (!rollup) {
      continue
    }

    const key = rollup.__typename
    if (!distinctRollups[key]) {
      distinctRollups[key] = []
    }

    distinctRollups[key].push(rollup)
  }

  return distinctRollups
}

const removeDuplicateRollupEvents = (rollups: Record<string, TimelineItem[]>) => {
  for (const value of Object.values(rollups)) {
    const uniqueIds = new Set()

    for (let i = 0; i < value.length; i++) {
      const {__typename: eventName} = value[i] || {}
      const id = getEventItemId(value[i])

      if (id) {
        const uniqueKey = `${id}-${eventName}`
        if (uniqueIds.has(uniqueKey)) {
          value.splice(i--, 1) // Remove duplicate and adjust index
        } else {
          uniqueIds.add(uniqueKey)
        }
      }
    }
  }
}

const getEventItemId = (item: TimelineItem): string | undefined => {
  const type = item?.__typename

  switch (type) {
    case 'LabeledEvent':
    case 'UnlabeledEvent':
      return item?.label?.id
    case 'AssignedEvent':
    case 'UnassignedEvent':
      /*
        %other is generated by relay as a fallback for union types i.e type of assignee in this case.
        It doesn't contain any field properties hence the need for the extra check
      */
      return item?.assignee?.__typename !== '%other' ? item?.assignee?.id : undefined
    default:
      return undefined
  }
}
