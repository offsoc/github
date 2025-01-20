import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import type {TimelineItem} from '../timeline-rollups'
import {rollupEvents} from '../timeline-rollups'

const labelItem = {id: 'label_id'}
const assigneeItem = {id: 'assignee_id'}

const createMockTimelineItem = (
  type: string,
  date: Date,
  actorLogin?: string,
  willCloseTarget?: boolean,
  label?: {id: string},
  assignee?: {id: string},
): TimelineItem => ({
  __typename: type,
  __id: mockRelayId(),
  createdAt: date.toISOString(),
  databaseId: undefined,
  actor: {
    login: actorLogin ?? 'test-user',
  },
  source: {
    __typename: 'Issue',
  },
  label,
  assignee,
  willCloseTarget: willCloseTarget ?? false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ' $fragmentSpreads': [] as any,
})

test('handles null events', () => {
  const timelineItems = [null, null, createMockTimelineItem('Closed', new Date('2020-01-01T04:00:04Z')), null, null]

  const rolledupItems = rollupEvents(timelineItems)

  expect(rolledupItems).toHaveLength(5)
  timelineItems.map((item, index) => expect(rolledupItems[index]!.item).toBe(item))
  for (const item of rolledupItems) {
    expect(item.rollupGroup).toBeUndefined()
  }

  timelineItems.map((item, index) => expect(rolledupItems[index]!.item).toBe(item))
})

test('should not rollup events that are not enabled', () => {
  const timelineItems = [
    createMockTimelineItem('IssueComment', new Date('2020-01-01T00:00:00Z')),
    createMockTimelineItem('IssueComment', new Date('2020-01-01T01:00:01Z')),
    createMockTimelineItem('UserBlocked', new Date('2020-01-01T02:00:02Z')),
    createMockTimelineItem('UserBlocked', new Date('2020-01-01T03:00:03Z')),
    createMockTimelineItem('Closed', new Date('2020-01-01T04:00:04Z')),
    createMockTimelineItem('Closed', new Date('2020-01-01T05:00:05Z')),
    createMockTimelineItem('Reopened', new Date('2020-01-01T06:00:06Z')),
    createMockTimelineItem('Reopened', new Date('2020-01-01T07:00:07Z')),
    createMockTimelineItem('RenamedTitleEvent', new Date('2020-01-01T08:00:08Z')),
    createMockTimelineItem('RenamedTitleEvent', new Date('2020-01-01T09:00:09Z')),
  ]

  const rolledupItems = rollupEvents(timelineItems)

  expect(rolledupItems).toHaveLength(10)
  timelineItems.map((item, index) => expect(rolledupItems[index]!.item).toBe(item))

  for (const item of rolledupItems) {
    expect(item.rollupGroup).toBeUndefined()
  }
})

test('referenced events rollup correctly', () => {
  const timelineItems = [
    createMockTimelineItem('CrossReferencedEvent', new Date('2020-01-01T00:00:00Z')),
    createMockTimelineItem('CrossReferencedEvent', new Date('2020-01-01T00:00:01Z')),
    createMockTimelineItem('ReferencedEvent', new Date('2020-01-01T00:00:02Z')),
    createMockTimelineItem('ReferencedEvent', new Date('2020-01-01T00:00:03Z')),
  ]

  const rolledupItems = rollupEvents(timelineItems)

  expect(rolledupItems).toHaveLength(2)
  expect(rolledupItems[0]!.item).toBe(timelineItems[0])
  expect(rolledupItems[0]!.rollupGroup).toBeDefined()
  expect(rolledupItems[0]!.rollupGroup!.CrossReferencedEvent).toHaveLength(2)
  expect(rolledupItems[0]!.rollupGroup!.ReferencedEvent!).toBeUndefined()
  rolledupItems[0]!.rollupGroup!['CrossReferencedEvent']!.map((item, index) => expect(item).toBe(timelineItems[index]))

  expect(rolledupItems[1]!.item).toBe(timelineItems[2])
  expect(rolledupItems[1]!.rollupGroup).toBeDefined()
  expect(rolledupItems[1]!.rollupGroup!.ReferencedEvent).toHaveLength(2)
  expect(rolledupItems[1]!.rollupGroup!.CrossReferencedEvent!).toBeUndefined()
})

test('does not roll up cross referenced events if they close the target', () => {
  const timelineItems = [
    createMockTimelineItem('CrossReferencedEvent', new Date('2020-01-01T00:00:00Z'), undefined, true),
    createMockTimelineItem('CrossReferencedEvent', new Date('2020-01-01T00:00:01Z'), undefined, true),
    createMockTimelineItem('CrossReferencedEvent', new Date('2020-01-01T00:00:02Z'), undefined, false),
    createMockTimelineItem('CrossReferencedEvent', new Date('2020-01-01T00:00:03Z'), undefined, true),
  ]

  const rolledupItems = rollupEvents(timelineItems)

  expect(rolledupItems).toHaveLength(4)
  timelineItems.map((item, index) => expect(rolledupItems[index]!.item).toBe(item))
})

test('labeled events should be rolled up', () => {
  const timelineItems = [
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:00Z')),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:01Z')),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:02Z')),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:03Z')),
  ]

  const rolledupItems = rollupEvents(timelineItems)

  expect(rolledupItems).toHaveLength(1)
  expect(rolledupItems[0]!.item).toBe(timelineItems[0])
  expect(rolledupItems[0]!.rollupGroup).toBeDefined()
  expect(rolledupItems[0]!.rollupGroup!.LabeledEvent).toHaveLength(4)
  expect(rolledupItems[0]!.rollupGroup!.UnlabeledEvent!).toBeUndefined()
  rolledupItems[0]!.rollupGroup!['LabeledEvent']!.map((item, index) => expect(item).toBe(timelineItems[index]))
})

test('labeled and unlabeled events rollup correctly', () => {
  const timelineItems = [
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:00Z')),
    createMockTimelineItem('UnlabeledEvent', new Date('2020-01-01T00:00:01Z')),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:02Z')),
    createMockTimelineItem('UnlabeledEvent', new Date('2020-01-01T00:00:03Z')),
  ]

  const rolledupItems = rollupEvents(timelineItems)
  expect(rolledupItems[0]!.item).toBe(timelineItems[0])
  expect(rolledupItems[0]!.rollupGroup).toBeDefined()
  expect(rolledupItems[0]!.rollupGroup!.LabeledEvent).toHaveLength(2)
  expect(rolledupItems[0]!.rollupGroup!.UnlabeledEvent).toHaveLength(2)
})

test('does not rollup events that are too far apart', () => {
  const timelineItems = [
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:00Z')),
    createMockTimelineItem('UnlabeledEvent', new Date('2020-02-01T00:00:01Z')),
    createMockTimelineItem('LabeledEvent', new Date('2020-03-01T00:00:02Z')),
    createMockTimelineItem('UnlabeledEvent', new Date('2020-03-01T00:00:03Z')),
  ]

  const rolledupItems = rollupEvents(timelineItems)
  expect(rolledupItems).toHaveLength(3)
  expect(rolledupItems[0]!.item).toBe(timelineItems[0])
  expect(rolledupItems[0]!.rollupGroup).toBeUndefined()
  expect(rolledupItems[1]!.item).toBe(timelineItems[1])
  expect(rolledupItems[1]!.rollupGroup).toBeUndefined()
  expect(rolledupItems[2]!.item).toBe(timelineItems[2])
  expect(rolledupItems[2]!.rollupGroup!.LabeledEvent).toHaveLength(1)
  expect(rolledupItems[2]!.rollupGroup!.UnlabeledEvent).toHaveLength(1)
})

test('does not roll up events by different actors', () => {
  const timelineItems = [
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:00Z'), 'user1'),
    createMockTimelineItem('UnlabeledEvent', new Date('2020-01-01T00:00:01Z'), 'user2'),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:02Z'), 'user1'),
    createMockTimelineItem('UnlabeledEvent', new Date('2020-01-01T00:00:03Z'), 'user2'),
  ]

  const rolledUpItems = rollupEvents(timelineItems)
  expect(rolledUpItems).toHaveLength(4)
  timelineItems.map((item, index) => expect(rolledUpItems[index]!.item).toBe(item))
  rolledUpItems.map(item => expect(item.rollupGroup).toBeUndefined())
})

test('removes duplicate labeled events', () => {
  const timelineItems = [
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:00Z'), undefined, undefined, labelItem),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:01Z'), undefined, undefined, labelItem),
  ]

  const rolledUpItems = rollupEvents(timelineItems)
  expect(rolledUpItems).toHaveLength(1)
  expect(rolledUpItems[0]!.rollupGroup).toBeDefined()
  expect(rolledUpItems[0]!.rollupGroup!.LabeledEvent).toHaveLength(1) // it's the same label
})

test('removes duplicate unlabeled events', () => {
  const timelineItems = [
    createMockTimelineItem('UnlabeledEvent', new Date('2020-01-01T00:00:00Z'), undefined, undefined, labelItem),
    createMockTimelineItem('UnlabeledEvent', new Date('2020-01-01T00:00:01Z'), undefined, undefined, labelItem),
  ]

  const rolledUpItems = rollupEvents(timelineItems)
  expect(rolledUpItems).toHaveLength(1)
  expect(rolledUpItems[0]!.rollupGroup).toBeDefined()
  expect(rolledUpItems[0]!.rollupGroup!.UnlabeledEvent).toHaveLength(1) // it's the same label
})

test('removes duplicate labeled events from different actors', () => {
  const timelineItems = [
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:00Z'), undefined, undefined, labelItem),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:00Z'), undefined, undefined, labelItem),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:01Z'), 'test-user-2', undefined, labelItem),
    createMockTimelineItem('LabeledEvent', new Date('2020-01-01T00:00:01Z'), 'test-user-2', undefined, labelItem),
  ]

  const rolledUpItems = rollupEvents(timelineItems)
  expect(rolledUpItems).toHaveLength(2)
  expect(rolledUpItems[0]!.rollupGroup).toBeDefined()
  expect(rolledUpItems[1]!.rollupGroup).toBeDefined()
  expect(rolledUpItems[0]!.rollupGroup!.LabeledEvent).toHaveLength(1) // it's the same label
  expect(rolledUpItems[1]!.rollupGroup!.LabeledEvent).toHaveLength(1) // it's the same label
})

test('removes duplicate assigned events', () => {
  const date = new Date('2020-01-01T00:00:00Z')
  const timelineItems = [
    createMockTimelineItem('AssignedEvent', date, undefined, undefined, undefined, assigneeItem),
    createMockTimelineItem('AssignedEvent', date, undefined, undefined, undefined, assigneeItem),
  ]

  const rolledUpItems = rollupEvents(timelineItems)
  expect(rolledUpItems).toHaveLength(1)
  expect(rolledUpItems[0]!.rollupGroup).toBeDefined()
  expect(rolledUpItems[0]!.rollupGroup!.AssignedEvent).toHaveLength(1) // it's the same assignee
})

test('removes duplicate unassigned events', () => {
  const date = new Date('2020-01-01T00:00:00Z')
  const timelineItems = [
    createMockTimelineItem('UnassignedEvent', date, undefined, undefined, undefined, assigneeItem),
    createMockTimelineItem('UnassignedEvent', date, undefined, undefined, undefined, assigneeItem),
  ]

  const rolledUpItems = rollupEvents(timelineItems)
  expect(rolledUpItems).toHaveLength(1)
  expect(rolledUpItems[0]!.rollupGroup).toBeDefined()
  expect(rolledUpItems[0]!.rollupGroup!.UnassignedEvent).toHaveLength(1) // it's the same assignee
})
