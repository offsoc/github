import {graphql} from 'relay-runtime'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {TimelineItems} from '../TimelineItems'
import type {TimelineItemsTestQuery} from './__generated__/TimelineItemsTestQuery.graphql'
import {
  makeTimelineClosedEvent,
  makeTimelineComment,
  makeTimelinePinnedEvent,
  makeTimelineLabeledEvent,
  makeTimelineReopenedEvent,
  makeTimelineAssignedEvent,
  makeTimelineUnassignedEvent,
  makeTimelineAddedToProjectV2Event,
  makeTimelineRemovedFromProjectV2Event,
  makeTimelineCrossReferenceEvent,
  toEdges,
} from '../../test-utils/payloads/Timeline'
import {renderRelayWithDefaults} from '../../test-utils/DefaultWrappers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setup = (timelineItems: any[]) => {
  renderRelayWithDefaults<{timelineItemsQuery: TimelineItemsTestQuery}>(
    ({queryData}) => (
      <TimelineItems
        issue={queryData.timelineItemsQuery.repository!.issue!.timelineItems}
        issueUrl={'https://github.com/owner/repo/issues/33'}
        currentIssueId={'issueId'}
        type={'test'}
        viewer={queryData.timelineItemsQuery.viewer.login}
        onCommentReply={() => {}}
        navigate={() => {}}
        relayConnectionIds={[]}
      />
    ),
    {
      relay: {
        queries: {
          timelineItemsQuery: {
            type: 'fragment',
            query: graphql`
              query TimelineItemsTestQuery @relay_test_operation {
                repository(owner: "owner", name: "repo") {
                  issue(number: 33) {
                    timelineItems(last: 10, before: null) {
                      ...TimelineItemsPaginated
                    }
                  }
                }
                viewer {
                  login
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          IssueTimelineItemsConnection() {
            return {
              edges: toEdges(timelineItems),
            }
          },
          Repository() {
            return {name: 'repo', owner: {login: 'owner'}}
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

describe('Timeline items tests', () => {
  test('renders basic timeline items, just comments', async () => {
    const items = [makeTimelineComment(0), makeTimelineComment(1)]
    setup(items)

    const timeline = await screen.findByTestId('issue-timeline-test')
    expect(timeline).toBeInTheDocument()

    // eslint-disable-next-line testing-library/no-node-access
    const elements = timeline.children
    expect(elements.length).toBe(items.length + 1)
    // First item is the divider
    expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-comment 0')
    for (let i = 1; i < elements.length; i++) {
      const element = elements[i]
      expect(element).toHaveTextContent(`comment body ${i - 1}`)
    }
  })

  test('renders basic timeline items, minor -> minor', async () => {
    const items = [makeTimelinePinnedEvent(0), makeTimelinePinnedEvent(1)]
    setup(items)

    const timeline = await screen.findByTestId('issue-timeline-test')
    expect(timeline).toBeInTheDocument()

    // eslint-disable-next-line testing-library/no-node-access
    const elements = timeline.children[0]!.children
    expect(elements.length).toBe(items.length + 1)

    expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-pinned_event_0')
    expect(elements[1]).toHaveTextContent(`pinned this issue`)
    expect(elements[2]).toHaveTextContent(`pinned this issue`)
  })

  test('renders basic timeline items, comment -> minor -> minor -> comment', async () => {
    const items = [
      makeTimelineComment(0),
      makeTimelinePinnedEvent(1),
      makeTimelinePinnedEvent(2),
      makeTimelineComment(3),
    ]
    setup(items)

    const timeline = await screen.findByTestId('issue-timeline-test')
    expect(timeline).toBeInTheDocument()

    // eslint-disable-next-line testing-library/no-node-access
    const elements = timeline.children
    expect(elements.length).toBe(items.length + 1) // 2 events and the divider are grouped inside a section element

    expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-comment 0')
    expect(elements[1]).toHaveTextContent(`comment body 0`)
    expect(elements[2]?.tagName).toBe('SECTION')

    // eslint-disable-next-line testing-library/no-node-access
    const eventsSection = elements[2]?.children
    expect(eventsSection![0]!.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-pinned_event_1')
    expect(eventsSection![1]).toHaveTextContent(`pinned this issue`)

    expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-comment 3')
    expect(elements[4]).toHaveTextContent(`comment body 3`)
  })

  test('renders basic timeline items, minor -> major -> major -> minor', async () => {
    const items = [
      makeTimelinePinnedEvent(0),
      makeTimelineClosedEvent(),
      makeTimelineReopenedEvent(),
      makeTimelinePinnedEvent(1),
    ]

    setup(items)

    const timeline = await screen.findByTestId('issue-timeline-test')
    expect(timeline).toBeInTheDocument()

    // eslint-disable-next-line testing-library/no-node-access
    const elements = timeline.children[0]!.children
    expect(elements.length).toBe(items.length + 3)

    expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-pinned_event_0')
    expect(elements[1]).toHaveTextContent(`pinned this issue`)
    expect(elements[2]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-closed_event')
    expect(elements[3]).toHaveTextContent(`closed this as completed`)
    expect(elements[4]).toHaveTextContent(`reopened this`)
    expect(elements[5]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-pinned_event_1')
    expect(elements[6]).toHaveTextContent(`pinned this issue`)
  })
})

test('renders basic timeline items, rolled up minor -> major -> minor', async () => {
  const items = [
    makeTimelineLabeledEvent(0),
    makeTimelineLabeledEvent(1),
    makeTimelineLabeledEvent(2),
    makeTimelineLabeledEvent(3),
    makeTimelinePinnedEvent(4),
    makeTimelineClosedEvent(),
    makeTimelineLabeledEvent(5),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(7)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-labeled_event_0')
  expect(elements[1]).toHaveTextContent(`added`)
  expect(elements[2]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-pinned_event_4')
  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-closed_event')
  expect(elements[4]).toHaveTextContent(`closed this as completed`)
  expect(elements[5]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-labeled_event_5')
})

test('renders a single cross reference event', async () => {
  const items = [makeTimelineCrossReferenceEvent('ev1', 'id1', undefined, 'some title', 1234)]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(2)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-ev1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-ev1')

  const expectedTimestamp = new Date('2021-01-01T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  expect(elements[1]).toHaveTextContent(`monalisamentioned this on ${expectedTimestamp}some title owner/repo#1234`)
})

test('renders cross reference rolled-up events', async () => {
  const items = [
    makeTimelineCrossReferenceEvent('ev1', 'id1', undefined, 'issue title 1', 1234),
    makeTimelineCrossReferenceEvent('ev2', 'id2', undefined, 'issue title 2', 5678),
  ]

  setup(items)
  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(2)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-ev1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-ev1')
  expect(elements[1]).toHaveTextContent('monalisamentioned this in 2 issues')
  expect(elements[1]).toHaveTextContent('issue title 1')
  expect(elements[1]).toHaveTextContent('issue title 2')
  expect(elements[1]).toHaveTextContent('1234')
  expect(elements[1]).toHaveTextContent('5678')
})

test('renders assigned event', async () => {
  const items = [makeTimelineAssignedEvent(1, 'assignee1')]
  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(2)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-assigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-assigned_event_1')
  expect(elements[1]).toHaveTextContent('assigned assignee1')
})

test('renders self assigned event', async () => {
  const items = [makeTimelineAssignedEvent(1)]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(2)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-assigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-assigned_event_1')
  expect(elements[1]).toHaveTextContent('self-assigned this')
})

test('renders unassigned event', async () => {
  const items = [makeTimelineUnassignedEvent(1, 'assignee1')]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(2)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-unassigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-unassigned_event_1')
  expect(elements[1]).toHaveTextContent('unassigned assignee1')
})

test('renders unassigned self event', async () => {
  const items = [makeTimelineUnassignedEvent(1)]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(2)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-unassigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-unassigned_event_1')
  expect(elements[1]).toHaveTextContent('removed their assignment')
})

test('renders rolledup assigned events', async () => {
  const items = [
    makeTimelineAssignedEvent(1, 'assignee1'),
    makeTimelineAssignedEvent(2, 'assignee2'),
    makeTimelineAssignedEvent(3, 'assignee3'),
    makeTimelineLabeledEvent(4),
    makeTimelineAssignedEvent(5, 'assignee1'),
    makeTimelineAssignedEvent(6),
    makeTimelineAssignedEvent(7, 'assignee3'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(4)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-assigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-assigned_event_1')
  expect(elements[1]).toHaveTextContent('assigned assignee1,assignee2andassignee3')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-assigned_event_5')
  expect(elements[3]).toHaveTextContent('assigned assignee1,monalisaandassignee3')
})

test('renders rolledup assigned events only for the same actor', async () => {
  const items = [
    makeTimelineAssignedEvent(1, 'assignee1', 'user1'),
    makeTimelineAssignedEvent(2, 'assignee2', 'user1'),
    makeTimelineAssignedEvent(3, 'assignee3', 'user2'),
    makeTimelineAssignedEvent(4, 'assignee4', 'user1'),
    makeTimelineAssignedEvent(5, 'assignee5', 'user1'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(4)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-assigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-assigned_event_1')
  expect(elements[1]).toHaveTextContent('user1assigned assignee1andassignee2')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-assigned_event_4')
  expect(elements[3]).toHaveTextContent('user1assigned assignee4andassignee5')
})

test('renders rolledup unassigned events only for the same actor', async () => {
  const items = [
    makeTimelineUnassignedEvent(1, 'assignee1', 'user1'),
    makeTimelineUnassignedEvent(2, 'assignee2', 'user1'),
    makeTimelineUnassignedEvent(3, 'assignee3', 'user2'),
    makeTimelineUnassignedEvent(4, 'assignee4', 'user1'),
    makeTimelineUnassignedEvent(5, 'assignee5', 'user1'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(4)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-unassigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-unassigned_event_1')
  expect(elements[1]).toHaveTextContent('user1unassigned assignee1andassignee2')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-unassigned_event_4')
  expect(elements[3]).toHaveTextContent('user1unassigned assignee4andassignee5')
})

test('renders rolledup assigned and unassigned events only for the same actor', async () => {
  const items = [
    makeTimelineUnassignedEvent(1, 'assignee1', 'user1'),
    makeTimelineAssignedEvent(2, 'assignee2', 'user1'),
    makeTimelineUnassignedEvent(3, 'assignee3', 'user1'),
    makeTimelineAssignedEvent(4, 'other', 'user2'),
    makeTimelineAssignedEvent(5, 'assignee1', 'user1'),
    makeTimelineAssignedEvent(6, 'monalisa', 'user1'),
    makeTimelineUnassignedEvent(7, 'assignee3', 'user1'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(4)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-unassigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-unassigned_event_1')
  expect(elements[1]).toHaveTextContent('user1assigned assignee2 and unassigned assignee1andassignee3')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-assigned_event_5')
  expect(elements[3]).toHaveTextContent('user1assigned assignee1andmonalisa and unassigned assignee3')
})

test('renders rolledup unassigned events', async () => {
  const items = [
    makeTimelineUnassignedEvent(1, 'assignee1'),
    makeTimelineUnassignedEvent(2, 'assignee2'),
    makeTimelineUnassignedEvent(3, 'assignee3'),
    makeTimelineLabeledEvent(4),
    makeTimelineUnassignedEvent(5, 'assignee1'),
    makeTimelineUnassignedEvent(6),
    makeTimelineUnassignedEvent(7, 'assignee3'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(4)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-unassigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-unassigned_event_1')
  expect(elements[1]).toHaveTextContent('unassigned assignee1,assignee2andassignee3')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-unassigned_event_5')
  expect(elements[3]).toHaveTextContent('unassigned assignee1,monalisaandassignee3')
})

test('renders rolledup assigned and unassigned events', async () => {
  const items = [
    makeTimelineUnassignedEvent(1, 'assignee1'),
    makeTimelineAssignedEvent(2, 'assignee2'),
    makeTimelineUnassignedEvent(3, 'assignee3'),
    makeTimelineLabeledEvent(4),
    makeTimelineAssignedEvent(5, 'assignee1'),
    makeTimelineAssignedEvent(6),
    makeTimelineUnassignedEvent(7, 'assignee3'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(4)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-unassigned_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-unassigned_event_1')
  expect(elements[1]).toHaveTextContent('monalisaassigned assignee2 and unassigned assignee1andassignee3')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-row-border-assigned_event_5')
  expect(elements[3]).toHaveTextContent('monalisaassigned assignee1andmonalisa and unassigned assignee3')
})

test('renders rolledup added to projectv2 events', async () => {
  const items = [
    makeTimelineAddedToProjectV2Event(1, 'project1'),
    makeTimelineAddedToProjectV2Event(2, 'project2'),
    makeTimelineAddedToProjectV2Event(3, 'project3'),
    makeTimelineLabeledEvent(4),
    makeTimelineAddedToProjectV2Event(5, 'project1'),
    makeTimelineAddedToProjectV2Event(6, 'project4'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(4)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-added_to_projectv2_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe(
    'timeline-row-border-added_to_projectv2_event_1',
  )
  expect(elements[1]).toHaveTextContent('monalisaadded this to project1, project2and project3')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe(
    'timeline-row-border-added_to_projectv2_event_5',
  )
  expect(elements[3]).toHaveTextContent('monalisaadded this to project1and project4')
})

test('renders rolledup removed projectv2 events', async () => {
  const items = [
    makeTimelineRemovedFromProjectV2Event(1, 'project1'),
    makeTimelineRemovedFromProjectV2Event(2, 'project2'),
    makeTimelineRemovedFromProjectV2Event(3, 'project3'),
    makeTimelineLabeledEvent(4),
    makeTimelineRemovedFromProjectV2Event(5, 'project1'),
    makeTimelineRemovedFromProjectV2Event(6, 'project4'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(4)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe(
    'timeline-divider-removed_from_projectv2_event_1',
  )
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe(
    'timeline-row-border-removed_from_projectv2_event_1',
  )
  expect(elements[1]).toHaveTextContent('monalisaremoved this from project1, project2and project3')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe(
    'timeline-row-border-removed_from_projectv2_event_5',
  )
  expect(elements[3]).toHaveTextContent('monalisaremoved this from project1and project4')
})

test('renders rolledup added to and removed from projectv2 events', async () => {
  const items = [
    makeTimelineAddedToProjectV2Event(1, 'project1'),
    makeTimelineAddedToProjectV2Event(2, 'project2'),
    makeTimelineRemovedFromProjectV2Event(3, 'project3'),
    makeTimelineLabeledEvent(4),
    makeTimelineRemovedFromProjectV2Event(5, 'project1'),
    makeTimelineRemovedFromProjectV2Event(6, 'project4'),
    makeTimelineAddedToProjectV2Event(7, 'project4', 'user1'),
    makeTimelineRemovedFromProjectV2Event(8, 'project5', 'user1'),
  ]

  setup(items)

  const timeline = await screen.findByTestId('issue-timeline-test')
  expect(timeline).toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-node-access
  const elements = timeline.children[0]!.children
  expect(elements.length).toBe(5)

  expect(elements[0]?.attributes.getNamedItem('data-testid')?.value).toBe('timeline-divider-added_to_projectv2_event_1')
  expect(elements[1]?.attributes.getNamedItem('data-testid')?.value).toBe(
    'timeline-row-border-added_to_projectv2_event_1',
  )
  expect(elements[1]).toHaveTextContent('monalisaadded this to project1and project2 and removed this from project3')

  expect(elements[3]?.attributes.getNamedItem('data-testid')?.value).toBe(
    'timeline-row-border-removed_from_projectv2_event_5',
  )
  expect(elements[3]).toHaveTextContent('monalisaremoved this from project1and project4')

  expect(elements[4]?.attributes.getNamedItem('data-testid')?.value).toBe(
    'timeline-row-border-added_to_projectv2_event_7',
  )
  expect(elements[4]).toHaveTextContent('user1added this to project4 and removed this from project5')
})
